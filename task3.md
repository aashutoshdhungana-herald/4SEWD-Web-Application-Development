# Building a Basic HTTP Server with Node.js

## Overview

In this tutorial, you'll build a simple HTTP server using only Node.js's built-in `http` module — no external frameworks like Express. By the end, you'll understand how Node.js handles incoming requests, routes them based on URL paths, and sends back different types of responses (plain text, HTML, and JSON).

**What you'll learn:**

- How to set up a Node.js project from scratch
- How to create and start an HTTP server
- How to handle multiple routes manually
- How to return different content types with correct headers
- How to parse query parameters
- How to handle 404 errors gracefully

---

## Prerequisites

- Basic familiarity with JavaScript (functions, objects, conditionals)
- A code editor (VS Code recommended)
- A terminal / command line

---

## Step 1: Check Requirements

Before starting, confirm Node.js is installed on your machine.

Open a terminal and run:

```bash
node -v
```

- If this prints a version number (e.g. `v20.11.0`), you're ready to go.
- If you get a "command not found" error, download and install the **latest LTS (Long-Term Support)** version from [nodejs.org](https://nodejs.org).

You can also check that `npm` (Node's package manager) is installed, since it ships with Node:

```bash
npm -v
```

---

## Step 2: Create a New Project

1. Create a new folder named `node-server`.
2. Open the folder in VS Code (`code node-server` from the terminal, or via **File > Open Folder**).
3. Open an integrated terminal inside the project folder (`` Ctrl+` `` in VS Code).

---

## Step 3: Initialize a Node.js Project

Run the following command inside the `node-server` folder:

```bash
npm init -y
```

This generates a `package.json` file with default values, skipping the interactive prompts.

Open `package.json` and take a look at what was generated. You should see fields like:

| Field     | Purpose                                                      |
| --------- | ------------------------------------------------------------ |
| `name`    | The project's name (defaults to the folder name)             |
| `version` | The project's version, starting at `1.0.0`                   |
| `main`    | The entry point file for the project (`index.js` by default) |
| `scripts` | Command shortcuts you can run with `npm run <script>`        |
| `license` | Defaults to `ISC`                                            |

You can edit `"main": "index.js"` to `"main": "server.js"` since that's the file we'll actually create, and add a convenience script:

```json
"scripts": {
   "start": "node server.js"
 }
```

This lets you run the server later with `npm start`.

---

## Step 4: Create the Project Files

Create a file named `server.js` in the project root. Your folder structure should now look like this:

```text
node-server
│
├── server.js
└── package.json
```

---

## Step 5: Create a Basic HTTP Server

Inside `server.js`, set up the foundation of the server:

1. Import the built-in `http` module (no installation needed — it's part of Node.js core).
2. Create a server instance using `http.createServer()`, passing in a request handler function.
3. Make the server listen on **port 3000**.
4. Log a confirmation message to the terminal once the server starts.

```js
const http = require("http");

const PORT = 3000;

const server = http.createServer((req, res) => {
  // Route handling will go here
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

Every time a request hits the server, the callback function passed to `createServer` runs, receiving two objects:

- `req` (request) — contains info like the URL, method, and headers.
- `res` (response) — used to send data back to the client.

---

## Step 6: Return Plain Text

Handle requests to the root route `/` and respond with plain text.

Use `req.url` to check the path, set the status code and `Content-Type` header with `res.writeHead()`, and send the body with `res.end()`.

```js
if (req.url === "/") {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Welcome to my Node.js Server!");
}
```

**Content-Type reference:** `text/plain` tells the browser to render the response as raw, unformatted text.

---

## Step 7: Return HTML

Add a route for `/about` that returns an HTML page including:

- A heading
- A paragraph describing the server
- Your name

```js
else if (req.url === '/about') {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <h1>About This Server</h1>
    <p>This is my first Node.js web server, built without any external frameworks.</p>
    <p>Created by: Your Name</p>
  `);
}
```

**Content-Type reference:** `text/html` tells the browser to parse and render the response as HTML markup.

---

## Step 8: Return JSON

Add a route for `/api/student` that returns a JSON object. Since `res.end()` expects a string, use `JSON.stringify()` to convert the JavaScript object first.

```js
else if (req.url === '/api/student') {
  const student = {
    name: 'John',
    course: 'Web Development',
    semester: 5
  };
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(student));
}
```

**Content-Type reference:** `application/json` signals that the response body is structured JSON data, which browsers and API clients (like `fetch` or Postman) will parse accordingly.

---

## Step 9: Handle Unknown Routes

For any URL that doesn't match a defined route, return a `404` status with a friendly message. This should be the final `else` block, catching everything not handled above.

```js
else {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 - Page Not Found');
}
```

---

## Step 10: Test the Server

Start the server:

```bash
node server.js
```

You should see:

```text
Server is running on http://localhost:3000
```

Open a browser and test each route:

| URL                                 | Expected Result                             |
| ----------------------------------- | ------------------------------------------- |
| `http://localhost:3000/`            | Plain text welcome message                  |
| `http://localhost:3000/about`       | HTML page with heading, paragraph, and name |
| `http://localhost:3000/api/student` | JSON object with student details            |
| `http://localhost:3000/anything`    | `404 - Page Not Found`                      |

To stop the server at any time, press `Ctrl + C` in the terminal.

---

## Challenge: Extend the Server

Once the basic routes work, add the following four routes to `server.js`.

### 1. `/contact` — HTML Page

Return an HTML page containing your email address and phone number.

```js
else if (req.url === '/contact') {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <h1>Contact Me</h1>
    <p>Email: your.email@example.com</p>
    <p>Phone: +1 234 567 8900</p>
  `);
}
```

### 2. `/api/time` — Current Date/Time as JSON

Use JavaScript's built-in `Date` object to get the current timestamp in ISO format.

```js
else if (req.url === '/api/time') {
  const timeData = { currentTime: new Date().toISOString() };
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(timeData));
}
```

Expected response:

```json
{
  "currentTime": "2026-07-10T15:30:45.000Z"
}
```

### 3. `/api/random` — Random Number as JSON

Generate a random integer between 1 and 100 using `Math.random()`.

```js
else if (req.url === '/api/random') {
  const randomNumber = Math.floor(Math.random() * 100) + 1;
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ randomNumber }));
}
```

Expected response:

```json
{
  "randomNumber": 42
}
```

### 4. `/hello` — Query Parameter Handling

This route needs to read a `name` query parameter from the URL (e.g. `?name=Alice`). Since `req.url` is just a raw string, use Node's built-in `url` module to parse it safely.

```js
const url = require('url'); // add this import at the top of server.js

// inside the route handling logic:
else if (req.url.startsWith('/hello')) {
  const parsedUrl = url.parse(req.url, true);
  const name = parsedUrl.query.name || 'Guest';

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`Hello, ${name}!`);
}
```

Test cases:

| URL                                      | Expected Response |
| ---------------------------------------- | ----------------- |
| `http://localhost:3000/hello?name=Alice` | `Hello, Alice!`   |
| `http://localhost:3000/hello`            | `Hello, Guest!`   |

---

## Full Route Reference

| Route             | Method | Content-Type       | Description           |
| ----------------- | ------ | ------------------ | --------------------- |
| `/`               | GET    | `text/plain`       | Welcome message       |
| `/about`          | GET    | `text/html`        | About page            |
| `/api/student`    | GET    | `application/json` | Sample student data   |
| `/contact`        | GET    | `text/html`        | Contact info          |
| `/api/time`       | GET    | `application/json` | Current server time   |
| `/api/random`     | GET    | `application/json` | Random number (1–100) |
| `/hello?name=`    | GET    | `text/plain`       | Personalized greeting |
| _(anything else)_ | GET    | `text/plain`       | 404 Not Found         |

---

## Final Project Structure

```text
node-server
│
├── server.js
└── package.json
```
