import { TodoModel } from "../models/todoModel.js";
import { ValidationError } from "../errors/ValidationError.js";

export const TodoService = {
  getAllTodo: () => {
    return TodoModel.findAll();
  },

  getById: (id) => {
    return TodoModel.findByPk(id);
  },

  createTodo: (data) => {
    return TodoModel.create({
      title: data.title,
      deadline: data.deadline,
      isUrgent: data.isUrgent,
    });
  },

  updateTodo: async (id, data) => {
    const todo = await TodoModel.findByPk(id);
    if (!todo) return null;

    if (data.title !== undefined) {
      todo.title = data.title;
    }

    if (data.deadline !== undefined) {
      todo.deadline = data.deadline;
    }

    if (data.isUrgent !== undefined) {
      todo.isUrgent = data.isUrgent;
    }
    await todo.save();
    return todo;
  },

  deleteTodo: async (id) => {
    const todo = await TodoModel.findByPk(id);
    if (!todo) return null;
    await todo.destroy();
    return todo;
  },
};
