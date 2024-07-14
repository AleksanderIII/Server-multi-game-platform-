import WebSocket from 'ws';
import { IncomingMessage } from 'http';
import GameSession from '../models/GameSession';
import jwt from 'jsonwebtoken';

interface Message {
  type: string;
  data: any;
}

class WebSocketController {
  private gameSessions: { [gameId: string]: GameSession } = {};

  public handleConnection(ws: WebSocket, req: IncomingMessage): void {
    console.log('WebSocket connection established');

    ws.on('message', (message: string) => {
      console.log(`Received message: ${message}`);

      try {
        const data: Message = JSON.parse(message);
        switch (data.type) {
          case 'join':
            this.handleJoin(ws, req, data);
            break;
          case 'move':
            this.handleMove(ws, req, data);
            break;
          default:
            console.log(`Unknown message type: ${data.type}`);
            break;
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      this.handleDisconnect(ws, req);
    });
  }

  private handleJoin(ws: WebSocket, req: IncomingMessage, data: Message): void {
    const gameId = data.data.gameId;
    const playerId = this.getPlayerIdFromWebSocket(req);

    if (!gameId || !playerId) {
      console.error('Invalid join message:', data);
      return;
    }

    let gameSession = this.gameSessions[gameId];
    if (!gameSession) {
      gameSession = new GameSession(gameId);
      this.gameSessions[gameId] = gameSession;
    }

    gameSession.addPlayer(playerId, ws);

    console.log(`Player ${playerId} joined game ${gameId}`);

    this.broadcastGameState(gameId);
  }

  private handleMove(ws: WebSocket, req: IncomingMessage, data: Message): void {
    const gameId = data.data.gameId;
    const playerId = this.getPlayerIdFromWebSocket(req);

    if (!gameId || !playerId) {
      console.error('Invalid move message:', data);
      return;
    }

    const gameSession = this.gameSessions[gameId];
    if (!gameSession) {
      console.error(`Game session not found for game ${gameId}`);
      return;
    }

    const move = data.data.move;
    const { validMove, winner } = gameSession.handleMove(playerId, move);

    if (validMove) {
      console.log(`Player ${playerId} made a move in game ${gameId}`);
      this.broadcastGameState(gameId);
    }

    if (winner) {
      console.log(`Player ${winner} won game ${gameId}`);
      this.broadcastGameWinner(gameId, winner);
      this.cleanupGame(gameId);
    }
  }

  private handleDisconnect(ws: WebSocket, req: IncomingMessage): void {
    for (const gameId in this.gameSessions) {
      const gameSession = this.gameSessions[gameId];
      const playerId = this.getPlayerIdFromWebSocket(req);
      if (playerId && gameSession.getPlayers()[playerId]) {
        gameSession.removePlayer(playerId);
        this.broadcastGameState(gameId);
        console.log(`Player ${playerId} disconnected from game ${gameId}`);
      }
    }
  }

  private broadcastGameState(gameId: string): void {
    const gameSession = this.gameSessions[gameId];
    if (!gameSession) {
      console.error(`Game session not found for game ${gameId}`);
      return;
    }

    const gameState = {
      board: gameSession.getBoard(),
      currentPlayer: gameSession.getCurrentPlayer(),
      players: Object.keys(gameSession.getPlayers()),
    };

    for (const playerId in gameSession.getPlayers()) {
      const playerWs = gameSession.getPlayers()[playerId].ws;
      if (playerWs.readyState === WebSocket.OPEN) {
        playerWs.send(JSON.stringify({ type: 'gameState', data: gameState }));
      }
    }
  }

  private broadcastGameWinner(gameId: string, winner: string): void {
    const gameSession = this.gameSessions[gameId];
    if (!gameSession) {
      console.error(`Game session not found for game ${gameId}`);
      return;
    }

    for (const playerId in gameSession.getPlayers()) {
      const playerWs = gameSession.getPlayers()[playerId].ws;
      if (playerWs.readyState === WebSocket.OPEN) {
        playerWs.send(JSON.stringify({ type: 'gameWinner', data: winner }));
      }
    }
  }

  private cleanupGame(gameId: string): void {
    delete this.gameSessions[gameId];
    console.log(`Game ${gameId} cleaned up`);
  }

  private getPlayerIdFromWebSocket(req: IncomingMessage): string | null {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
      console.error('No cookies found in request headers');
      return null;
    }

    const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
    let token = null;

    cookies.forEach((cookie) => {
      if (cookie.startsWith('token=')) {
        token = cookie.substring('token='.length, cookie.length);
      }
    });

    if (!token) {
      console.error('No JWT token found in cookies');
      return null;
    }

    try {
      const decodedToken = jwt.verify(token, 'your_secret_key_here') as { playerId: string };
      return decodedToken.playerId;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }
}

export default new WebSocketController();