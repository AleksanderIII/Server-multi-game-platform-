import WebSocket from 'ws';
import GameSession from '../models/GameSession';

class GameSessionService {
  private sessions: { [key: string]: GameSession } = {};

  addPlayerToSession(gameId: string, playerId: string, ws: WebSocket): void {
    if (!this.sessions[gameId]) {
      this.sessions[gameId] = new GameSession(gameId);
    }
    this.sessions[gameId].addPlayer(playerId, ws);

    const gameSession = this.sessions[gameId];
    if (gameSession.isReady()) {
      const players = gameSession.getPlayers();
      const [firstPlayer, secondPlayer] = Object.values(players);

      firstPlayer.ws.send(JSON.stringify({
        type: 'start',
        opponent: secondPlayer.playerId,
        currentPlayer: firstPlayer.playerId,
      }));

      secondPlayer.ws.send(JSON.stringify({
        type: 'start',
        opponent: firstPlayer.playerId,
        currentPlayer: firstPlayer.playerId,
      }));
    }
  }

  handleMove(gameId: string, playerId: string, move: { row: number; col: number }): { validMove: boolean; winner: 'X' | 'O' | null } {
    const gameSession = this.sessions[gameId];
    if (!gameSession) {
      throw new Error(`Game session with id ${gameId} not found`);
    }

    return gameSession.handleMove(playerId, move);
  }

  getSession(gameId: string): GameSession {
    return this.sessions[gameId];
  }

  removePlayerFromSession(gameId: string, playerId: string): void {
    const gameSession = this.sessions[gameId];
    if (gameSession) {
      gameSession.removePlayer(playerId);
      if (gameSession.isEmpty()) {
        delete this.sessions[gameId];
      }
    }
  }
}

const gameSessionService = new GameSessionService();
export default gameSessionService;