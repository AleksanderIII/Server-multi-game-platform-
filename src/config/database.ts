import { Sequelize } from "sequelize";
import dotenv from "dotenv";

const sequelize = new Sequelize(
  process.env.DATABASE_NAME || "multi_game_platform",
  process.env.DATABASE_USER || "postgres",
  process.env.DATABASE_PASSWORD || "password",
  {
    host: process.env.DATABASE_HOST || "localhost",
    dialect: "postgres",
    port: parseInt(process.env.DATABASE_PORT!, 10) || 5432,
  }
);

export default sequelize;
