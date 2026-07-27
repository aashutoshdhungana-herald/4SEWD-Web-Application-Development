import { body, param } from "express-validator";

export const createTodoValidator = [
  body("title")
    // Sanitizer
    .trim()
    .isString()
    .withMessage("Title must be a string")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 1, max: 20 })
    .withMessage("Title cannot be more than 20 characters"),

  body("deadline")
    .trim()
    .notEmpty()
    .withMessage("Deadline is required")
    .isISO8601()
    .withMessage("Deadline must be a valid date (YYYY-MM-DD)"),

  body("isUrgent")
    .default(false)
    .isBoolean()
    .withMessage("Is Urgent is required and must be a boolean value"),
];

export const updateTodoValidator = [
  param("id").isInt().withMessage("id must be an integer").toInt(),
  body("title")
    .optional()
    // Sanitizer
    .trim()
    .isString()
    .withMessage("Title must be a string")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 0, max: 20 })
    .withMessage("Title cannot be more than 20 characters"),

  body("deadline")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Deadline is required")
    .isISO8601()
    .withMessage("Deadline must be a valid date (YYYY-MM-DD)"),

  body("isUrgent")
    .optional()
    .default(false)
    .isBoolean()
    .withMessage("Is Urgent is required and must be a boolean value"),
];

export const idParamValidator = [
  param("id").isInt().withMessage("id must be an integer").toInt(),
];
