# Connecting the Client and Server, Toasts, and Loading States

In Task 3 the server moved to a real database with Sequelize, and in Task 4
the client got routing with `react-router`. Up to now the two have lived in
separate folders and the client has been talking to `localforage` in the
browser instead of the actual API.

In this task you bring both projects together under one `task5` folder, swap
`TaskService.js` over to the Fetch API so it talks to your Express server,
open up CORS so the browser is allowed to call it, and round the UI out with
toast notifications and loading states.

You will learn:

| Piece                   | What it is                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------- |
| **`cors` middleware**   | Express middleware that adds the headers browsers require for cross-origin requests |
| **Fetch-based service** | Replacing local storage calls with `fetch` calls to your API                        |
| **Toast library**       | A small library (`react-hot-toast`) for success/error popups                        |
| **Loading state**       | Local component state that tracks in-flight requests                                |

---

## 1. Create the project folder

Create a `task5` folder with `client` and `server` subfolders, and copy your
existing projects into them:

```
task5/
│
├── client/     ← copy your todo-app-initial (React) project here
└── server/     ← copy your todo-app (Express + Sequelize) project here
```

```bash
mkdir -p task5/client task5/server
cp -r todo-app-initial/* task5/client/
cp -r todo-app/* task5/server/
```

Open two terminals, one in `task5/client` and one in `task5/server`, since
you'll be running both projects side by side from now on.

---

## 2. Add a CORS policy to the server

Install the `cors` package:

```bash
cd task5/server
npm install cors
```

Update `src/app.js` to apply it before your routes:

```js
import express from "express";
import cors from "cors";
import todoRoutes from "./routes/todoRoutes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // your Vite dev server
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);
app.use(express.json());
app.use("/api/todo", todoRoutes);

export default app;
```

Without this, the browser blocks any request the React app makes to a
different origin (`localhost:5173` calling `localhost:3000`) with a CORS
error in the console, even though the request itself is valid.

## 3. Update `TaskService.js` to use the Fetch API

Replace the `localforage` calls with `fetch` calls against your API. Every
function stays `async`, but now awaits a network request instead of a local
store.

```js
const API_BASE = "http://localhost:3000/api/todo";

async function handleResponse(response) {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with ${response.status}`);
  }
  return response.json();
}

export async function getTasks() {
  const response = await fetch(API_BASE);
  return handleResponse(response);
}

export async function getTaskById(id) {
  const response = await fetch(`${API_BASE}/${id}`);
  return handleResponse(response);
}

export async function createTask(title, deadline, isUrgent) {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, deadline, isUrgent }),
  });
  return handleResponse(response);
}

export async function updateTask(id, task) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return handleResponse(response);
}

export async function deleteTask(id) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}
```

`generateUniqueId` is no longer needed here since Sequelize assigns the
`id` when the row is created, so the import can be removed.

---

## 4. Add a toast library to the React app

Install `react-hot-toast`:

```bash
cd task5/client
npm install react-hot-toast
```

Mount the `<Toaster />` once near the top of the app, in `App.jsx`:

```JSX
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <PageTitle />
      <NavBar />
      <Routes>{/* ...existing routes... */}</Routes>
    </BrowserRouter>
  );
}
```

---

## 5. Add loading state and toast feedback

### `TaskContainer`

Track a `loading` flag while the task list is being fetched, and fire a
toast if it fails.

```JSX
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getTasks } from "../../services/TaskService";
import TaskItem from "../TaskItem/TaskItem";

function TaskContainer({ containerTitle }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (err) {
        toast.error("Could not load tasks");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  if (loading) {
    return <p>Loading tasks...</p>;
  }

  return (
    <div>
      <h2>{containerTitle}</h2>
      <ul>
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ul>
    </div>
  );
}

export default TaskContainer;
```

### `Form`

Disable the submit button and show a success or error toast around
`createTask`.

```JSX
import { useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { createTask } from "../../services/TaskService";

function Form() {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createTask(title, deadline, isUrgent);
      toast.success("Task saved successfully");
      navigate("/");
    } catch (err) {
      toast.error("Could not save task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ...existing fields... */}
      <button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Save Task"}
      </button>
    </form>
  );
}

export default Form;
```

### `TaskDetail`

Same pattern: a `loading` flag while the fetch is in flight, and a toast if
the task can't be found or the request fails.

```JSX
import { useState, useEffect } from "react";
import { useParams } from "react-router";
import toast from "react-hot-toast";
import { getTaskById } from "../../services/TaskService";

function TaskDetail() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTask = async () => {
      setLoading(true);
      try {
        const foundTask = await getTaskById(id);
        setTask(foundTask);
      } catch (err) {
        toast.error("Could not load task details");
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [id]);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!task) {
    return <h2>Task not found</h2>;
  }

  return (
    <div>
      <h2>{task.title}</h2>
      <p>Deadline: {task.deadline}</p>
      <p>{task.isUrgent ? "Urgent" : "Not Urgent"}</p>
    </div>
  );
}

export default TaskDetail;
```

---

## 6. Try it out

```bash
# terminal 1
cd task5/server
npm install
npm run db:sync
npm run dev

# terminal 2
cd task5/client
npm install
npm run dev
```

- Visit the React app, and confirm the task list loads with a brief
  "Loading tasks..." state
- Add a task and confirm a success toast appears and you're redirected home
- Stop the server and try adding a task again. Confirm an error toast
  appears instead of the app breaking silently

---

## Final checklist

- [ ] `task5/client` and `task5/server` folders created with the copied projects
- [ ] `cors` installed and configured on the server for the client's origin
- [ ] `TaskService.js` rewritten to use `fetch` against the Express API
- [ ] `react-hot-toast` installed with `<Toaster />` mounted in `App.jsx`
- [ ] `TaskContainer`, `Form`, and `TaskDetail` each show a loading state
- [ ] Success and error toasts fire for create, fetch, update, and delete actions
- [ ] All service calls and component effects use `async`/`await`
