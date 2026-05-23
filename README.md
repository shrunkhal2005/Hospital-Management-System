# Hospital Management System (HMS)

A Spring Boot hospital management backend with a deployable browser frontend.

## Live App

The deployed website is served from the Spring Boot app itself.

- Homepage: `/`
- Health: `/health`
- Users API: `/api/users`

## What is included

- Browser UI for viewing, creating, searching, and deleting users
- REST API for the same data
- JavaFX desktop app still exists in the repo for local desktop use

## Local run

```powershell
C:\Users\Dell\.maven\maven-3.9.16\bin\mvn spring-boot:run
```

Then open:

```text
http://localhost:8080/
```

## Deployment notes

The app is ready for Render or any Docker host.

If you want database persistence on the hosted site, set these environment variables on the server:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `PORT` if the platform requires it

If those are not set, the app can still start with the embedded H2 fallback for demo use.

## Desktop launcher

`Launch-HMS.bat` is the legacy local JavaFX launcher. It opens the desktop app, not the browser site.

## Main source files

- `src/main/java/com/example/SpringBootTest.java` - backend and homepage entrypoint
- `src/main/java/com/example/controller/UserController.java` - REST API
- `src/main/resources/static/index.html` - browser frontend
- `src/main/resources/static/app.js` - frontend API calls
- `src/main/resources/static/styles.css` - frontend styling

## Status

The project now includes both the backend and a real web frontend that can be deployed publicly.

