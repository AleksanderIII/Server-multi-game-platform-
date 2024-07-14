import express from 'express';
import cors from 'cors';
import * as http from 'http';
import * as WebSocket from 'ws';
import sequelize from './config/database';
import gameRoutes from './routes/gameRoutes';
import playerRoutes from './routes/playerRoutes';
import authRoutes from './routes/authRoutes';
import { authenticateJWT } from './middleware/auth';
import { loggerMiddleware } from './middleware/loggerMiddleware';
import WebSocketController from './controllers/WebSocketController';

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(cors());
app.use(loggerMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/games', authenticateJWT, gameRoutes);
app.use('/api/players', authenticateJWT, playerRoutes);

sequelize
  .authenticate()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => console.error('Error connecting to PostgreSQL:', err));

sequelize
  .sync()
  .then(() => console.log('Database synchronized'))
  .catch((err) => console.error('Error synchronizing database:', err));

// Handling WebSocket connections
wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
  WebSocketController.handleConnection(ws, req);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});