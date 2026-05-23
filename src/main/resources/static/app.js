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
  searchInput: document.getElementById('searchInput'),
  fullName: document.getElementById('fullName'),
  username: document.getElementById('username'),
  email: document.getElementById('email'),
  password: document.getElementById('password')
};

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