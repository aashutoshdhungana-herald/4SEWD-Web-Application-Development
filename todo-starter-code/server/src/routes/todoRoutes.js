import { Router } from "express";
import {
  createTodo,
  deleteTodo,
  getAllTodos,
  getTodosById,
  updateTodo,
} from "../controllers/todoController.js";
import {
  createTodoValidator,
  idParamValidator,
  updateTodoValidator,
} from "../validators/todoValidator.js";
import { validate } from "../middlewares/validationMiddleware.js";

const router = Router();

router.get("/", getAllTodos);
router.get("/:id", idParamValidator, validate, getTodosById);
router.post("/", createTodoValidator, validate, createTodo);
router.put("/:id", updateTodoValidator, validate, updateTodo);
router.delete("/:id", idParamValidator, validate, deleteTodo);

export default router;
