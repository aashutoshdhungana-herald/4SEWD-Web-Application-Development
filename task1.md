# Adding Authentication: User Accounts, JWTs, and Protected Todo Routes

Previously, the client and server were connected over a real HTTP API, with
CORS, toasts, and loading states rounding out the UX. Right now, though,
anyone can see and modify anyone else's todos, there's no concept of a
"user" at all.

In this task you add a `User` table, build `register`, `login`, and
`logout` routes, issue and verify JWTs, and lock down the existing todo
routes so a user can only view, edit, or delete their own tasks.

You will learn:

| Piece                    | What it is                                                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **`User` model**         | A Sequelize model storing credentials and profile info, with a `Todo.userId` foreign key linking tasks to owners |
| **Password hashing**     | Using `bcrypt` so raw passwords are never stored                                                                 |
| **JWT issuing**          | Signing a token on login that encodes the user's id and full name as claims                                      |
| **JWT verification**     | Middleware that reads the token, verifies it, and attaches `req.userId` and `req.fullName`                       |
| **`localStorage` token** | Storing the token client-side and attaching it as an `Authorization` header on every request                     |
| **Ownership checks**     | Comparing `todo.userId` to `req.userId` before allowing view/edit/delete                                         |

---

## 1. Install dependencies

```bash
cd {yourFolder}/server
npm install bcrypt jsonwebtoken
```

Add a JWT secret to your `.env` file:

```
JWT_SECRET=replace-with-a-long-random-string
```

---

## 2. Create the `User` model

`src/models/User.js`:

```js
import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default User;
```

## 3. Link `Todo` to `User`

Add a `userId` column to the `Todo` model, and wire up the association in
the file currently defines your model relationships
`src/models/index.js`:

```js
import Todo from "./Todo.js";
import User from "./User.js";

User.hasMany(Todo, { foreignKey: "userId" });
Todo.belongsTo(User, { foreignKey: "userId" });

export { Todo, User };
```

Re-run your sync script so the new table and columns are created:

```bash
npm run db:sync
```

---

## 4. Add auth routes: register, login, logout

`src/routes/authRoutes.js`:

```js
import { Router } from "express";
import { register, login, logout } from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

export default router;
```

Mount it in `src/app.js` alongside your existing todo routes:

```js
import authRoutes from "./routes/authRoutes.js";

app.use("/api/auth", authRoutes);
```

## 5. Implement the auth controller

`src/controllers/authController.js`:

```js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function register(req, res) {
  const { firstName, lastName, username, password } = req.body;

  if (!firstName || !lastName || !username || !password) {
    return res.status(400).json({
      error: "First name, last name, username, and password are required",
    });
  }

  const existing = await User.findOne({ where: { username } });
  if (existing) {
    return res.status(409).json({ error: "Username already taken" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    firstName,
    lastName,
    username,
    passwordHash,
  });

  const fullName = `${user.firstName} ${user.lastName}`;

  const token = jwt.sign(
    { userId: user.id, fullName },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res
    .status(201)
    .json({ token, id: user.id, username: user.username, fullName });
}

export async function login(req, res) {
  const { username, password } = req.body;

  const user = await User.findOne({ where: { username } });
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const fullName = `${user.firstName} ${user.lastName}`;

  const token = jwt.sign(
    { userId: user.id, fullName },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res.json({ token, id: user.id, username: user.username, fullName });
}
```

The server does not set a cookie here, it just hands the token back in the
JSON body, and it's entirely up to the client to hold onto it and send it
back on later requests.

---

## 6. Add JWT verification middleware

`src/middleware/requireAuth.js`:

```js
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization; // "Bearer <token>"
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    req.fullName = payload.fullName;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
```

---

## 7. Protect the todo routes

Apply `requireAuth` to every todo route in `src/routes/todoRoutes.js`:

```js
import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/todoController.js";

const router = Router();

router.use(requireAuth);

router.get("/", getTasks);
router.get("/:id", getTaskById);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
```

## 8. Enforce ownership in the todo controller

Every read/update/delete must confirm `todo.userId === req.userId` before
acting, and every create must stamp the new row with the current user's id.

```js
import Todo from "../models/Todo.js";

export async function getTasks(req, res) {
  const tasks = await Todo.findAll({ where: { userId: req.userId } });
  res.json(tasks);
}

export async function getTaskById(req, res) {
  const task = await Todo.findByPk(req.params.id);

  if (!task || task.userId !== req.userId) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json(task);
}

export async function createTask(req, res) {
  const { title, deadline, isUrgent } = req.body;
  const task = await Todo.create({
    title,
    deadline,
    isUrgent,
    userId: req.userId,
  });
  res.status(201).json(task);
}

export async function updateTask(req, res) {
  const task = await Todo.findByPk(req.params.id);

  if (!task || task.userId !== req.userId) {
    return res.status(404).json({ error: "Task not found" });
  }

  await task.update(req.body);
  res.json(task);
}

export async function deleteTask(req, res) {
  const task = await Todo.findByPk(req.params.id);

  if (!task || task.userId !== req.userId) {
    return res.status(404).json({ error: "Task not found" });
  }

  await task.destroy();
  res.status(204).send();
}
```

Returning `404` (rather than `403`) for a task that belongs to someone else
avoids leaking whether a given id exists at all.

---

## 10. Try it out

```bash
cd {workspace}/server
npm install
npm run db:sync
npm run dev

```

- Register a new user using thunder client, including `firstName` and `lastName` in the request body
- Login with the same credentials
- Copy the token and add a Authroization header to the api request
  - Authrorization Bearer `<token>`
- Send request to the authenticated routes
- Confirm the decoded token payload includes `fullName`

---
