const apiBase = '/api/users';

const state = {
  users: []
};

const elements = {
  apiStatus: document.getElementById('apiStatus'),
  userCount: document.getElementById('userCount'),
  usersTable: document.getElementById('usersTable'),
  form: document.getElementById('userForm'),
  formMessage: document.getElementById('formMessage'),
  refreshBtn: document.getElementById('refreshBtn'),
  healthBtn: document.getElementById('healthBtn'),
  searchInput: document.getElementById('searchInput'),
  fullName: document.getElementById('fullName'),
  username: document.getElementById('username'),
  email: document.getElementById('email'),
  password: document.getElementById('password')
};

function showModal(title, content) {
  const root = document.getElementById('modal-root');
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.left = 0;
  overlay.style.top = 0;
  overlay.style.right = 0;
  overlay.style.bottom = 0;
  overlay.style.background = 'rgba(0,0,0,0.6)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = 1000;

  const panel = document.createElement('div');
  panel.style.background = '#0f1724';
  panel.style.color = '#e6eef8';
  panel.style.padding = '18px';
  panel.style.borderRadius = '8px';
  panel.style.maxWidth = '720px';
  panel.style.width = '90%';
  panel.style.boxShadow = '0 8px 32px rgba(0,0,0,0.6)';

  const h = document.createElement('h3');
  h.textContent = title;
  h.style.marginTop = '0';
  h.style.marginBottom = '8px';

  const pre = document.createElement('pre');
  pre.style.whiteSpace = 'pre-wrap';
  pre.style.wordBreak = 'break-word';
  pre.style.margin = 0;
  pre.style.fontFamily = 'inherit';
  pre.textContent = content;

  const close = document.createElement('button');
  close.textContent = 'Close';
  close.className = 'btn';
  close.style.marginTop = '12px';

  close.addEventListener('click', () => {
    root.removeChild(overlay);
  });

  panel.appendChild(h);
  panel.appendChild(pre);
  panel.appendChild(close);
  overlay.appendChild(panel);
  root.appendChild(overlay);
}

function setStatus(text, className) {
  elements.apiStatus.textContent = text;
  elements.apiStatus.className = `stat-value ${className}`;
}

function setMessage(text, isError = false) {
  elements.formMessage.textContent = text;
  elements.formMessage.style.color = isError ? '#ffb4c0' : '#aab4db';
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let details = '';
    try {
      details = await response.text();
    } catch (error) {
      details = response.statusText;
    }
    throw new Error(details || `Request failed with status ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

function normalizeUser(user) {
  return {
    id: user.id,
    fullName: user.fullName || '',
    username: user.username || '',
    email: user.email || '',
    createdAt: user.createdAt || ''
  };
}

function renderUsers() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const filtered = state.users.filter(user => {
    const haystack = `${user.id} ${user.fullName} ${user.username} ${user.email}`.toLowerCase();
    return haystack.includes(query);
  });

  elements.userCount.textContent = String(state.users.length);

  if (filtered.length === 0) {
    elements.usersTable.innerHTML = `
      <tr>
        <td colspan="5" style="color:#aab4db; padding: 18px;">No users found.</td>
      </tr>
    `;
    return;
  }

  elements.usersTable.innerHTML = filtered.map(user => `
    <tr>
      <td>${user.id ?? ''}</td>
      <td>${escapeHtml(user.fullName)}</td>
      <td>${escapeHtml(user.username)}</td>
      <td>${escapeHtml(user.email)}</td>
      <td>
        <div class="row-actions">
          <button class="btn btn-danger" data-delete-id="${user.id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('[data-delete-id]').forEach(button => {
    button.addEventListener('click', async () => {
      const id = button.getAttribute('data-delete-id');
      if (!confirm(`Delete user #${id}?`)) {
        return;
      }

      try {
        await request(`${apiBase}/${id}`, { method: 'DELETE' });
        await loadUsers();
        setMessage('User deleted successfully.');
      } catch (error) {
        setMessage(`Delete failed: ${error.message}`, true);
      }
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function checkHealth() {
  try {
    const result = await request('/health');
    setStatus(result.includes('running') ? 'API online' : 'API reachable', 'status-ok');
  } catch (error) {
    setStatus('API offline', 'status-bad');
  }
}

if (elements.healthBtn) {
  elements.healthBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    elements.healthBtn.disabled = true;
    elements.healthBtn.textContent = 'Checking...';
    try {
      const result = await request('/health');
      const body = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
      showModal('Service Health', body);
      setStatus('API online', 'status-ok');
    } catch (err) {
      showModal('Service Health', `Error: ${err.message}`);
      setStatus('API offline', 'status-bad');
    } finally {
      elements.healthBtn.disabled = false;
      elements.healthBtn.textContent = 'Health check';
    }
  });
}

async function loadUsers() {
  try {
    const users = await request(apiBase);
    state.users = Array.isArray(users) ? users.map(normalizeUser) : [];
    setStatus('API online', 'status-ok');
    renderUsers();
  } catch (error) {
    state.users = [];
    setStatus('API offline', 'status-bad');
    renderUsers();
    setMessage(`Unable to load users: ${error.message}`, true);
  }
}

elements.form.addEventListener('submit', async event => {
  event.preventDefault();
  setMessage('Saving user...');

  const payload = {
    fullName: elements.fullName.value.trim(),
    username: elements.username.value.trim(),
    email: elements.email.value.trim(),
    password: elements.password.value.trim() || 'change-me'
  };

  if (!payload.fullName || !payload.username || !payload.email) {
    setMessage('Please fill out full name, username, and email.', true);
    return;
  }

  try {
    await request(apiBase, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    elements.form.reset();
    await loadUsers();
    setMessage('User created successfully.');
  } catch (error) {
    setMessage(`Save failed: ${error.message}`, true);
  }
});

elements.refreshBtn.addEventListener('click', async () => {
  elements.refreshBtn.disabled = true;
  elements.refreshBtn.textContent = 'Refreshing...';
  await checkHealth();
  await loadUsers();
  elements.refreshBtn.textContent = 'Refresh data';
  elements.refreshBtn.disabled = false;
});

elements.searchInput.addEventListener('input', renderUsers);

Promise.all([checkHealth(), loadUsers()]).catch(() => {});