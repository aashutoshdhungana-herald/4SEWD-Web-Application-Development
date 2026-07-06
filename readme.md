# Web Application Development — React Reference Guide

### 4SEWD | Tutorial Week 3 Reference

This README covers npm, React fundamentals, JSX, components, props, state, side-effects, promises/async-await, and persisting data with localForage via a service layer — with syntax and examples for quick reference.

---

## Table of Contents

1. [Introduction to npm](#1-introduction-to-npm)
2. [Introduction to React](#2-introduction-to-react)
3. [Building Your First React Application](#3-building-your-first-react-application)
4. [Understanding the Project Files](#4-understanding-the-project-files)
5. [JSX](#5-jsx)
6. [React Components](#6-react-components)
7. [Props](#7-props)
8. [State & Interactivity](#8-state--interactivity)
9. [Keeping Components Pure](#9-keeping-components-pure)
10. [Side Effects & useEffect](#10-side-effects--useeffect)
11. [Promises & Async/Await](#11-promises--asyncawait)
12. [Persisting Data: localForage & the Service Layer Pattern](#12-persisting-data-localforage--the-service-layer-pattern)
13. [Form Handling](#13-form-handling)
14. [Further Reading](#14-further-reading)

---

## 1. Introduction to npm

**npm** (Node Package Manager) is the default package manager for Node.js. It is used to download, share, and manage reusable blocks of code called **packages/modules**.

- **The npm registry**: an online database of open-source packages that developers publish to.
- **The npm command line tool**: runs in your terminal and lets you install, update, or delete packages — downloading them from the registry.

Common packages: `date-fns`, `react`, `lodash`, `moment`

### Key npm Concepts

| File/Folder         | Description                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `package.json`      | Manifest for your project — lists name, version, and dependencies                        |
| `node_modules/`     | Folder where npm stores downloaded package code                                          |
| `package-lock.json` | Auto-generated file that locks exact dependency versions so everyone gets the same setup |

### Common npm Commands

| Command                        | Description                                                       |
| ------------------------------ | ----------------------------------------------------------------- |
| `npm init`                     | Initializes a new project and creates a `package.json` file       |
| `npm install <package-name>`   | Downloads a package from the registry and adds it to your project |
| `npm update`                   | Updates your packages to their latest version                     |
| `npm uninstall <package-name>` | Removes a package from your project                               |

We use npm throughout this module to install our React/Express ecosystem, and to run, build, and test our code.

---

## 2. Introduction to React

- React is a **JavaScript library** built by Facebook (Meta) for building user interfaces.
- Used to build **SPAs (Single Page Applications)** — the entire UI renders in a single HTML file rather than multiple pages.
- React lets you build **reusable components**.

---

## 3. Building Your First React Application

Make sure Node and npm are installed:

```bash
npm -v
node -v
```

Go to the folder where you want your project, open a terminal there, and run:

```bash
npm create vite@latest todo-app -- --template react
```

- Select **ESLint** for the linter
- Select **Yes** when asked to install with npm and start now

This installs dependencies and runs your app. Follow the link in the terminal to view it.

> **Note:** Vite is a build tool and development server. [Learn more](https://vitejs.dev)

---

## 4. Understanding the Project Files

| File/Folder                          | Purpose                                                                                                                                             |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json` / `package-lock.json` | Blueprint of the project; lists dependencies (react, vite); contains scripts like `npm run dev`                                                     |
| `vite.config.js`                     | Configures Vite (aliases, proxying API requests, CSS plugins)                                                                                       |
| `index.html`                         | Entry point — contains `<div id="root"></div>` where React injects the app, and `<script type="module" src="/src/main.jsx"></script>` hooking up JS |
| `public/`                            | Static assets served untouched by React; referenced by absolute path, e.g. `/vite.svg`                                                              |
| `src/`                               | Working directory of your app                                                                                                                       |
| `src/main.jsx`                       | Gateway between React code and the browser HTML; grabs `#root` and uses `createRoot` to render `<App />`                                            |
| `src/App.jsx`                        | Root component of the application — where you build your UI                                                                                         |
| `src/assets/`                        | Processed by Vite; items must be **imported** to be used, and are optimized (compressed/cached)                                                     |

```js
// Example: importing from assets
import reactLogo from "./assets/react.svg";
```

---

## 5. JSX

**JSX (JavaScript XML)** is a syntax extension for JavaScript that enables HTML-like code inside a JS file. It's used with React to describe UI structure.

Browsers don't understand JSX — React compiles it into regular JS behind the scenes:

```js
// JSX
const element = <h1>Hello, world</h1>;

// Compiles to
const element = React.createElement("h1", null, "Hello, world!");
```

### Rules for Writing JSX

**1. JSX must return a single root element** — use a `<div>` or a Fragment (`<>...</>`)

```jsx
// Invalid — two root elements
return (
  <h1>Title</h1>
  <p>Description</p>
);

// Valid — wrapped in a Fragment
return (
  <>
    <h1>Title</h1>
    <p>Description</p>
  </>
);
```

**2. Embed JavaScript using curly braces `{}`**

```jsx
const name = "Sarah";
const element = <h1>Hello, {name}!</h1>;
```

**3. Attributes use camelCase**, and some clash with JS keywords:

- `onclick` → `onClick`
- `class` → `className`
- `for` → `htmlFor`

```jsx
return (
  <div className="container" onClick={handleClick} tabIndex={0}>
    Click me
  </div>
);
```

**4. Only JS _expressions_ are allowed, not _statements_.** `if/else` is a statement and can't be used directly — use a ternary instead:

```jsx
<p>{isLoggedIn ? "Welcome back!" : "Please log in"}</p>
```

**5. Elements without children must be self-closed:**

```jsx
<img src="photo.jpg" alt="A photo" />
<br />
<input type="text" />
```

---

## 6. React Components

A React component is a **reusable, self-contained piece of UI** — essentially a JavaScript function that returns JSX. Think of it as creating your own custom, reusable HTML tags.

```jsx
function HelloWorld() {
  return <h1>Hello, world!</h1>;
}

// Each HelloWorld renders the same UI, reused anywhere
function App() {
  return (
    <div>
      <HelloWorld />
      <HelloWorld />
      <HelloWorld />
    </div>
  );
}
```

---

## 7. Props

**Props** (properties) are how React components communicate — a parent passes data down to its child components.

- Similar to HTML attributes, but props can accept **any JavaScript value** (strings, arrays, functions, objects), not just strings.
- Built-in HTML tags have predefined props (`src`, `alt`, `height`, `width` for `<img>`).
- Your own components (e.g. `<TaskContainer>`) can accept any custom props you define.

```jsx
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}

function App() {
  return <Greeting name="Sarah" />;
}
```

---

## 8. State & Interactivity

### What is State?

**State** is a component's memory — a built-in object used to store data that can change over time. Whenever a component's state changes, React automatically **re-renders** the component (and its children) to reflect the new data.

### The `useState` Hook

```jsx
import { useState } from "react";

const [count, setCount] = useState(0);
```

- `useState(0)` — call the hook with an initial value
- `count` — the current state variable (starts at `0`)
- `setCount` — the setter function; the _only_ way to update `count`
- **Array destructuring** — `useState` returns a 2-item array, so you name the pair however you like

### How React Updates the UI

React keeps a lightweight in-memory copy of the UI called the **Virtual DOM (VDOM)**. When state changes:

1. **Triggering** a render (state is updated)
2. **Rendering** the component (calculated first in the VDOM)
3. **Committing** to the DOM (React diffs the new VDOM against the old one and updates only what changed)

This makes React efficient for SPAs that need frequent UI updates.

### Rules for Updating State

**Never mutate state directly.** Always use the setter, and create new copies of objects/arrays rather than editing them in place:

```js
// Updating an Object
const [user, setUser] = useState({ name: "Bob", age: 25 });
setUser({ ...user, name: "Alice" }); // spreads old properties, overrides 'name'

// Updating an Array
const [items, setItems] = useState([1, 2, 3]);
setItems([...items, 4]); // new array with item appended
```

**Use the functional update form when new state depends on old state.** State updates are asynchronous and batched — reading the state variable directly can give you a stale value.

```js
const [count, setCount] = useState(0);

// ❌ Incorrect: bug-prone if called multiple times in one event
function incrementStale() {
  setCount(count + 1);
}

// ✅ Correct: always receives the latest state
function incrementSafe() {
  setCount((prevCount) => prevCount + 1);
}
```

**State doesn't update immediately after calling the setter** — it only updates on the next render:

```js
const [count, setCount] = useState(0);

function handleClick() {
  setCount(count + 1);
  console.log(count); // prints '0', not '1'!
}
```

---

## 9. Keeping Components Pure

A **pure function**:

- Only performs a calculation and nothing more
- Does not change objects/variables that existed before it was called
- Given the same inputs, always returns the same output

React's rendering process must always be pure — components should only return their JSX, without mutating any outside state during render.

### ❌ Example of an Impure Component

```jsx
let guest = 0;

function Cup() {
  // Bad: mutating a variable declared outside the component
  guest = guest + 1;
  return <h2>Tea cup for guest #{guest}</h2>;
}

export default function TeaSet() {
  return (
    <>
      <Cup />
      <Cup />
      <Cup />
    </>
  );
}
```

Calling `Cup` multiple times produces different results each time — this is unpredictable. **Fix it** by passing `guest` in as a prop instead of reading/writing an outside variable.

---

## 10. Side Effects & useEffect

A **side effect** is any action outside React's pure rendering process — interacting with something external to the component.

### Common Side Effects

- **Data fetching** — requesting data via `fetch` or `axios`
- **Manual DOM manipulation** — e.g. updating `document.title`, focusing an input
- **Timers** — `setTimeout`, `setInterval`
- **Browser APIs** — `localStorage`, global event listeners

### The `useEffect` Hook

`useEffect` safely separates side effects from rendering logic, letting a component synchronize with an external system.

```jsx
import { useEffect } from "react";

useEffect(() => {
  // 1. Side effect code goes here
  return () => {}; // 2. (Optional) cleanup code
}, [dependency1, dependency2]); // 3. Dependency array
```

- **Callback function** — contains the side-effect logic, and optionally returns a cleanup function
- **Dependency array** — controls when the effect re-runs (empty array `[]` = run once on mount; omitted = run every render; `[dep]` = run when `dep` changes)

---

## 11. Promises & Async/Await

### What is a Promise?

A **Promise** is an object representing the eventual result of an asynchronous operation. It's used for things like network requests, timers, or reading files — anything that doesn't finish instantly.

A promise is always in one of three states:

| State         | Meaning                              |
| ------------- | ------------------------------------ |
| **Pending**   | The operation hasn't finished yet    |
| **Fulfilled** | The operation completed successfully |
| **Rejected**  | The operation failed                 |

### `.then()` / `.catch()` Syntax

```js
fetch("/api/tasks")
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Something went wrong:", error));
```

- `.then()` runs when the promise resolves (fulfills)
- `.catch()` runs when the promise rejects
- `.finally()` runs regardless of outcome (e.g. hiding a loading spinner)

### `async` / `await` Syntax

`async`/`await` is syntactic sugar built on top of promises — it lets you write asynchronous code that _reads_ like synchronous code.

- Marking a function `async` means it always returns a promise
- `await` pauses execution of that function until the promise settles, without blocking the rest of the app

```js
async function getTasks() {
  try {
    const response = await fetch("/api/tasks");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Something went wrong:", error);
  }
}
```

- Wrap `await` calls in `try/catch` to handle rejected promises — this replaces `.catch()`
- `await` can only be used inside a function marked `async`

### Using Async Code Inside `useEffect`

The function passed to `useEffect` **cannot be `async` itself** (React expects it to return either nothing or a cleanup function, not a promise). Define an async function inside the effect and call it immediately instead:

```jsx
import { useState, useEffect } from "react";

function TaskList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    async function loadTasks() {
      const data = await getTasks();
      setTasks(data);
    }

    loadTasks();
  }, []);

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>{task.name}</li>
      ))}
    </ul>
  );
}
```

> **Tip:** If you need to cancel or ignore a stale request (e.g. the component unmounted before the fetch finished), track a boolean flag or use an `AbortController` and check it before calling `setState`.

---

## 12. Persisting Data: localForage & the Service Layer Pattern

### What is localForage?

**localForage** is an npm package that gives you simple, `Promise`-based, key-value storage in the browser. It behaves like `localStorage`, but:

- Every method is **asynchronous** and returns a Promise (works great with `async`/`await`)
- It can store more than just strings — objects, arrays, blobs, files — without manual `JSON.stringify`/`parse`
- It automatically picks the best available storage under the hood (IndexedDB, WebSQL, then falls back to `localStorage`), so it's more reliable across browsers than `localStorage` alone

```bash
npm install localforage
```

```js
import localforage from "localforage";

// Save data
await localforage.setItem("tasks", tasks);

// Read data
const tasks = await localforage.getItem("tasks");

// Remove a single item
await localforage.removeItem("tasks");

// Wipe everything localForage is managing
await localforage.clear();
```

### Why Separate Out a Service Layer?

It's tempting to call `localforage.getItem(...)` / `setItem(...)` directly inside your components, but mixing storage logic into your UI components causes a few problems:

- Components become harder to read — UI logic and persistence logic are tangled together
- If you switch storage strategies later (e.g. localForage → a real backend API), you'd have to hunt through every component that touches storage
- It's harder to test components in isolation when they depend directly on a storage implementation

Instead, put all persistence logic in its own module — a **service layer** — and have components call that instead of talking to localForage directly.

```js
// src/services/taskService.js
import localforage from "localforage";

const STORAGE_KEY = "tasks";

export async function getTasks() {
  const tasks = await localforage.getItem(STORAGE_KEY);
  return tasks ?? []; // default to an empty array if nothing is stored yet
}

export async function saveTasks(tasks) {
  await localforage.setItem(STORAGE_KEY, tasks);
}

export async function addTask(task) {
  const tasks = await getTasks();
  const updated = [...tasks, task];
  await saveTasks(updated);
  return updated;
}

export async function deleteTask(taskId) {
  const tasks = await getTasks();
  const updated = tasks.filter((t) => t.id !== taskId);
  await saveTasks(updated);
  return updated;
}
```

Components then import from the service instead of knowing anything about _how_ or _where_ the data is stored:

```jsx
import { useState, useEffect } from "react";
import { getTasks, addTask } from "../services/taskService";

function TaskApp() {
  const [tasks, setTasks] = useState([]);

  // Load persisted tasks once, on mount
  useEffect(() => {
    async function loadTasks() {
      const storedTasks = await getTasks();
      setTasks(storedTasks);
    }

    loadTasks();
  }, []);

  async function handleAddTask(newTask) {
    const updatedTasks = await addTask(newTask);
    setTasks(updatedTasks); // keep component state in sync with storage
  }

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>{task.name}</li>
      ))}
    </ul>
  );
}
```

**The pattern to remember:**

1. **Service layer** (`taskService.js`) — knows _how_ to persist data (localForage today, maybe an API tomorrow). Exposes plain `async` functions like `getTasks`, `addTask`.
2. **Component** (`TaskApp.jsx`) — doesn't know or care what storage is used. It just calls the service functions and updates its own state (`useState`) with the results so React can re-render.

This keeps components focused purely on rendering UI, while all the "how do we save/load this" logic lives in one predictable place.

---

## 13. Form Handling

React forms typically use **controlled inputs** — inputs whose values are driven by component state.

### Controlled Input Flow

1. **Initialize State** — create a state variable to hold the input's value
2. **Bind Value** — set the input's `value` attribute to that state variable
3. **Listen for Changes** — attach an `onChange` handler to update state as the user types

```jsx
import { useState } from "react";

function NameForm() {
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Submitted name:", name);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## 14. Further Reading

- [W3Schools — React Tutorial](https://www.w3schools.com/react/default.asp)
- [React Official Docs — react.dev/learn](https://react.dev/learn)
- [MDN — Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
- [MDN — async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [localForage — GitHub / Docs](https://localforage.github.io/localForage/)

---

## Quick Reference Cheat Sheet

| Concept                       | Syntax                                                                                  |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| Create a Vite React app       | `npm create vite@latest my-app -- --template react`                                     |
| Install a package             | `npm install <package-name>`                                                            |
| Functional component          | `function MyComponent() { return <div>...</div>; }`                                     |
| Import/use a component        | `<MyComponent />`                                                                       |
| Declare state                 | `const [value, setValue] = useState(initialValue);`                                     |
| Update state safely           | `setValue(prev => prev + 1);`                                                           |
| Run a side effect             | `useEffect(() => { ... }, [deps]);`                                                     |
| Controlled input              | `<input value={state} onChange={e => setState(e.target.value)} />`                      |
| Conditional rendering         | `{condition ? <A /> : <B />}`                                                           |
| Rendering a list              | `{items.map(item => <li key={item.id}>{item.name}</li>)}`                               |
| Declare an async function     | `async function loadData() { ... }`                                                     |
| Await a promise               | `const data = await fetch(url).then(r => r.json());`                                    |
| Handle async errors           | `try { await doThing(); } catch (err) { ... }`                                          |
| Async call inside `useEffect` | `useEffect(() => { async function run(){ ... } run(); }, []);`                          |
| Save data with localForage    | `await localforage.setItem("key", value);`                                              |
| Read data with localForage    | `const value = await localforage.getItem("key");`                                       |
| Service layer function        | `export async function getTasks() { return await localforage.getItem("tasks") ?? []; }` |
