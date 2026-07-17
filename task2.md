# Adding Validation with `express-validator`

In Task 1 we split the To-Do app into a layered structure and put manual
validation (`if (!title...)` checks) inside `services/todoService.js`.

In this task we move **request validation** out to the edge of the
application using [`express-validator`](https://express-validator.github.io/docs/),
so bad requests are rejected by middleware _before_ they ever reach a
controller or service.

You will learn three new pieces:

| Piece                     | What it is                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| **Validation chain**      | A rule (or set of rules) attached to a field, e.g. `body("title").notEmpty()`                     |
| **Validator array**       | An array of validation chains for one route, e.g. `createTodoValidator`                           |
| **`validate` middleware** | A single reusable middleware that checks for validation errors and sends a uniform error response |

---

## 0. Why not just validate in the service layer?

The service-layer validation from Task 1 still works, but it has two problems:

1. It runs _after_ Express has already parsed and handed you the request —
   there's no standard, declarative way to describe "this field must be an
   email" or "this must be an integer" without writing it by hand.
2. Every service method needs its own hand-rolled `if` checks, and the
   error format is whatever you happened to type that day.

`express-validator` fixes both: you _declare_ the rules next to the route,
and a single `validate` middleware turns any failures into one consistent
JSON shape, for every route in your app.

---

## 1. Install the package

```bash
npm install express-validator
```

---

## 2. Update the folder structure

Add one new folder, `validators/`, and one new file inside `middleware/`:

```
src/
│
├── config/
├── controllers/
├── middleware/
│   ├── errorHandler.js
│   └── validate.js        ← NEW
├── models/
├── routes/
├── services/
├── validators/             ← NEW
│   └── todoValidator.js    ← NEW
├── app.js
└── server.js
```

---

## 3. `src/middleware/validate.js`

This is the **uniform error middleware**. It doesn't know anything about
to-dos, it just looks at whatever validation chains ran before it, and if
any of them failed, it responds with a consistent `400` shape. Every
route in the app can reuse this same middleware.

```js
import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }

  next();
};
```

**Key idea:** `validate` is just a normal Express middleware. It must run
_after_ the validation chains (so there's something in `req` for
`validationResult` to inspect) and _before_ the controller.

---

## 4. `src/validators/todoValidator.js`

This file holds the **validator arrays** — one array of validation chains
per route that needs validation. Each chain targets a field (`body`,
`param`, `query`, etc.) and lists the rules it must satisfy.

```js
import { body, param } from "express-validator";

export const createTodoValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string"),

  body("deadline")
    .notEmpty()
    .withMessage("Deadline is required")
    .isISO8601()
    .withMessage("Deadline must be a valid date (YYYY-MM-DD)"),

  body("isUrgent")
    .isBoolean()
    .withMessage("isUrgent is required and must be true or false"),
];

export const updateTodoValidator = [
  param("id").isInt().withMessage("id must be an integer").toInt(),

  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title must be a non-empty string"),

  body("deadline")
    .optional()
    .isISO8601()
    .withMessage("Deadline must be a valid date (YYYY-MM-DD)"),

  body("isUrgent")
    .optional()
    .isBoolean()
    .withMessage("isUrgent must be true or false"),
];

export const idParamValidator = [
  param("id").isInt().withMessage("id must be an integer").toInt(),
];
```

A few things worth pointing out:

- `.trim()` and `.toInt()` are **sanitizers**, they mutate the value in
  place (e.g. converting `"5"` to the number `5`) so the controller
  receives clean data.
- `.optional()` on the `update` validators means "only validate this
  field if it was actually sent", matches the partial-update behaviour
  from Task 1's `updateTodo` service method.
- `.withMessage(...)` attaches the message that ends up in the `validate`
  middleware's `details` array.

---

## 5. Wire the validators into the routes

This is the pattern to teach: **`router.METHOD(path, validatorArray, validate, controller)`**.

```js
// src/routes/todoRoutes.js
import { Router } from "express";
import {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../controllers/todoController.js";
import { validate } from "../middleware/validate.js";
import {
  createTodoValidator,
  updateTodoValidator,
  idParamValidator,
} from "../validators/todoValidator.js";

const router = Router();

router.get("/", getAllTodos);
router.get("/:id", idParamValidator, validate, getTodoById);
router.post("/", createTodoValidator, validate, createTodo);
router.put("/:id", updateTodoValidator, validate, updateTodo);
router.delete("/:id", idParamValidator, validate, deleteTodo);

export default router;
```

Notice the request never reaches `createTodo`/`updateTodo`/etc. unless it
already passed every chain in the validator array — the controller and
service can now trust that `req.body`/`req.params` are well-formed.

---

## 6. Remove the custom validations in the services

Delete `validateTitle`,
`validateDeadline`, `validateIsUrgent`, and the `try/catch` for
`ValidationError` in the controller, since invalid data can no longer
reach `createTodo`/`updateTodo` in the service.

---

## 7. Update `package.json`

```json
{
  "dependencies": {
    "express": "^4.19.2",
    "dotenv": "^16.4.5",
    "express-validator": "^7.2.0"
  }
}
```

---

## 8. Try it out

Start the server, then send a bad request as follows from postman/thunderclient:

```json
{
  "title": "",
  "deadline": "not-a-date"
}
```

Expected response (uniform shape, from `validate`):

```json
{
  "error": "Validation failed",
  "details": [
    { "field": "title", "message": "Title is required" },
    {
      "field": "deadline",
      "message": "Deadline must be a valid date (YYYY-MM-DD)"
    },
    {
      "field": "isUrgent",
      "message": "isUrgent is required and must be true or false"
    }
  ]
}
```

Then send a valid request and confirm it still creates a todo as before.

---
