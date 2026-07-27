import { DataTypes } from "sequelize";
import { sequelize } from "../configs/database.js";

export const TodoModel = sequelize.define(
  "TodoItem",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isUrgent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "todos",
    timestamps: true,
  },
);
