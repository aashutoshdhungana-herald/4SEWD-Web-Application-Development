# Building a REST Todo-List API with Express (ESM)

## Overview

In this tutorial, you'll build a simple REST API for a todo-list application using **Express**, Node's most popular web framework. Unlike the raw `http` module server you built previously, Express gives you cleaner routing, easier request/response handling, and a more maintainable project structure.

You'll store todos in an **in-memory array** (no database), use **ES Modules** (`import`/`export`) instead of CommonJS, and use **nodemon** to automatically restart the server as you make changes.

**What you'll learn:**

- How to set up an Express project using ES Modules
- How to structure a small Express application into folders (routes, controllers, data)
- How to build a full REST API (Create, Read, Update, Delete)
- How to work with the `req` and `res` objects in Express
- How to write simple backend validation checks
- How to use `nodemon` for a faster development workflow

---

## Prerequisites

- Basic familiarity with JavaScript (functions, objects, arrays, conditionals)
- Completion of the previous "Basic HTTP Server with Node.js" tutorial (helpful but not required)
- A code editor (VS Code recommended)
- A terminal / command line
- Node.js installed (`node -v` to confirm)

---

## The Todo Data Model

Each todo item in this app has three fields:

| Field      | Type      | Description                             |
| ---------- | --------- | --------------------------------------- |
| `title`    | `string`  | The name/description of the task        |
| `deadline` | `string`  | Due date for the task (ISO date string) |
| `isUrgent` | `boolean` | Whether the task is marked as urgent    |

Example todo object:

```json
{
  "id": 1,
  "title": "Submit assignment",
  "deadline": "2026-07-15",
  "isUrgent": true
}
```

The `id` field is generated automatically by the server — you don't send it when creating a todo.

---

## Step 1: Create a New Project

1. Create a new folder named `todo-api`.
2. Open the folder in VS Code (`code todo-api` from the terminal, or via **File > Open Folder**).
3. Open an integrated terminal inside the project folder (`` Ctrl+` `` in VS Code).

---

## Step 2: Initialize the Project

Run the following command inside the `todo-api` folder:

```bash
npm init -y
```

Open the generated `package.json` and add `"type": "module"` so Node treats your files as ES Modules (enabling `import`/`export` syntax instead of `require`):

```json
{
  "name": "todo-api",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js"
}
```

---

## Step 3: Install Dependencies

Install **Express** as a regular dependency, and **nodemon** as a dev dependency (it's only needed during development, not in production):

```bash
npm install express
npm install --save-dev nodemon
```

> No other libraries are needed for this project — no body-parser, no database drivers. Express's built-in `express.json()` middleware handles parsing JSON request bodies.

Add convenience scripts to `package.json`:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

Now you can run `npm run dev` while building the app, and the server will restart automatically every time you save a file.

---

## Step 4: Set Up the Folder Structure

Rather than putting everything in one file, split the app into logical pieces. Create the following structure:

```text
todo-api
│
├── data/
│   └── todos.js
├── controllers/
│   └── todoController.js
├── routes/
│   └── todoRoutes.js
├── server.js
├── package.json
└── package-lock.json
```

- **`data/`** — holds the in-memory array acting as our "database"
- **`controllers/`** — contains the actual logic for each route (reading the array, validating input, sending responses)
- **`routes/`** — defines the URL paths and which controller function handles each one
- **`server.js`** — the entry point that wires everything together and starts the server

This separation mirrors how larger, real-world Express apps are organized.

---

## Step 5: Create the In-Memory Data Store

Inside `data/todos.js`, export an array that will hold all todo items for as long as the server is running. Since it's just a JavaScript array in memory, all data resets when the server restarts.

```js
// data/todos.js
export const todos = [
  { id: 1, title: "Buy groceries", deadline: "2026-07-12", isUrgent: false },
  {
    id: 2,
    title: "Finish project report",
    deadline: "2026-07-11",
    isUrgent: true,
  },
];

// Keeps track of the next id to assign, so ids stay unique
// even after items are deleted.
export let nextId = 3;

export function incrementNextId() {
  nextId++;
}
```

---

## Step 6: Build the Controllers

Controllers contain the actual logic for handling each request: reading from the array, validating incoming data, and sending the response.

Create `controllers/todoController.js`:

```js
// controllers/todoController.js
import { todos, nextId, incrementNextId } from "../data/todos.js";

// GET /api/todos — return all todos
export function getAllTodos(req, res) {
  res.status(200).json(todos);
}

// GET /api/todos/:id — return a single todo
export function getTodoById(req, res) {
  const id = Number(req.params.id);
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }

  res.status(200).json(todo);
}

// POST /api/todos — create a new todo
export function createTodo(req, res) {
  const { title, deadline, isUrgent } = req.body;

  // Basic validation
  if (!title || typeof title !== "string" || title.trim() === "") {
    return res
      .status(400)
      .json({ error: "Title is required and must be a non-empty string" });
  }

  if (!deadline || isNaN(Date.parse(deadline))) {
    return res
      .status(400)
      .json({ error: "Deadline is required and must be a valid date" });
  }

  if (typeof isUrgent !== "boolean") {
    return res
      .status(400)
      .json({ error: "isUrgent is required and must be true or false" });
  }

  const newTodo = {
    id: nextId,
    title: title.trim(),
    deadline,
    isUrgent,
  };

  todos.push(newTodo);
  incrementNextId();

  res.status(201).json(newTodo);
}

// PUT /api/todos/:id — update an existing todo
export function updateTodo(req, res) {
  const id = Number(req.params.id);
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }

  const { title, deadline, isUrgent } = req.body;

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      return res
        .status(400)
        .json({ error: "Title must be a non-empty string" });
    }
    todo.title = title.trim();
  }

  if (deadline !== undefined) {
    if (isNaN(Date.parse(deadline))) {
      return res.status(400).json({ error: "Deadline must be a valid date" });
    }
    todo.deadline = deadline;
  }

  if (isUrgent !== undefined) {
    if (typeof isUrgent !== "boolean") {
      return res.status(400).json({ error: "isUrgent must be true or false" });
    }
    todo.isUrgent = isUrgent;
  }

  res.status(200).json(todo);
}

// DELETE /api/todos/:id — remove a todo
export function deleteTodo(req, res) {
  const id = Number(req.params.id);
  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }

  const deleted = todos.splice(index, 1);

  res.status(200).json({ message: "Todo deleted", todo: deleted[0] });
}
```

**Note on validation:** `isNaN(Date.parse(deadline))` is a simple way to check whether a string can be interpreted as a valid date — it's not perfect, but it's enough for this learning exercise.

---

## Step 7: Define the Routes

Routes map an HTTP method + URL path to the controller function that should handle it.

Create `routes/todoRoutes.js`:

```js
// routes/todoRoutes.js
import { Router } from "express";
import {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../controllers/todoController.js";

const router = Router();

router.get("/", getAllTodos);
router.get("/:id", getTodoById);
router.post("/", createTodo);
router.put("/:id", updateTodo);
router.delete("/:id", deleteTodo);

export default router;
```

---

## Step 8: Wire Everything Together in `server.js`

This is the entry point. It creates the Express app, registers middleware, mounts the routes, and starts listening.

```js
// server.js
import express from "express";
import todoRoutes from "./routes/todoRoutes.js";

const app = express();
const PORT = 3000;

// Middleware to parse JSON request bodies (built into Express — no extra library needed)
app.use(express.json());

// Mount all todo routes under /api/todos
app.use("/api/todos", todoRoutes);

// Catch-all for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

`req.body` only works because of the `express.json()` middleware — without it, Express won't parse incoming JSON, and `req.body` would be `undefined`.

---

## Step 9: Test the Server

Start the server in development mode so it restarts automatically on changes:

```bash
npm run dev
```

You should see:

```text
Server is running on http://localhost:3000
```

Test each route using a tool like **Postman**, **Thuderclient**, or `curl`:

| Method   | URL              | Body Example                                                            | Expected Result              |
| -------- | ---------------- | ----------------------------------------------------------------------- | ---------------------------- |
| `GET`    | `/api/todos`     | —                                                                       | Array of all todos           |
| `GET`    | `/api/todos/1`   | —                                                                       | Single todo with `id: 1`     |
| `POST`   | `/api/todos`     | `{ "title": "Read book", "deadline": "2026-07-20", "isUrgent": false }` | `201` + newly created todo   |
| `PUT`    | `/api/todos/1`   | `{ "isUrgent": true }`                                                  | `200` + updated todo         |
| `DELETE` | `/api/todos/1`   | —                                                                       | `200` + confirmation message |
| `GET`    | `/api/todos/999` | —                                                                       | `404` — "Todo not found"     |
| `POST`   | `/api/todos`     | `{ "deadline": "2026-07-20", "isUrgent": false }` (missing title)       | `400` — validation error     |

To stop the server at any time, press `Ctrl + C` in the terminal.

---

## Challenge: Extend the API

Once the basic CRUD routes work, try adding the following:

### 1. Filter by urgency

Support `GET /api/todos?urgent=true` to return only todos where `isUrgent` is `true`. Read the query parameter from `req.query.urgent` inside `getAllTodos`.

### 2. Sort by deadline

Support `GET /api/todos?sortBy=deadline` to return todos sorted from soonest to latest deadline.

### 3. Overdue check

Add a computed field when returning todos — e.g. `isOverdue: true` — if the `deadline` has already passed compared to the current date.

### 4. Stricter validation

Improve the validation in `createTodo` and `updateTodo` so that:

- `title` has a maximum length (e.g. 100 characters)
- `deadline` cannot be a date in the past when creating a new todo

---

## Full Route Reference

| Route             | Method   | Description             |
| ----------------- | -------- | ----------------------- |
| `/api/todos`      | `GET`    | Get all todos           |
| `/api/todos/:id`  | `GET`    | Get a single todo by id |
| `/api/todos`      | `POST`   | Create a new todo       |
| `/api/todos/:id`  | `PUT`    | Update an existing todo |
| `/api/todos/:id`  | `DELETE` | Delete a todo           |
| _(anything else)_ | any      | `404 - Route not found` |

---

## Final Project Structure

```text
todo-api
│
├── data/
│   └── todos.js
├── controllers/
│   └── todoController.js
├── routes/
│   └── todoRoutes.js
├── server.js
├── package.json
└── package-lock.json
```
