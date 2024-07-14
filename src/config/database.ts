import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  "multi_game_platform",
  "postgres",
  "6818792Explorer",
  {
    host: "localhost",
    dialect: "postgres",
    port: 5433,
  }
);

export default sequelize;
