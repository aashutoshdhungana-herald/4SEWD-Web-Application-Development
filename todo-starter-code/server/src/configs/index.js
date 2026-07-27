import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  db: {
    path: process.env.DB_PATH || "./database.sqlite",
  },
  cors: {
    allowedMethods: process.env.CORS_METHOD?.split(",") || ["GET"],
    allowedOrigins: process.env.CORS_ORIGIN || "",
  },
};
