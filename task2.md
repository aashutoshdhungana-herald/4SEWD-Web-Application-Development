# Wiring Up the Frontend: AuthContext, Login/Register Pages, and Protected Routes

Task 1 built the server side of auth: a `User` table, `register` / `login`
/ `logout` routes, JWT issuing and verification, and ownership checks on
every todo route. Right now, though, the React client has no idea any of
that exists. There's no login form, no way to store the token, and every
call in `TaskService.js` will now fail with `401 Not authenticated`.

In this task you build a small `apiRequest` helper, an `AuthContext` built
on top of it, `Login` and `Register` pages, a `ProtectedRoute` guard, and
you'll directly edit your existing `TaskService.js` and `App.jsx` so the
whole app actually uses them.

You will learn:

| Piece                   | What it is                                                                       |
| ----------------------- | -------------------------------------------------------------------------------- |
| **`apiRequest` helper** | One function all network calls (auth and todos alike) route through              |
| **`AuthContext`**       | A Context + Provider exposing `user`, `token`, `login`, `register`, `logout`     |
| **`useAuth` hook**      | A thin wrapper around `useContext(AuthContext)`                                  |
| **Session restore**     | Reading a saved token from `localStorage` on app load, with an `isLoading` guard |
| **`ProtectedRoute`**    | A wrapper component that redirects to `/login` if there's no logged-in user      |
| **`TaskService.js`**    | Updated to send the JWT on every request instead of calling `fetch` on its own   |
| **`App.jsx`**           | Updated to add `/login` and `/register` routes and protect the existing ones     |

---

## 1. Build the shared `apiRequest` helper

Add this next to `TaskService.js`: it's the one function every network
call in the app, auth or todo, will route through.

`src/api.js`:

```js
const API_BASE = "http://localhost:3000/api";

export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data;
}
```

`token` is optional: `register` and `login` are called with no token
(there's no session yet), while todo requests and `logout` pass one once
`AuthContext` has it.

---

## 2. Create the `AuthContext`, built on top of `apiRequest`

`src/context/AuthContext.jsx`:

```jsx
import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, try to restore a session from localStorage.
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    setIsLoading(false);
  }, []);

  function persistSession(data) {
    const loggedInUser = {
      id: data.id,
      username: data.username,
      fullName: data.fullName,
    };

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    setToken(data.token);
    setUser(loggedInUser);
  }

  async function register({ firstName, lastName, username, password }) {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: { firstName, lastName, username, password },
    });

    persistSession(data);
  }

  async function login({ username, password }) {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: { username, password },
    });

    persistSession(data);
  }

  async function logout() {
    try {
      await apiRequest("/auth/logout", { method: "POST", token });
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    }
  }

  const value = { user, token, isLoading, register, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

`register`, `login`, and `logout` never touch `fetch`, headers, or JSON
parsing directly, they describe _what_ request to make, and `apiRequest`
handles _how_. `user` and `token` are cached in `localStorage` under
separate keys so a page refresh can restore both without re-hitting the
server; the `useEffect` above is what makes the session survive a refresh.

---

## 3. Update `TaskService.js` to send the JWT

Replace your current `TaskService.js` with this version. It keeps the
same exported function names and parameter order you already have:
`createTask(title, deadline, isUrgent)` stays first-three-args the same,
it just adds a `token` as the last argument to every function, and routes
through `apiRequest` instead of calling `fetch` and `handleResponse`
itself.

`TaskService.js`:

```js
import { apiRequest } from "./api";

export async function getTasks(token) {
  return apiRequest("/todo", { token });
}

export async function getTaskById(id, token) {
  return apiRequest(`/todo/${id}`, { token });
}

export async function updateTask(id, task, token) {
  return apiRequest(`/todo/${id}`, {
    method: "PUT",
    body: task,
    token,
  });
}

export async function createTask(title, deadline, isUrgent, token) {
  return apiRequest("/todo", {
    method: "POST",
    body: { title, deadline, isUrgent },
    token,
  });
}

export async function deleteTask(id, token) {
  return apiRequest(`/todo/${id}`, { method: "DELETE", token });
}
```

Every place that currently calls `getTasks()`, `createTask(...)`, etc.
(likely inside `TaskContainer`, `AddTodo`, and `TodoDetail`) now needs a
`token` argument. Pull it from `useAuth()` at the top of each of those
components:

```jsx
import { useAuth } from "../context/AuthContext";
import { getTasks } from "../TaskService";

const { token } = useAuth();

useEffect(() => {
  getTasks(token).then(setTasks);
}, [token]);
```

---

## 4. Build a `ProtectedRoute` component

`src/components/ProtectedRoute.jsx`:

```jsx
import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

Checking `isLoading` first is what prevents an already-logged-in user from
being bounced to `/login` for a split second while `AuthProvider` is still
reading `localStorage` on page refresh.

---

## 5. Add `Login` and `Register` pages

`src/pages/Login.jsx`:

```jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await login({ username, password });
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Log In</h2>
      {error && <p role="alert">{error}</p>}
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Log In</button>
      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </form>
  );
}
```

`src/pages/Register.jsx` follows the same shape, calling `register({
firstName, lastName, username, password })` with extra `firstName` /
`lastName` fields, then navigating to `"/"` on success

---

## 6. Update `App.jsx`

Wrap the app in `AuthProvider`, add the `/login` and `/register` routes,
and wrap the existing routes (`Home`, `AddTodo`, `TodoDetail`) in
`ProtectedRoute` so they redirect to `/login` when there's no user.

`App.jsx`:

```jsx
import PageTitle from "./components/PageTitle/PageTitle";
import NavBar from "./components/NavBar/NavBar";
import Home from "./pages/Home";
import AddTodo from "./pages/AddTodo";
import TodoDetail from "./pages/TodoDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <PageTitle />
      <BrowserRouter>
        <AuthProvider>
          <NavBar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              index
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/todo/add"
              element={
                <ProtectedRoute>
                  <AddTodo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/todo/:id"
              element={
                <ProtectedRoute>
                  <TodoDetail />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
```

A few things changed from your original `App.jsx`:

- `AuthProvider` now sits inside `BrowserRouter`, wrapping everything that
  needs `useAuth()` (including `NavBar`, since it'll show the logged-in
  user next).
- `Login` and `Register` are added as public routes, outside
  `ProtectedRoute`.
- `Home`, `AddTodo`, and `TodoDetail` are each wrapped in `ProtectedRoute`
  so an unauthenticated visitor gets redirected to `/login` instead of
  hitting a `401` from the API.

---

## 7. Update `NavBar` to show the user and a logout button

In your existing `NavBar` component, pull in `useAuth()` and add a welcome
message plus a logout button:

```jsx
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";

// inside your NavBar component:
const { user, logout } = useAuth();
const navigate = useNavigate();

async function handleLogout() {
  await logout();
  navigate("/login");
}

// in the JSX, alongside your existing nav links:
{
  user && (
    <>
      <span>Welcome, {user.fullName}</span>
      <button onClick={handleLogout}>Log Out</button>
    </>
  );
}
```

Adjust the import path (`../../context/AuthContext`) to match where
`NavBar.jsx` actually lives relative to `src/context/`.

---

## 8. Try it out

```bash
cd {yourFolder}/server
npm run dev
```

```bash
cd {yourFolder}/client
npm run dev
```

- Visit `/register`, create an account with `firstName`, `lastName`,
  `username`, and `password`
- Confirm you land on the home page and see "Welcome, `<fullName>`" in
  the nav
- Refresh the page — confirm you're still logged in (no flash of the
  login page)
- Click **Log Out** — confirm you're redirected to `/login`
- Try visiting `/`, `/todo/add`, or `/todo/:id` directly while logged out
  — confirm each redirects to `/login` instead of showing a broken or
  `401`-erroring page
- Open dev tools → Application → Local Storage, and confirm `token` and
  `user` are present after login and removed after logout
- Create a second account and confirm it only ever sees its own todos,
  never the first account's

---
