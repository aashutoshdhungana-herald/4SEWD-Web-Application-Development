import { Sequelize } from "sequelize";
import { config } from "./index.js";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: config.db.path,
  logging: false,
});
