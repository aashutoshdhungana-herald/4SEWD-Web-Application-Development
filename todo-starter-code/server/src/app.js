import express from "express";
import { HandleError } from "./middlewares/errorHandler.js";
import { HandleNotFound } from "./middlewares/notFoundHandler.js";
import TodoRouter from "./routes/todoRoutes.js";
import cors from "cors";
import { config } from "./configs/index.js";

const app = express();

app.use(
  cors({
    origin: config.cors.allowedOrigins,
    methods: config.cors.allowedMethods,
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  return res.status(400).send("Welcome to my to-do list app");
});

app.use("/api/todo", TodoRouter);

app.use(HandleNotFound);
app.use(HandleError);

export default app;
