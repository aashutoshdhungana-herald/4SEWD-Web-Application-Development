# Adding an ORM with `sequelize` + SQLite

In Task 1 we split the app into layers, and in Task 2 we moved request
validation out to `express-validator` middleware. The `models/todoModel.js`
file has been a plain in-memory array this whole time, every restart wipes
your data.

In this task we replace the in-memory store with a real database using
[Sequelize](https://sequelize.org/) as the ORM and SQLite as the underlying
engine (a single file on disk, no separate DB server to run).

You will learn three new pieces:

| Piece                  | What it is                                                                |
| ---------------------- | ------------------------------------------------------------------------- |
| **Sequelize instance** | The connection object, configured once and pointed at your `.env` values  |
| **Model**              | `TodoItem`, defined with `sequelize.define`, replaces the old plain array |
| **Sync script**        | A one-off command that creates/updates the SQLite tables from your models |

---

## 1. Install the packages

```bash
npm install sequelize sqlite3
```

---

## 2. Update `.env`

Add a variable for where the SQLite file should live on disk.

```env
PORT=3000
DB_STORAGE=./database.sqlite
```

---

## 3. Update the folder structure

Add one new file, `config/database.js`, and one new folder, `scripts/`, for
the sync command:

```
src/
│
├── config/
│   ├── index.js
│   └── database.js     ← NEW
├── controllers/
├── middleware/
├── models/
│   └── todoModel.js     ← REWRITTEN
├── routes/
├── scripts/              ← NEW
│   └── syncDb.js         ← NEW
├── services/
│   └── todoService.js    ← REWRITTEN
├── validators/
├── app.js
└── server.js
```

---

## 4. `src/config/index.js`

Extend the existing config object with a `db` section so nothing reads
`process.env` directly outside this file.

```js
import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  db: {
    storage: process.env.DB_STORAGE || "./database.sqlite",
  },
};
```

---

## 5. `src/config/database.js`

This is the single Sequelize instance the whole app shares. Everything
else, the model, the sync script also imports `sequelize` from here instead
of creating its own connection.

```js
import { Sequelize } from "sequelize";
import { config } from "./index.js";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: config.db.storage,
  logging: false,
});
```

---

## 6. `src/models/todoModel.js`

Replace the old in-memory array + id generator with a Sequelize model.
Sequelize gives every model an auto-incrementing integer `id` primary key
for free, so no more `createIdGenerator`.

```js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const TodoItem = sequelize.define(
  "TodoItem",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isUrgent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "todos",
    timestamps: true,
  },
);
```

`TodoItem` is now both the schema definition _and_ the query interface
(`TodoItem.findAll()`, `TodoItem.create()`, etc.). The rest of the app
only ever imports this one export.

---

## 7. `src/services/todoService.js`

The service no longer touches an array. It delegates straight to the
model, and every method becomes `async` because Sequelize queries return
promises. Since Task 2 moved field validation into `express-validator`,
there's no `ValidationError` handling left to carry over here either.

```js
import { TodoItem } from "../models/todoModel.js";

export const TodoService = {
  getAllTodos: () => TodoItem.findAll(),

  getTodoById: (id) => TodoItem.findByPk(id),

  createTodo: (data) =>
    TodoItem.create({
      title: data.title,
      deadline: data.deadline,
      isUrgent: data.isUrgent,
    }),

  updateTodo: async (id, data) => {
    const todo = await TodoItem.findByPk(id);
    if (!todo) return null;

    if (data.title !== undefined) todo.title = data.title;
    if (data.deadline !== undefined) todo.deadline = data.deadline;
    if (data.isUrgent !== undefined) todo.isUrgent = data.isUrgent;

    await todo.save();
    return todo;
  },

  deleteTodo: async (id) => {
    const todo = await TodoItem.findByPk(id);
    if (!todo) return null;

    await todo.destroy();
    return todo;
  },
};
```

---

## 8. Update `src/controllers/todoController.js`

Every controller now `await`s the service call.

```js
import { TodoService } from "../services/todoService.js";

export const getAllTodos = async (req, res) => {
  res.status(200).json(await TodoService.getAllTodos());
};

export const getTodoById = async (req, res) => {
  const todo = await TodoService.getTodoById(req.params.id);
  if (!todo) {
    return res.status(404).json({ error: "Todo item not found" });
  }
  res.status(200).json(todo);
};

export const createTodo = async (req, res) => {
  const newTodo = await TodoService.createTodo(req.body);
  res.status(201).json(newTodo);
};

export const updateTodo = async (req, res) => {
  const updated = await TodoService.updateTodo(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: "Todo not found" });
  }
  res.status(200).json(updated);
};

export const deleteTodo = async (req, res) => {
  const deleted = await TodoService.deleteTodo(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "Todo item not found" });
  }
  res.status(200).json({ message: "Todo deleted", todo: deleted });
};
```

---

## 9. `src/scripts/syncDb.js`

A small standalone script that creates (or updates) the SQLite tables to
match the model definitions, then exits. This is deliberately **not**
run automatically on every server start. You run it explicitly when
the schema changes.

```js
import { sequelize } from "../config/database.js";
import "../models/todoModel.js"; // registers TodoItem on the sequelize instance

const run = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database synced successfully");
    process.exit(0);
  } catch (err) {
    console.error("Failed to sync database:", err);
    process.exit(1);
  }
};

run();
```

`{ alter: true }` updates existing tables to match the model instead of
dropping and recreating them making it safe to re-run as the schema evolves.

---

## 10. Update `package.json`

Add the two new dependencies and a `db:sync` script that runs the sync
file above.

```json
{
  "name": "todo-app",
  "version": "1.0.0",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "db:sync": "node src/scripts/syncDb.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "dotenv": "^16.4.5",
    "express-validator": "^7.2.0",
    "sequelize": "^6.37.5",
    "sqlite3": "^5.1.7"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
```

---

## 11. Try it out

```bash
npm install
npm run db:sync   # creates database.sqlite with a `todos` table
npm run dev
```

Create a todo as before (`POST /api/todo`). It now survives a server
restart, since it's persisted in `database.sqlite` instead of an
in-memory array.

---
