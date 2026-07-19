# Adding Routing to your Application

You have been provided a started code in todo-app-initial. Follow the steps in this task to add routing to the app.

## Objectives:

- Learn how to define routes using `react-router`
- Organize page-level components into a `pages` folder
- Navigate between pages using `NavLink` and `Link`
- Read route parameters using `useParams`
- Navigate programmatically using `useNavigate`

## Step 1: Install react-router

- Open the todo-app-initial folder in VSCode and run the following command in the terminal

```bash
npm install react-router
```

## Step 2: Organize page level components

- You should already have a `pages` folder in `src/`
- Add `Home`, `AddTodo` and `TodoItem` components in the `pages` folder
- These components represent full pages of your application, as opposed to the reusable components in the `components` folder
- The `Home` page should render the `TaskContainer` component
- The `AddTodo` page should render the `Form` component
- The `TodoItem` page should render the `TaskDetail` component

- Your `Home.jsx` should look something like this

```JSX
import TaskContainer from "../components/TaskContainer/TaskContainer";

function Home() {
  return <TaskContainer containerTitle={"Tasks Pending Today"} />;
}

export default Home;
```

- Update `App.jsx` to remove the direct usage of `TaskContainer` and `Form`, since these will now be rendered through the `Home` and `AddTodo` pages instead

## Step 3: Define your routes

- In `App.jsx`, import `BrowserRouter`, `Routes` and `Route` from `react-router`

```JSX
import { BrowserRouter, Routes, Route } from "react-router";
```

- Wrap your application in the `BrowserRouter` component
- Use the `Routes` component to define individual `Route` elements for each page

- Define the following routes:
  - `/` should render the `Home` page
  - `/add` should render the `AddTodo` page
  - `/task/:id` should render the `TodoItem` page

- Your `App.jsx` should look something like this

```JSX
import { BrowserRouter, Routes, Route } from "react-router";
import PageTitle from "./components/PageTitle/PageTitle";
import NavBar from "./components/NavBar/NavBar";
import Home from "./pages/Home";
import AddTodo from "./pages/AddTodo";
import TodoItem from "./pages/TodoItem";

function App() {
  return (
    <BrowserRouter>
      <PageTitle />
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddTodo />} />
        <Route path="/task/:id" element={<TodoItem />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

- Run the application and try navigating to `/add` and `/task/1` directly through the browser URL bar to check if the correct pages render

## Step 4: Add navigation links to the NavBar

- Open the `NavBar` component and import `NavLink` from `react-router`

```JSX
import { NavLink } from "react-router";
```

- Add a `NavLink` inside the `<nav>` element pointing to `/` with the text `Task List`
- Add another `NavLink` pointing to `/add` with the text `Add New Task`

- Unlike a regular `Link`, `NavLink` lets you style the active link differently using the `className` prop with a callback

```JSX
<NavLink
  to="/"
  className={({ isActive }) => (isActive ? "active-link" : "")}
>
  Task List
</NavLink>
```

- Your `NavBar.jsx` should look something like this

```JSX
import { NavLink } from "react-router";
import "./NavBar.css";

function NavBar() {
  return (
    <nav>
      <NavLink
        to="/"
        className={({ isActive }) => (isActive ? "active-link" : "")}
      >
        Task List
      </NavLink>
      <NavLink
        to="/add"
        className={({ isActive }) => (isActive ? "active-link" : "")}
      >
        Add New Task
      </NavLink>
    </nav>
  );
}

export default NavBar;
```

- Test the application to see the navbar links working and switching pages correctly

## Step 5: Link from TaskItem to the task detail page

- Open the `TaskItem` component and import `Link` from `react-router`

```JSX
import { Link } from "react-router";
```

- Wrap the task text (or the whole list item content) in a `Link` pointing to `/task/:id`, replacing `:id` with the actual task's `id`

```JSX
<Link to={`/task/${task.id}`}>{task.text}</Link>
```

- Your `TaskItem.jsx` should look something like this

```JSX
import { Link } from "react-router";
import "./TaskItem.css";

function TaskItem({ task }) {
  return (
    <li className={task.isUrgent ? "task-item urgent-task" : "task-item"}>
      <span>{task.time}</span>-
      <span>{task.text}</span>
      &nbsp;&nbsp;
      <Link to={`/task/${task.id}`}>View Details</Link>
    </li>
  );
}

export default TaskItem;
```

- Click on a task from the list and check if it navigates to the correct `/task/:id` URL

## Step 6: Read the task id using useParams

- Open the `TaskDetail` component and import `useParams` from `react-router`

```JSX
import { useParams } from "react-router";
```

- Call the `useParams` hook to get the `id` from the URL

```JSX
const { id } = useParams();
```

- Import the `getTaskById` function from `TaskService.js`
- Add a state to store the task details, and use `useEffect` to fetch the task by `id` when the component mounts
- Add `id` to the dependency array of the `useEffect`, so the task is refetched if the user navigates between different `/task/:id` URLs

- Your `TaskDetail.jsx` should look something like this

```JSX
import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { getTaskById } from "../services/TaskService";

function TaskDetail() {
  const { id } = useParams();
  const [task, setTask] = useState(null);

  useEffect(() => {
    const loadTask = async () => {
      let foundTask = await getTaskById(id);
      setTask(foundTask);
    };

    loadTask();
  }, [id]);

  if (!task) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <h2>{task.text}</h2>
      <p>Deadline: {task.time}</p>
      <p>{task.isUrgent ? "Urgent" : "Not Urgent"}</p>
    </div>
  );
}

export default TaskDetail;
```

- Test the application by clicking on different tasks and checking if the correct details are shown

## Step 7: Navigate programmatically after form submission

- Open the `Form` component and import `useNavigate` from `react-router`

```JSX
import { useNavigate } from "react-router";
```

- Call the `useNavigate` hook to get a `navigate` function

```JSX
const navigate = useNavigate();
```

- Remove the `setCurrentPage` prop and its usages from the `Form` component, since page switching is now handled by the router
- In the `handleSubmit` function, after the `createTask` call succeeds, call `navigate("/")` to redirect the user back to the task list

- Your `handleSubmit` function should look something like this

```JSX
const handleSubmit = async (e) => {
  e.preventDefault();
  await createTask(title, deadline, isUrgent);
  navigate("/");
  alert("Task Saved Successfully");
};
```

- Test the application: submit the form and check if you are redirected to the task list, and if the newly added task shows up

## Final checklist

- [ ] `react-router` installed
- [ ] `BrowserRouter` and `Routes` set up in `App.jsx`
- [ ] `Home`, `AddTodo` and `TodoItem` pages wired to `/`, `/add` and `/task/:id`
- [ ] `NavBar` uses `NavLink` for `Task List` and `Add New Task`
- [ ] `TaskItem` uses `Link` to navigate to `/task/:id`
- [ ] `TaskDetail` uses `useParams` to read the `id` and load the task
- [ ] `Form` uses `useNavigate` to redirect to `/` after successful submission
