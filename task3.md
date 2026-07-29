# Deployment Guide: Todo App (Client + Server) to Render

This guide walks through deploying the full-stack Todo app: the Express **server** and the React/Vite **client**, starting from pushing your code to GitHub, through setting up Render, to configuring environment variables end-to-end.

---

## 0. Prerequisites

- A GitHub account
- A Render account → https://render.com
- Git installed locally, and the project running locally already
- This guide assumes the server uses **SQLite** (a local `.sqlite`/`.db` file), as configured via `DB_PATH` in `server/.env`

> **Note on SQLite on Render:** Render's filesystem is ephemeral, meaning the SQLite file resets whenever the service redeploys or restarts. This guide deploys SQLite as a normal local file (no persistent disk), which is the simplest setup. Just be aware that data won't survive a redeploy. If you later want data to persist across deploys, you'd add a Render Disk, but that's not covered here.

---

## 1. Prepare the repo for deployment

### 1.1 Add a root `.gitignore` (if not already present)

Make sure these are ignored so secrets and build artifacts never get committed:

```
node_modules/
.env
.env.local
dist/
build/
```

### 1.2 Create `.env.example` files (recommended, not required)

In `server/`, create `server/.env.example` listing the variable **names** only (no real values), matching your actual `server/.env`:

```
PORT=3000
DB_PATH=./database.sqlite
CORS_ORIGIN=http://localhost:5173
CORS_METHOD=GET,POST,PUT,DELETE
JWT_SECRET=replace-with-a-long-random-string
```

`DB_PATH` is what your app reads for the SQLite file location. On Render this will just be a normal relative path like `./database.sqlite`, same as local — no persistent disk setup.

In `client/`, create `client/.env.example`:

```
VITE_API_BASE_DEV=http://localhost:3000
VITE_API_BASE_PROD=http://my-app.com
```

Then create the real `client/.env` locally (not committed) with the same two variables — Vite automatically loads `.env` files, and `import.meta.env.DEV` / `import.meta.env.PROD` (set automatically by Vite) let your code pick the right one depending on whether you're running `npm run dev` or a production build.

### 1.3 Confirm build scripts exist

- `client/package.json` should have:
  ```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
  ```
- `server/package.json` should have a start script, e.g.:
  ```json
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "postinstall": "npm rebuild sqlite3 --build-from-source"
  }
  ```

### 1.4 Make sure the client calls the server via an env variable

In `client/src/api.js`, pick the base URL based on whether Vite is running in dev or prod mode, using the two env vars from step 1.2:

```js
// api.js
const API_BASE_URL = import.meta.env.DEV
  ? import.meta.env.VITE_API_BASE_DEV
  : import.meta.env.VITE_API_BASE_PROD;

export default API_BASE_URL;
```

- `import.meta.env.DEV` is `true` automatically when running `npm run dev`, and `import.meta.env.PROD` is `true` automatically in a production build (`npm run build`). Vite sets these for you, no extra config needed.
- Use `API_BASE_URL` as the prefix for every fetch/axios call in `api.js` and `TaskService.js`, e.g. `` `${API_BASE_URL}/api/todos` ``.
- Do this **before pushing to GitHub**, so the production build picks up `VITE_API_BASE_PROD` correctly once deployed.

### 1.5 Make sure the server allows CORS from the deployed client

In `server/src/app.js`, configure CORS using your existing `CORS_ORIGIN` and `CORS_METHOD` env variables instead of hardcoding them:

```js
const cors = require("cors");
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: process.env.CORS_METHOD?.split(","),
  }),
);
```

Locally your `.env` has `CORS_ORIGIN=http://localhost:5173` (the Vite dev server). In production, you'll change this on Render to your deployed client URL (step 6).

---

## 2. Push the code to GitHub

### 2.1 Initialize git (skip if already a git repo)

```bash
cd path/to/your/project-root
git init
git add .
git commit -m "Initial commit: todo app ready for deployment"
```

### 2.2 Create a new repository on GitHub

1. Go to https://github.com/new
2. Name the repo (e.g., `todo-app`)
3. Leave it empty (no README/gitignore, since you already have files locally)
4. Click **Create repository**

### 2.3 Connect and push

GitHub will show you commands like this — run them:

```bash
git remote add origin https://github.com/<your-username>/todo-app.git
git branch -M main
git push -u origin main
```

Confirm the push worked by refreshing the GitHub repo page — you should see `client/` and `server/` folders there.

---

## 3. Create your Render account

1. Go to https://render.com and click **Get Started**
2. Sign up (easiest: **Sign up with GitHub**, since this auto-authorizes Render to see your repos)
3. Verify your email if prompted
4. You'll land on the Render **Dashboard**

---

## 4. Deploy the server (Express API) as a Web Service

1. In the Render Dashboard, click **New +** → **Web Service**
2. Connect your GitHub account if not already connected, then select your `todo-app` repository
3. Configure the service:
   - **Name**: `todo-server` (or your choice)
   - **Root Directory**: `server` (important — since server code lives in a subfolder)
   - **Region**: closest to you
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid, your choice)
4. Under **Environment Variables**, click **Add Environment Variable** and add each one your server needs, based on your `server/.env`:

   | Key           | Value                                                                                                                                                       |
   | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `PORT`        | Render sets this automatically at runtime — you can still add `PORT=3000` as a fallback for local parity, but make sure `server.js` uses `process.env.PORT` |
   | `DB_PATH`     | `./database.sqlite` (same relative path as local — no disk setup needed)                                                                                    |
   | `CORS_ORIGIN` | leave blank for now — you'll fill this in after deploying the client (step 6)                                                                               |
   | `CORS_METHOD` | `GET,POST,PUT,DELETE`                                                                                                                                       |
   | `JWT_SECRET`  | a long random secret string (generate a fresh one for production — don't reuse your local dev secret)                                                       |

5. Click **Create Web Service**
6. Render will pull the repo, run `npm install`, then `npm start`. Watch the **Logs** tab for errors.
7. Once live, Render gives you a URL like:
   ```
   https://todo-server.onrender.com
   ```
   Save this, the client needs it.

### 4.1 Running your database sync script

Since the SQLite file starts out empty, `server/src/scripts/syncDb.js` needs to run at least once to create tables. Options:

- Have `server.js` call the sync automatically on boot if the DB file doesn't exist yet (common pattern with Sequelize's `sequelize.sync()`), or
- Temporarily set the **Build Command** to `npm install && node src/scripts/syncDb.js`, deploy once, then change the Build Command back to `npm install` for subsequent deploys.

> **Heads up:** because this deploy uses SQLite as a normal file with no persistent disk, the database resets to empty every time the service redeploys or restarts (Render's filesystem is ephemeral). If you're just testing/demoing the app, this is fine. If you need data to actually persist between deploys, you'd need a Render Disk or a hosted database

---

## 5. Deploy the client (React/Vite) as a Static Site

1. In the Render Dashboard, click **New +** → **Static Site**
2. Select the same `todo-app` repository
3. Configure the site:
   - **Name**: `todo-client` (or your choice)
   - **Root Directory**: `client`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist` (Vite's default build output folder)
4. Under **Environment Variables**, add:

   | Key                  | Value                                                                                   |
   | -------------------- | --------------------------------------------------------------------------------------- |
   | `VITE_API_BASE_DEV`  | `http://localhost:3000` (unused in production, but harmless to include for consistency) |
   | `VITE_API_BASE_PROD` | the server URL from step 4, e.g. `https://todo-server.onrender.com`                     |

   Since Vite bakes `import.meta.env.PROD` to `true` during `npm run build`, your `api.js` logic from step 1.4 will automatically use `VITE_API_BASE_PROD` here.

5. Click **Create Static Site**
6. Once deployed, Render gives you a client URL like:
   ```
   https://todo-client.onrender.com
   ```

---

## 6. Connect the two: update CORS on the server

1. Go back to your **server** service in Render → **Environment**
2. Set `CORS_ORIGIN` to the client URL from step 5, e.g.:
   ```
   CORS_ORIGIN=https://todo-client.onrender.com
   ```
3. Save — Render will automatically redeploy the server with the new variable.

---

## 7. Verify the deployment

1. Open the client URL in your browser.
2. Try registering a user, logging in, and creating a todo.
3. Open browser DevTools → Network tab to confirm requests go to your server URL and return 2xx responses.
4. If you see CORS errors, double check `CORS_ORIGIN` on the server exactly matches the client's URL (no trailing slash mismatch).
5. If the server errors out about the database file/tables not existing, confirm the sync script ran at least once (step 4.1).
6. Remember: since there's no persistent disk, any todos you create will disappear the next time the server redeploys or restarts. That's expected with this setup.

---

## 8. Ongoing deploys

Render auto-deploys on every push to `main` by default. Your typical workflow going forward:

```bash
git add .
git commit -m "Some change"
git push
```

Both services will pick up the change and redeploy automatically. You can also disable auto-deploy and trigger manual deploys from the Render dashboard if you prefer more control.

---

## Summary of Environment Variables

**Server (`server/.env` locally → Render env vars in production):**

- `PORT` — Render auto-sets this at runtime; make sure `server.js` reads `process.env.PORT`
- `DB_PATH` — `./database.sqlite`, same as local — no disk/persistence setup
- `CORS_ORIGIN` — locally `http://localhost:5173`; in production, your deployed client URL
- `CORS_METHOD` — `GET,POST,PUT,DELETE`
- `JWT_SECRET` — secret for signing auth tokens (use a fresh, long random value in production)

**Render-specific note:** SQLite is deployed as a normal file here, with no persistent disk. That means the database resets to empty on every redeploy or restart — fine for testing/demos, but not for data you need to keep long-term.

**Client (`client/.env` locally → Render env vars in production):**

- `VITE_API_BASE_DEV` — `http://localhost:3000`, used automatically when running `npm run dev`
- `VITE_API_BASE_PROD` — your deployed server URL, used automatically in the production build
