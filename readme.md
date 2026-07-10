# Node.js & Express — Complete Guide

A reference guide covering everything you need to understand file handling in Node, ES Modules & npm packages, building an HTTP server from scratch, and building a REST API with Express. Use this alongside the four tutorial tasks.

---

## Table of Contents

1. [What is Node.js?](#1-what-is-nodejs)
2. [Checking & Installing Node](#2-checking--installing-node)
3. [CommonJS vs ES Modules](#3-commonjs-vs-es-modules)
4. [The File System (`fs`) Module](#4-the-file-system-fs-module)
5. [npm & `package.json`](#5-npm--packagejson)
6. [Dependencies vs devDependencies](#6-dependencies-vs-devdependencies)
7. [nodemon](#7-nodemon)
8. [What is HTTP?](#8-what-is-http)
9. [The HTTP Request & Response Cycle](#9-the-http-request--response-cycle)
10. [The Built-in `http` Module](#10-the-built-in-http-module)
11. [`req` and `res` in Raw Node.js](#11-req-and-res-in-raw-nodejs)
12. [Content-Types & Response Headers](#12-content-types--response-headers)
13. [Parsing URLs & Query Parameters (Raw Node)](#13-parsing-urls--query-parameters-raw-node)
14. [What is REST?](#14-what-is-rest)
15. [Introduction to Express](#15-introduction-to-express)
16. [Express Routing](#16-express-routing)
17. [`req` and `res` in Express](#17-req-and-res-in-express)
18. [Middleware — Concepts & All Types](#18-middleware--concepts--all-types)
19. [Project Structure (MVC-style)](#19-project-structure-mvc-style)
20. [Building a REST API — Concepts](#20-building-a-rest-api--concepts)
21. [Validation & Error Handling](#21-validation--error-handling)
22. [HTTP Status Codes Cheat Sheet](#22-http-status-codes-cheat-sheet)
23. [Testing APIs with Postman / Thunder Client](#23-testing-apis-with-postman--thunder-client)
24. [Glossary](#24-glossary)

---

## 1. What is Node.js?

Node.js is a JavaScript **runtime** built on Chrome's V8 engine that lets you run JavaScript outside the browser — on a server, in a terminal, anywhere. This is what makes it possible to write backend applications, CLI tools, and servers entirely in JavaScript.

Node adds capabilities the browser doesn't have (and removes ones it does), such as:

- Access to the file system (`fs`)
- Access to networking (`http`, `net`)
- No `window` or `document` objects (there's no browser DOM)
- A module system for organizing code across files

---

## 2. Checking & Installing Node

Before starting any Node project, confirm it's installed:

```bash
node -v
npm -v
```

- `node -v` prints the installed Node version (e.g. `v20.11.0`). `npm` (Node Package Manager) ships bundled with Node, so checking `npm -v` confirms both.
- If either command returns "command not found," download the **LTS (Long-Term Support)** version from [nodejs.org](https://nodejs.org). LTS is recommended over "Current" for stability.

---

## 3. CommonJS vs ES Modules

Node supports two module systems for splitting code across files and sharing code between them.

### CommonJS (the original Node default)

```js
// exporting
module.exports = myFunction;

// importing
const fs = require("fs");
const myFunction = require("./myFunction");
```

- Uses `require()` to import and `module.exports` to export.
- Works in every Node file by default — no configuration needed.

### ES Modules (modern, browser-aligned syntax)

```js
// exporting
export default myFunction; // default export
export function helper() {} // named export

// importing
import myFunction from "./myFunction.js";
import { helper } from "./helper.js";
```

- Uses `import`/`export` instead of `require`/`module.exports`.
- **Must be explicitly enabled** by adding `"type": "module"` to `package.json`:

  ```json
  {
    "type": "module"
  }
  ```

- **Default export**: one per file, imported without curly braces (`import x from "..."`).
- **Named export**: any number per file, imported with curly braces (`import { x } from "..."`), and the name must match.
- With ES Modules, relative import paths must include the file extension (`./utils.js`, not `./utils`).

> Both module systems accomplish the same goal — splitting code into reusable, organized files — but you should stick to one system per project rather than mixing them.

---

## 4. The File System (`fs`) Module

`fs` is a **built-in** Node module (no installation needed) for reading from and writing to files on disk.

```js
const fs = require("fs");
```

### Writing a file

```js
fs.writeFile("output.txt", "Hello, world", (err) => {
  if (err) {
    console.error("Error writing file:", err);
    return;
  }
  console.log("File written successfully");
});
```

### Reading a file

```js
fs.readFile("output.txt", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }
  console.log(data);
});
```

### Why does the read happen _inside_ the write callback?

Node's `fs` functions are **asynchronous** by default — they don't block the rest of the program while the disk operation completes. If you called `readFile` immediately after `writeFile` (not nested inside its callback), there'd be no guarantee the write finished before the read started, since JavaScript keeps executing the next line without waiting. Nesting the read inside the write's callback guarantees the file exists and is fully written before you try to read it. This pattern — one async operation triggering the next once it completes — is one of the core things to get comfortable with in Node.

> Note: `fs` also offers synchronous versions (`fs.writeFileSync`, `fs.readFileSync`) and a Promise-based API (`fs.promises` or `fs/promises`) that pairs well with `async`/`await`, but the callback style above is the most fundamental to understand first.

---

## 5. npm & `package.json`

**npm** (Node Package Manager) is the tool used to install, manage, and share reusable packages of JavaScript code.

### Initializing a project

```bash
npm init -y
```

This creates a `package.json` file — the manifest that describes your project — skipping the interactive prompts (`-y` = "yes to defaults").

### Key fields in `package.json`

| Field             | Purpose                                                      |
| ----------------- | ------------------------------------------------------------ |
| `name`            | The project's name (defaults to the folder name)             |
| `version`         | The project's version, starting at `1.0.0`                   |
| `main`            | The entry point file for the project (`index.js` by default) |
| `type`            | Set to `"module"` to enable ES Module syntax                 |
| `scripts`         | Named shortcuts you can run with `npm run <script>`          |
| `dependencies`    | Packages required to run the app                             |
| `devDependencies` | Packages only needed during development                      |
| `license`         | Defaults to `ISC`                                            |

### npm scripts

Scripts are shortcuts defined in `package.json` and run with `npm run <name>`:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

- `npm start` is a special case — it can be run without the word `run` (`npm start`), while custom script names need it (`npm run dev`).

---

## 6. Dependencies vs devDependencies

When you install a package, npm records it under one of two sections of `package.json`:

```bash
npm install express            # regular dependency
npm install --save-dev nodemon # dev dependency
```

- **`dependencies`** — packages your app needs to actually **run** in production (e.g. `express`, `chalk`).
- **`devDependencies`** — packages only needed **while developing** (e.g. `nodemon` for auto-restarting, testing libraries, linters). They aren't required once the app is deployed/running normally.

Installed packages live inside the `node_modules` folder (never commit this folder — it's regenerated from `package.json` via `npm install`), and exact installed versions are locked in `package-lock.json`.

---

## 7. nodemon

`nodemon` is a **development tool** that watches your project files and automatically restarts the Node process whenever a file is saved — so you don't have to manually stop (`Ctrl+C`) and re-run `node server.js` after every change.

```bash
npm install --save-dev nodemon
```

Wired up as an npm script:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

Run it with:

```bash
npm run dev
```

Because it's purely a development convenience (not something the running production app depends on), it belongs in `devDependencies`, and you typically use `npm start` (plain `node`) for production and `npm run dev` (`nodemon`) while coding.

---

## 8. What is HTTP?

**HTTP** (HyperText Transfer Protocol) is the protocol — a shared set of rules — that clients (browsers, mobile apps, Postman, `fetch`) and servers use to communicate over the web. Every time a browser loads a page, or a frontend app calls an API, it's sending an HTTP **request** and getting back an HTTP **response**.

Key characteristics of HTTP:

- **Client-server model** — a client always initiates communication by sending a request; the server responds. Servers don't push data to clients uninvited (in plain HTTP).
- **Stateless** — each request is handled independently, with no memory of previous requests by default. If an application needs to "remember" something between requests (like a logged-in user), that has to be built on top of HTTP (cookies, tokens, sessions).
- **Text-based protocol** — requests and responses are structured, human-readable text made up of a start line, headers, and an optional body.
- **Runs over TCP/IP** — HTTP is built on top of lower-level networking protocols that handle actually delivering the data.

### HTTP Methods (Verbs)

Each request specifies a **method** describing the _type_ of action being requested:

| Method   | Typical purpose                                            |
| -------- | ---------------------------------------------------------- |
| `GET`    | Retrieve data — should never modify anything on the server |
| `POST`   | Create a new resource, or submit data for processing       |
| `PUT`    | Replace/update an existing resource                        |
| `PATCH`  | Partially update an existing resource                      |
| `DELETE` | Remove a resource                                          |

> `PUT` vs `PATCH`: strictly, `PUT` implies replacing the _entire_ resource while `PATCH` implies a partial update. In practice (and in the tasks in this guide), `PUT` is often used loosely to mean "update," including partial updates — just be aware of the distinction.

### URLs

A URL (Uniform Resource Locator) identifies _where_ a request is going:

```
http://localhost:3000/api/todos/1?urgent=true
└─┬─┘   └────┬─────┘└──────┬───────┘└────┬────┘
 scheme     host          path          query string
```

- **Scheme** — the protocol (`http` or `https`).
- **Host** — the server's address (domain name or IP + port).
- **Path** — identifies a specific resource on the server.
- **Query string** — optional key/value pairs (after `?`) providing extra parameters.

---

## 9. The HTTP Request & Response Cycle

Every interaction between a client and server follows the same basic cycle:

1. **Client sends a request** — specifying a method, a URL/path, headers, and (optionally) a body.
2. **Server receives the request**, processes it (reads a database, runs some logic, etc.).
3. **Server sends back a response** — with a status code, headers, and (usually) a body.
4. **Client receives the response** and does something with it (render a page, update the UI, log the data).

### Anatomy of an HTTP Request

| Part     | Description                                                         | Example                          |
| -------- | ------------------------------------------------------------------- | -------------------------------- |
| Method   | The action being requested                                          | `POST`                           |
| URL/Path | Which resource is being targeted                                    | `/api/todos`                     |
| Headers  | Metadata about the request (content type, auth tokens, etc.)        | `Content-Type: application/json` |
| Body     | Data being sent to the server (optional — common with `POST`/`PUT`) | `{ "title": "Read a book" }`     |

### Anatomy of an HTTP Response

| Part           | Description                                               | Example                               |
| -------------- | --------------------------------------------------------- | ------------------------------------- |
| Status code    | A 3-digit number summarizing the outcome                  | `201`                                 |
| Status message | A short human-readable label for the status code          | `Created`                             |
| Headers        | Metadata about the response (content type, caching, etc.) | `Content-Type: application/json`      |
| Body           | The actual data being returned (optional)                 | `{ "id": 3, "title": "Read a book" }` |

Understanding this request → process → response cycle is the mental model behind _everything_ in this guide, whether you're using the raw `http` module or Express.

---

## 10. The Built-in `http` Module

Before reaching for a framework like Express, it's worth understanding what Node gives you out of the box: the `http` module lets you create a fully working web server with **no external dependencies**.

```js
const http = require("http");

const PORT = 3000;

const server = http.createServer((req, res) => {
  // handle each incoming request here
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

- `http.createServer()` takes a **request handler function** that runs every time a request hits the server.
- The handler receives two objects — `req` (the incoming HTTP request) and `res` (used to build the outgoing HTTP response) — detailed fully in the next section.
- `server.listen(PORT, callback)` starts the server listening on the given port and runs the callback once it's ready.

### Manual routing

With the raw `http` module, you route by manually checking `req.url` (and `req.method`, if needed):

```js
if (req.url === "/") {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Welcome to my Node.js Server!");
} else if (req.url === "/about") {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<h1>About</h1>");
} else {
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("404 - Page Not Found");
}
```

The final `else` block acts as a **catch-all for unmatched routes**, returning a `404`. This manual approach is exactly the kind of repetitive boilerplate that Express is designed to eliminate.

---

## 11. `req` and `res` in Raw Node.js

In the raw `http` module, `req` and `res` are fairly low-level — you're responsible for reading and formatting almost everything yourself.

### `req` (IncomingMessage) — commonly used properties

| Property           | Description                                                                                                                                     | Example                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `req.url`          | The raw path + query string requested (as a **string**, not parsed)                                                                             | `"/hello?name=Alice"`                    |
| `req.method`       | The HTTP method used                                                                                                                            | `"GET"`, `"POST"`                        |
| `req.headers`      | An object of all request headers                                                                                                                | `{ "content-type": "application/json" }` |
| (reading the body) | There is **no built-in `req.body`** — you must manually listen for `data` and `end` events on the `req` stream and parse the raw bytes yourself | see below                                |

Reading a request body manually (e.g. for a `POST` request) looks like this, since `req` is a readable stream:

```js
let body = "";
req.on("data", (chunk) => {
  body += chunk;
});
req.on("end", () => {
  const data = JSON.parse(body);
  // now you can use `data`
});
```

This is precisely the kind of manual, error-prone work that `express.json()` middleware automates in Express (see [Section 18](#18-middleware--concepts--all-types)).

### `res` (ServerResponse) — commonly used methods

| Method                               | Description                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `res.writeHead(statusCode, headers)` | Sets the status code and response headers in one call                                            |
| `res.setHeader(name, value)`         | Sets a single header (alternative to passing an object to `writeHead`)                           |
| `res.write(chunk)`                   | Writes a piece of the response body (can be called multiple times)                               |
| `res.end([data])`                    | Ends the response, optionally sending final data; **must be called** or the client hangs waiting |
| `res.statusCode = 200`               | Sets the status code directly, as a property rather than a method call                           |

```js
res.writeHead(200, { "Content-Type": "application/json" });
res.end(JSON.stringify({ message: "Hello" })); // must stringify objects manually
```

---

## 12. Content-Types & Response Headers

The `Content-Type` header tells the client (browser, Postman, etc.) how to interpret the response body.

| Content-Type       | Meaning                                                           |
| ------------------ | ----------------------------------------------------------------- |
| `text/plain`       | Raw, unformatted text                                             |
| `text/html`        | HTML markup — the browser will parse and render it                |
| `application/json` | Structured JSON data — parsed accordingly by browsers/API clients |

Since `res.end()` only sends strings, a JavaScript object must be serialized with `JSON.stringify()` before sending it as JSON:

```js
const student = { name: "John", course: "Web Development", semester: 5 };
res.writeHead(200, { "Content-Type": "application/json" });
res.end(JSON.stringify(student));
```

(In Express, `res.json(obj)` does this stringification — and sets the header — for you automatically. See [Section 17](#17-req-and-res-in-express).)

---

## 13. Parsing URLs & Query Parameters (Raw Node)

`req.url` is just a raw string (e.g. `/hello?name=Alice`), so to safely extract pieces like query parameters, use Node's built-in `url` module:

```js
const url = require("url");

const parsedUrl = url.parse(req.url, true); // true = parse query string into an object
const name = parsedUrl.query.name || "Guest";
```

- `parsedUrl.query` becomes an object of key/value pairs from the query string, e.g. `{ name: "Alice" }`.
- A common pattern is providing a **default value** (`|| "Guest"`) when the parameter is missing.

In Express, this is handled for you automatically via `req.query` — no manual parsing needed (see next sections).

---

## 14. What is REST?

**REST** (REpresentational State Transfer) is an architectural **style** — a set of conventions, not a strict protocol or library — for designing web APIs. A "RESTful" API organizes functionality around **resources** (nouns, like "todos," "users," "products") and uses standard HTTP methods (verbs) to act on them, rather than inventing a custom action for every operation.

### Core REST principles

- **Resources are identified by URLs.** A collection of todos lives at `/api/todos`; a specific todo lives at `/api/todos/1`.
- **HTTP methods express the action**, not the URL. You don't need `/getTodos` and `/deleteTodo` endpoints — the _same_ URL (`/api/todos/1`) responds differently depending on whether the request is `GET`, `PUT`, or `DELETE`.
- **Statelessness.** Just like HTTP itself, each request to a REST API should contain everything needed to process it — the server doesn't rely on memory of previous requests.
- **Uniform response format.** Resources are typically represented as JSON, with consistent shapes across endpoints.
- **Standard status codes communicate outcome.** `200`/`201` for success, `400` for bad input, `404` for missing resources, etc. — rather than always returning `200` and burying the real result inside the body.

### REST vs a plain HTTP server

Both the raw `http` module and Express can serve HTTP requests — REST is just a _convention_ for how you organize the URLs and methods on top of either. Task 3 (raw `http`) touches on REST-like ideas informally (different routes returning different content); Task 4 (Express) implements a fully REST-conventioned API with proper resource-based routing and CRUD-to-HTTP-method mapping (see [Section 20](#20-building-a-rest-api--concepts)).

---

## 15. Introduction to Express

**Express** is the most popular Node.js web framework. It sits on top of the built-in `http` module and removes the repetitive boilerplate of manual routing, header-setting, and body-parsing.

```bash
npm install express
```

```js
import express from "express";

const app = express();
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

Compared to raw `http`, Express gives you:

- **Declarative routing** — register a route per method + path instead of one giant `if/else` chain.
- **Built-in body parsing** — `express.json()` middleware parses JSON bodies into `req.body` automatically.
- **Convenience response methods** — `res.json()`, `res.status()`, etc.
- **Middleware pipeline** — a clean way to add cross-cutting logic (logging, auth, error handling).
- **The `Router` class** — for splitting routes into separate, mountable files.

---

## 16. Express Routing

Instead of checking `req.url` manually, Express lets you register one handler per HTTP method + path:

```js
app.get("/", (req, res) => {
  res.status(200).send("Welcome!");
});

app.post("/api/todos", (req, res) => {
  // handle creation
});

app.put("/api/todos/:id", (req, res) => {
  // handle update
});

app.delete("/api/todos/:id", (req, res) => {
  // handle deletion
});
```

### The `Router` class

For anything beyond a trivial app, routes are usually split into their own file(s) using `express.Router()`, then **mounted** onto a path prefix in the main server file:

```js
// routes/todoRoutes.js
import { Router } from "express";
const router = Router();

router.get("/", getAllTodos);
router.get("/:id", getTodoById);
router.post("/", createTodo);
router.put("/:id", updateTodo);
router.delete("/:id", deleteTodo);

export default router;
```

```js
// server.js
import todoRoutes from "./routes/todoRoutes.js";

app.use("/api/todos", todoRoutes);
// router.get("/:id", ...) above now actually handles GET /api/todos/:id
```

`app.use(path, router)` **mounts** the router so all its routes are prefixed with `path`.

---

## 17. `req` and `res` in Express

Express wraps Node's raw `req`/`res` objects with much friendlier properties and methods, so you rarely touch the low-level stream/header APIs directly.

### `req` — commonly used properties

| Property          | Description                                                         | Example                                                       |
| ----------------- | ------------------------------------------------------------------- | ------------------------------------------------------------- |
| `req.params`      | Values captured from **named route parameters** (`:id` in the path) | `GET /api/todos/5` → `req.params.id === "5"`                  |
| `req.query`       | Parsed **query string** as an object — no manual parsing needed     | `GET /api/todos?urgent=true` → `req.query.urgent === "true"`  |
| `req.body`        | The parsed **request body** — requires `express.json()` middleware  | `POST` with `{"title": "Read"}` → `req.body.title === "Read"` |
| `req.headers`     | Object of all request headers (same as raw Node)                    | `req.headers["content-type"]`                                 |
| `req.method`      | The HTTP method used                                                | `"POST"`                                                      |
| `req.originalUrl` | The full original URL path + query string, useful for logging       | `/api/todos?urgent=true`                                      |

> `req.params` and `req.query` values always arrive as **strings** — convert with `Number(...)` or similar when you need a different type.

### `res` — commonly used methods

| Method                                       | Description                                                                                                       |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `res.status(code)`                           | Sets the HTTP status code; **chainable**, so it's usually followed by another call                                |
| `res.json(obj)`                              | Serializes `obj` to JSON, sets `Content-Type: application/json`, and sends it                                     |
| `res.send(data)`                             | Sends a response of various types (string, buffer, object) — Express infers content type                          |
| `res.sendStatus(code)`                       | Sets the status code **and** sends its standard text as the body (e.g. `res.sendStatus(404)` sends `"Not Found"`) |
| `res.redirect(url)`                          | Redirects the client to a different URL                                                                           |
| `res.set(header, value)` / `res.header(...)` | Sets a single response header manually (rarely needed — `res.json` handles the common case)                       |

```js
res.status(200).json(todos); // success + JSON array
res.status(201).json(newTodo); // "Created" + the new resource
res.status(404).json({ error: "Todo not found" }); // error response
```

`res.status(code)` returns `res`, which is what makes `res.status(201).json(newTodo)` possible — this chaining pattern is idiomatic Express.

### Quick comparison: raw Node vs Express

| Task                          | Raw `http` module                           | Express                                 |
| ----------------------------- | ------------------------------------------- | --------------------------------------- |
| Read a route param            | Manually parse from `req.url`               | `req.params.id`                         |
| Read a query string           | `url.parse(req.url, true).query`            | `req.query`                             |
| Read a JSON body              | Manually collect `data`/`end` stream events | `req.body` (with `express.json()`)      |
| Send JSON                     | `res.writeHead(...)` + `JSON.stringify()`   | `res.json(obj)`                         |
| Set status + send in one step | Two separate calls                          | Chainable: `res.status(code).json(obj)` |

---

## 18. Middleware — Concepts & All Types

Middleware functions are the backbone of how Express processes requests. A middleware function has the signature:

```js
function myMiddleware(req, res, next) {
  // do something with req/res
  next(); // pass control to the next middleware / route handler
}
```

- **`next()`** hands off control to whatever is registered next in the pipeline. **Forgetting to call `next()` leaves the request hanging forever** (unless the middleware itself ends the response with `res.send()`/`res.json()`/`res.end()`, which stops the chain deliberately).
- Middleware runs **in the order it's registered**. This order matters — for example, a logger registered _before_ the 404 catch-all logs every request, including unmatched ones; registered _after_, it would never run for unmatched routes.
- Any middleware can inspect or modify `req`/`res` before passing control along — this is how features like body parsing, authentication, and logging get layered onto every request without repeating code in every route handler.

There are five main categories of middleware in Express:

### 1. Application-level middleware

Bound to the `app` object with `app.use()` or `app.METHOD()`. Runs for every request (or every request matching a path) regardless of which router eventually handles it.

```js
// Runs for every incoming request, on every route
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Runs only for requests starting with /admin
app.use("/admin", (req, res, next) => {
  console.log("Admin area accessed");
  next();
});
```

### 2. Router-level middleware

Identical in behavior to application-level middleware, but bound to an `express.Router()` instance instead of the whole app — so it only applies to routes registered on that router.

```js
import { Router } from "express";
const router = Router();

// Runs only for requests handled by this router
router.use((req, res, next) => {
  console.log("Todo router hit");
  next();
});

router.get("/", getAllTodos);
```

### 3. Built-in middleware

Ships with Express itself — no separate package to install.

```js
app.use(express.json()); // parses JSON request bodies into req.body
app.use(express.urlencoded({ extended: true })); // parses form-submitted (URL-encoded) bodies
app.use(express.static("public")); // serves static files (images, CSS, HTML) from a folder
```

`express.json()` is the one used throughout the REST API task — without it, `req.body` is `undefined` for any JSON request, since Express doesn't parse bodies unless told to.

### 4. Third-party middleware

Published as separate npm packages that plug into the same `(req, res, next)` pipeline. Common examples (not required for the tasks in this guide, but good to know):

```bash
npm install cors morgan helmet
```

```js
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

app.use(cors()); // allows cross-origin requests from other domains
app.use(morgan("dev")); // logs every request to the console (an alternative to a custom logger)
app.use(helmet()); // sets various security-related HTTP headers
```

### 5. Error-handling middleware

A special kind of middleware with **four** parameters instead of three: `(err, req, res, next)`. Express recognizes it by that signature alone, and it must be registered **last**, after all other `app.use()`/routes.

```js
// Regular route can forward an error:
app.get("/api/todos/:id", (req, res, next) => {
  try {
    // ...something that might throw
  } catch (err) {
    next(err); // passing an argument to next() skips straight to error-handling middleware
  }
});

// Error-handling middleware — registered last
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});
```

Calling `next(err)` anywhere in the pipeline skips all remaining regular middleware/routes and jumps straight to the nearest error-handling middleware.

### Custom middleware example — request logger

A practical, hand-written application-level middleware combining several of the ideas above:

```js
// middleware/logger.js
export function requestLogger(req, res, next) {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);

  res.on("finish", () => {
    // 'finish' fires once the response has actually been sent
    const duration = Date.now() - start;
    console.log(`  → ${res.statusCode} (${duration}ms)`);
  });

  next(); // always forwards the request — this middleware only observes
}
```

Registering it (typically first, so it captures every request):

```js
app.use(requestLogger);
app.use(express.json());
app.use("/api/todos", todoRoutes);
```

### The catch-all 404 handler

A middleware with no path, registered **after** all real routes (but before error-handling middleware), catches any request that didn't match an earlier route:

```js
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});
```

### Middleware pipeline order (put it all together)

```js
app.use(requestLogger); // 1. application-level — logs everything
app.use(express.json()); // 2. built-in — parses JSON bodies
app.use("/api/todos", todoRoutes); // 3. router-level middleware lives inside todoRoutes
app.use((req, res) => {
  // 4. catch-all 404 for unmatched routes
  res.status(404).json({ error: "Route not found" });
});
app.use((err, req, res, next) => {
  // 5. error-handling — always last
  res.status(500).json({ error: "Server error" });
});
```

---

## 19. Project Structure (MVC-style)

Rather than one giant file, real-world Express apps are typically split by responsibility:

```text
todo-api
│
├── data/            → the "database" (here, an in-memory array)
│   └── todos.js
├── controllers/      → business logic for each route (validation, reading/writing data, sending responses)
│   └── todoController.js
├── routes/           → maps URL paths + HTTP methods to controller functions
│   └── todoRoutes.js
├── middleware/        → cross-cutting functions like logging or auth
│   └── logger.js
├── server.js         → entry point: creates the app, registers middleware, mounts routes, starts listening
├── package.json
└── package-lock.json
```

This separation keeps each file focused on one job, and mirrors how larger production Express apps are organized (a lightweight version of the MVC — Model / View / Controller — pattern, minus the "View" since this is an API with no rendered UI).

---

## 20. Building a REST API — Concepts

Building on the REST principles from [Section 14](#14-what-is-rest), here's how CRUD operations map onto HTTP methods for a resource like "todos":

| HTTP Method | CRUD Operation | Example               | Meaning                   |
| ----------- | -------------- | --------------------- | ------------------------- |
| `GET`       | Read           | `GET /api/todos`      | Fetch all todos           |
| `GET`       | Read (one)     | `GET /api/todos/1`    | Fetch a single todo by id |
| `POST`      | Create         | `POST /api/todos`     | Create a new todo         |
| `PUT`       | Update         | `PUT /api/todos/1`    | Update an existing todo   |
| `DELETE`    | Delete         | `DELETE /api/todos/1` | Remove a todo             |

Key conventions:

- The resource **collection** lives at a plural noun path (`/api/todos`).
- A specific **item** in that collection is addressed by appending its id (`/api/todos/:id`).
- The server — not the client — generates the `id` for new resources, so it's never included in a `POST` body.
- `PUT` (in the way used in these tasks) supports **partial updates**: only the fields present in the body are changed, and the rest are left untouched.

---

## 21. Validation & Error Handling

Before trusting data from `req.body`, a controller should check it's actually valid:

```js
if (!title || typeof title !== "string" || title.trim() === "") {
  return res
    .status(400)
    .json({ error: "Title is required and must be a non-empty string" });
}
```

A few conventions worth internalizing:

- **Always `return` after sending an error response** — otherwise execution continues and you risk sending a second response, which throws an error.
- **`400 Bad Request`** is the standard status for invalid client input (missing/malformed fields).
- **`404 Not Found`** is returned when a valid request references a resource that doesn't exist (e.g. `GET /api/todos/999`).
- On update routes, check `!== undefined` (not just truthiness) so that legitimate falsy values (like `isUrgent: false`) aren't mistaken for "field not provided."
- `isNaN(Date.parse(deadline))` is a lightweight way to check whether a string parses to a valid date.
- For unexpected server-side failures (not the client's fault), use error-handling middleware (see [Section 18](#18-middleware--concepts--all-types)) and a `500` status rather than letting the server crash.

---

## 22. HTTP Status Codes Cheat Sheet

| Code  | Name                  | Used for                                      |
| ----- | --------------------- | --------------------------------------------- |
| `200` | OK                    | Successful `GET`, `PUT`, or `DELETE`          |
| `201` | Created               | Successful `POST` that created a new resource |
| `400` | Bad Request           | Invalid or missing data sent by the client    |
| `404` | Not Found             | The route or resource doesn't exist           |
| `500` | Internal Server Error | An unexpected error occurred on the server    |

---

## 23. Testing APIs with Postman / Thunder Client

Since a browser can only easily perform simple `GET` requests, testing `POST`/`PUT`/`DELETE` endpoints (with custom headers and JSON bodies) requires a dedicated tool.

### Postman vs Thunder Client

| Feature                    | Postman                          | Thunder Client                     |
| -------------------------- | -------------------------------- | ---------------------------------- |
| Runs inside VS Code        | No (separate desktop app)        | Yes                                |
| Account required           | Optional                         | Not required                       |
| Collections & environments | Yes                              | Yes                                |
| Automated test scripts     | Yes (advanced, JS-based)         | Yes (simpler, built-in assertions) |
| Best for                   | Larger projects, teams, API docs | Quick local testing while coding   |

### Core workflow (either tool)

1. **Create a collection** to group all requests for one API together (e.g. `Todo API`).
2. **Set a base URL variable** (e.g. `baseUrl = http://localhost:3000`) so you reference `{{baseUrl}}/api/todos` instead of retyping the full URL every time.
3. **Send a `GET` request** — set the method, enter the URL, hit Send, and confirm a `200` with the expected JSON.
4. **Send a `POST` request with a JSON body** — select the **raw/JSON** body type (this automatically sets the `Content-Type: application/json` header), enter a JSON payload, and confirm a `201`.
5. **Send `PUT`/`DELETE` requests** the same way, targeting a specific resource id in the URL.
6. **Verify validation** by deliberately sending an invalid/incomplete body and confirming you get a `400` with a useful error message.

### Common troubleshooting

- **`ECONNREFUSED`** — the server isn't running; start it with `npm run dev` first.
- **Unexpected `404`** — double check the URL path and that the router is mounted correctly in `server.js`.
- **`req.body` is `undefined`** — confirm the body type is set to JSON (not text/form) in the tool, and that `express.json()` middleware is registered in `server.js`.
- **Unexpected `400`** — check that values match the expected types exactly (e.g. `isUrgent: true`, a real boolean — not the string `"true"`).

---

## 24. Glossary

| Term                     | Definition                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| **Runtime**              | An environment that executes code — Node.js is a JS runtime outside the browser.                       |
| **Module**               | A single file of reusable JS code, imported/exported via CommonJS or ES Modules.                       |
| **Package**              | A reusable module published to npm and installed via `npm install`.                                    |
| **`package.json`**       | The manifest file describing a project's metadata, scripts, and dependencies.                          |
| **Callback**             | A function passed into another function, run once that function's async work completes.                |
| **Asynchronous**         | Code that doesn't block execution while waiting (e.g. file I/O, network requests).                     |
| **HTTP**                 | HyperText Transfer Protocol — the rules clients and servers use to communicate over the web.           |
| **Request**              | A message sent from a client to a server, specifying a method, URL, headers, and optional body.        |
| **Response**             | A message sent back from a server, with a status code, headers, and optional body.                     |
| **Middleware**           | A function with `(req, res, next)` (or `(err, req, res, next)`) that runs in the request pipeline.     |
| **Route**                | A mapping between an HTTP method + URL path and the function that handles it.                          |
| **Endpoint**             | A specific route on an API (e.g. `POST /api/todos`).                                                   |
| **REST API**             | An API designed around resources and standard HTTP methods for CRUD operations.                        |
| **CRUD**                 | Create, Read, Update, Delete — the four basic data operations.                                         |
| **In-memory storage**    | Data held only in a running program's memory (e.g. a plain array) — lost on restart, no real database. |
| **Collection**           | A saved group of API requests in a tool like Postman/Thunder Client.                                   |
| **Environment/Variable** | A reusable value (e.g. `baseUrl`) referenced across requests in a testing tool.                        |

---

## How This All Fits Together

1. **Task 1** teaches the fundamentals: Node's async model and the `fs` module.
2. **Task 2** teaches project setup: `npm`, ES Modules, third-party packages (`chalk`), and `nodemon`.
3. **Task 3** teaches how a web server actually works under the hood, using only the built-in `http` module — HTTP basics, manual routing, headers, content-types, and query parsing.
4. **Task 4** introduces **Express**, replacing all that manual boilerplate with clean routing, middleware, and a proper multi-file project structure to build a real REST API.
5. **The Postman/Thunder Client guide** teaches you how to actually exercise and verify that API, since a browser alone can't send `POST`/`PUT`/`DELETE` requests with JSON bodies.

Together, these take you from "Node can touch files" all the way to "I can build and test a structured REST API" — the foundation for nearly all backend web development in JavaScript.
