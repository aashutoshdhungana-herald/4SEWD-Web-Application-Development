# Restructuring the To-Do App into a Layered Project

This guide walks through splitting the single `index.js` file from the starter-app into a proper
layered structure:

```
project/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── app.js
│   └── server.js
│
├── .env
├── package.json
└── README.md
```

**Layer responsibilities**

| Layer          | Responsibility                                                    |
| -------------- | ----------------------------------------------------------------- |
| `config/`      | Environment/config values (port, etc.)                            |
| `models/`      | Data storage + id generation (in-memory "database")               |
| `services/`    | Business logic that operates on models                            |
| `controllers/` | Request/response handling — calls services, shapes HTTP responses |
| `middleware/`  | Cross-cutting concerns — error handling (404, generic errors)     |
| `routes/`      | Maps URLs + HTTP verbs to controller functions                    |
| `app.js`       | Builds the Express app (middleware, routes) — no `listen()`       |
| `server.js`    | Imports `app.js` and starts listening — the actual entry point    |

---

## 1. `.env`

This file contains the environment variables. Environment variables are loaded by our application to configure the application. You put things like password, secret keys, db connection string here instead of hard coding them in code. .env file with actual secrets is not pushed to the github repository.

```env
PORT=3000
```

---

## 2. `src/config/index.js`

```js
import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
};
```

---

## 3. `src/models/todoModel.js`

Holds the raw in-memory data and the id generator. No
Express-specific code lives here.

```js
const todoList = [];

const createIdGenerator = (start = 1) => {
  let counter = start;
  return {
    nextId: () => counter++,
    currentId: () => counter,
  };
};

const idGen = createIdGenerator();

export const TodoModel = {
  getAll: () => todoList,

  getById: (id) => todoList.find((t) => t.id === id),

  create: ({ title, deadline, isUrgent }) => {
    const newTodo = {
      id: idGen.nextId(),
      title,
      deadline,
      isUrgent,
    };
    todoList.push(newTodo);
    return newTodo;
  },

  findIndexById: (id) => todoList.findIndex((t) => t.id === id),

  deleteByIndex: (idx) => todoList.splice(idx, 1)[0],
};
```

---

## 4. `src/services/todoService.js`

The todo service hold all the business logic related to the ToDo List item.

```js
import { TodoModel } from "../models/todoModel.js";

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

const validateTitle = (title) => {
  if (!title || typeof title !== "string" || title.trim() === "") {
    throw new ValidationError("Title is required and must be non empty");
  }
};

const validateDeadline = (deadline) => {
  if (!deadline || isNaN(Date.parse(deadline))) {
    throw new ValidationError("Deadline is required and must be a valid date");
  }
};

const validateIsUrgent = (isUrgent) => {
  if (typeof isUrgent !== "boolean") {
    throw new ValidationError("isUrgent is required and must be true or false");
  }
};

export const TodoService = {
  getAllTodos: () => TodoModel.getAll(),

  getTodoById: (id) => TodoModel.getById(id),

  createTodo: (data) => {
    validateTitle(data.title);
    validateDeadline(data.deadline);
    validateIsUrgent(data.isUrgent);

    return TodoModel.create({
      title: data.title,
      deadline: data.deadline,
      isUrgent: data.isUrgent,
    });
  },

  updateTodo: (id, data) => {
    const todo = TodoModel.getById(id);
    if (!todo) return null;

    if (data.title !== undefined) {
      if (typeof data.title !== "string" || data.title.trim() === "") {
        throw new ValidationError("Title must be a non-empty string");
      }
      todo.title = data.title.trim();
    }

    if (data.deadline !== undefined) {
      if (isNaN(Date.parse(data.deadline))) {
        throw new ValidationError("Deadline must be a valid date");
      }
      todo.deadline = data.deadline;
    }

    if (data.isUrgent !== undefined) {
      if (typeof data.isUrgent !== "boolean") {
        throw new ValidationError("isUrgent must be true or false");
      }
      todo.isUrgent = data.isUrgent;
    }

    return todo;
  },

  deleteTodo: (id) => {
    const idx = TodoModel.findIndexById(id);
    if (idx === -1) return null;
    return TodoModel.deleteByIndex(idx);
  },
};
```

---

## 5. `src/middleware/errorHandler.js`

A catch-all error handler and a 404 handler, so `app.js` stays clean.

```js
export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: "Route not found" });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
};
```

---

## 6. `src/controllers/todoController.js`

Controllers translate HTTP requests into service calls, and service
results/errors into HTTP responses.

```js
import { TodoService, ValidationError } from "../services/todoService.js";

export const getAllTodos = (req, res) => {
  res.status(200).json(TodoService.getAllTodos());
};

export const getTodoById = (req, res) => {
  const id = Number(req.params.id);
  const todo = TodoService.getTodoById(id);

  if (!todo) {
    return res.status(404).json({ error: "Todo item not found" });
  }

  res.status(200).json(todo);
};

export const createTodo = (req, res, next) => {
  try {
    const newTodo = TodoService.createTodo(req.body);
    res.status(201).json(newTodo);
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    next(err);
  }
};

export const updateTodo = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const updated = TodoService.updateTodo(id, req.body);

    if (!updated) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    next(err);
  }
};

export const deleteTodo = (req, res) => {
  const id = Number(req.params.id);
  const deleted = TodoService.deleteTodo(id);

  if (!deleted) {
    return res.status(404).json({ error: "Todo item not found" });
  }

  res.status(200).json({ message: "Todo deleted", todo: deleted });
};
```

---

## 7. `src/routes/todoRoutes.js`

Routes map http verbs to
controllers.

```js
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

## 8. `src/app.js`

Builds and configures the Express app, but does **not** start the server.
This makes the app importable/testable (e.g. with `supertest`) without
binding to a port.

```js
import express from "express";
import todoRoutes from "./routes/todoRoutes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to my To-Do App Api");
});

app.use("/api/todo", todoRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
```

---

## 9. `src/server.js`

The actual entry point — imports the configured app and starts listening.

```js
import app from "./app.js";
import { config } from "./config/index.js";

app.listen(config.port, () => {
  console.log(`App is listening on http://localhost:${config.port}`);
});
```

---

## 10. `package.json`

```json
{
  "name": "todo-app",
  "version": "1.0.0",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
```

> Note: `dotenv` is added as a new dependency to load `.env` in `config/index.js`.
> Run `npm install` after adding it.

---

## 11. `README.md`

```markdown
# To-Do App API

A simple REST API for managing to-do items, built with Express.

## Project Structure

- `src/config` – environment configuration
- `src/models` – in-memory data store
- `src/services` – business logic & validation
- `src/controllers` – request/response handling
- `src/middleware` – error handling (404, generic errors)
- `src/routes` – route definitions
- `src/app.js` – Express app setup
- `src/server.js` – app entry point

## Setup

\`\`\`bash
npm install
npm start
\`\`\`

The server runs on the port defined in `.env` (default `3000`).

## Endpoints

| Method | Route           | Description       |
| ------ | --------------- | ----------------- |
| GET    | `/api/todo`     | List all todos    |
| GET    | `/api/todo/:id` | Get a single todo |
| POST   | `/api/todo`     | Create a todo     |
| PUT    | `/api/todo/:id` | Update a todo     |
| DELETE | `/api/todo/:id` | Delete a todo     |
```

---

1. Create the folder structure above under `src/`.
2. Move the in-memory `todoList` array and `createIdGenerator` into
   `models/todoModel.js`, exposing only data-access functions.
3. Move update/delete logic (trimming titles, finding by id, etc.) into
   `services/todoService.js`, which calls the model.
4. Move the inline validation (`if (!title...)` blocks) into
   `services/todoService.js` as well — these are domain rules about what
   makes a valid to-do, so they live with the logic they protect.
   Represent failures with a small `ValidationError` class (carrying a
   `statusCode`) instead of directly writing an HTTP response.
5. Rewrite each route handler as a thin controller function in
   `controllers/todoController.js`. `createTodo`/`updateTodo` wrap their
   service call in `try/catch`, turning a caught `ValidationError` into
   a `400` response and forwarding anything else to `next(err)`.
6. Wire routes in `routes/todoRoutes.js` — no validation middleware to
   attach anymore, so routes simply map verbs to controllers.
7. Assemble everything (routes, 404/generic-error handlers) in
   `app.js` — but do not call `.listen()` there.
8. Move `.listen()` and the config-loading into `server.js`, the new
   entry point.
9. Add `.env` and `config/index.js` for the port (and any future config).
10. Update `package.json`'s `main`/`start` script to point to
    `src/server.js`, and add `dotenv` as a dependency.
