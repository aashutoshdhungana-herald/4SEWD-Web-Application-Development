import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

const todoList = [];

const createIdGenerator = (start = 1) => {
  let counter = start;
  return {
    nextId: () => counter++,
    currentId: () => counter,
  };
};

const idGen = createIdGenerator();

app.get("/", (req, res) => {
  res.send("Welcone to my To-Do App Api");
});

app.get("/api/todo", (req, res) => {
  res.status(200).json(todoList);
});

app.get("/api/todo/:id", (req, res) => {
  const id = Number(req.params.id);
  let todoItem = todoList.find((x) => x.id === id);
  if (!todoItem) return res.status(404).json({ error: "Todo item not found" });
  res.status(200).json(todoItem);
});

app.post("/api/todo", (req, res) => {
  const { title, deadline, isUrgent } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res
      .status(400)
      .json({ error: "Title is required and must be non empty" });
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
    id: idGen.nextId(),
    title: title,
    deadline: deadline,
    isUrgent: isUrgent,
  };

  todoList.push(newTodo);
  res.status(201).json(newTodo);
});

app.put("/api/todo/:id", (req, res) => {
  const id = Number(req.params.id);
  const todo = todoList.find((t) => t.id == id);

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
});

app.delete("/api/todo/:id", (req, res) => {
  const id = Number(req.params.id);

  const idx = todoList.findIndex((x) => x.id === id);
  if (idx <= -1) {
    return res.status(404).json({ error: "Todo item not found" });
  }

  const deleted = todoList.splice(idx, 1);
  return res.status(200).json({ message: "Todo deleted", todo: deleted[0] });
});

app.listen(PORT, () => {
  console.log(`App is listening on http://localhost:${PORT}`);
});
