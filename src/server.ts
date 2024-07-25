import express from "express";
import cors from "cors";
import http from "http";
import sequelize from "./config/database";
import gameRoutes from "./routes/gameRoutes";
import playerRoutes from "./routes/playerRoutes";
import authRoutes from "./routes/authRoutes";
import { authenticateJWT } from "./middleware/auth";
import { loggerMiddleware } from "./middleware/loggerMiddleware";
import cookieParser from "cookie-parser";
import { WebSocketService } from "./services/WebsocketService";

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://192.168.0.104:3000"],
    credentials: true,
  })
);
app.use(loggerMiddleware);
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/games", authenticateJWT, gameRoutes);
app.use("/api/players", authenticateJWT, playerRoutes);

sequelize
  .authenticate()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Error connecting to PostgreSQL:", err));

sequelize
  .sync()
  .then(() => console.log("Database synchronized"))
  .catch((err) => console.error("Error synchronizing database:", err));

const webSocketService = new WebSocketService(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
