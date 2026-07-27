import { sequelize } from "../configs/database.js";
import "../models/todoModel.js";

const run = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database sync successfully");
    process.exit(0);
  } catch (err) {
    console.error("Failed to sync database:", err);
    process.exit(1);
  }
};

run();
