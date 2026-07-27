import { TodoService } from "../services/todoService.js";
import { ValidationError } from "../errors/ValidationError.js";

export const getAllTodos = async (req, res) => {
  const todos = await TodoService.getAllTodo();
  return res.status(200).json(todos);
};

export const getTodosById = async (req, res) => {
  const id = req.params.id;
  const todo = await TodoService.getById(id);
  if (!todo) {
    return res.status(404).json({ message: "To-do Item not found" });
  }

  return res.status(200).json(todo);
};

export const createTodo = async (req, res, next) => {
  try {
    const data = req.body ?? {};
    const createdTodo = await TodoService.createTodo(data);
    return res.status(200).json({
      message: "To-do Created Successfully",
      data: createdTodo,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
    next(error);
  }
};

export const updateTodo = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = req.body ?? {};
    const updatedTodo = await TodoService.updateTodo(id, data);
    if (!updatedTodo)
      return res.status(404).json({
        message: "To-do item not found",
      });
    return res.status(200).json({
      message: "To-do item updated successfully",
      data: updatedTodo,
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({
        message: err.message,
      });
    }
    next(err);
  }
};

export const deleteTodo = async (req, res) => {
  const id = req.params.id;
  const deletedTodo = await TodoService.deleteTodo(id);
  if (!deletedTodo) {
    return res.status(404).json({
      message: "To-do item not found",
    });
  }
  return res.status(200).json({
    message: "To-do item deleted successfully",
  });
};
