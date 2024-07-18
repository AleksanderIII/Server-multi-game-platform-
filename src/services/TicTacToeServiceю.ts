import * as WebSocket from "ws";
import { WebSocketService } from "./websocketService";
import { Server as HttpServer } from "http";
import { generateUUID } from "./utils";

interface GameState {
  board: string[][];
  currentPlayer: string;
  winner: string | null;
}

class TicTacToeService extends WebSocketService {
  private games: Record<string, GameState> = {};

  constructor(server: HttpServer) {
    super(server);
  }

  protected routeMessage(ws: WebSocket, data: any) {
    const game = data.game;
    const playerName = data.player;

    switch (data.type) {
      case "START_GAME":
        this.handleStartGame(game);
        break;

      case "MAKE_MOVE":
        this.handleMakeMove(game, playerName, data.move);
        break;

      default:
        console.log(`Unknown message type: ${data.type}`);
        break;
    }
  }

  private handleStartGame(game: string) {
    const newGame: GameState = {
      board: Array(3)
        .fill(null)
        .map(() => Array(3).fill(null)),
      currentPlayer: "X",
      winner: null,
    };
    this.games[game] = newGame;

    this.broadcastToLobby(game, {
      type: "GAME_STARTED",
      game,
      state: newGame,
    });
  }

  private handleMakeMove(
    game: string,
    playerName: string,
    move: { row: number; col: number }
  ) {
    const gameState = this.games[game];
    if (!gameState) return;

    const { board, currentPlayer, winner } = gameState;
    if (winner || board[move.row][move.col]) {
      return;
    }

    board[move.row][move.col] = currentPlayer;
    gameState.currentPlayer = currentPlayer === "X" ? "O" : "X";

    const gameWinner = this.checkWinner(board);
    if (gameWinner) {
      gameState.winner = gameWinner;
    }

    this.broadcastToLobby(game, {
      type: "GAME_UPDATE",
      game,
      state: gameState,
    });
  }

  private checkWinner(board: string[][]): string | null {
    const lines = [
      // Rows
      [board[0][0], board[0][1], board[0][2]],
      [board[1][0], board[1][1], board[1][2]],
      [board[2][0], board[2][1], board[2][2]],
      // Columns
      [board[0][0], board[1][0], board[2][0]],
      [board[0][1], board[1][1], board[2][1]],
      [board[0][2], board[1][2], board[2][2]],
      // Diagonals
      [board[0][0], board[1][1], board[2][2]],
      [board[2][0], board[1][1], board[0][2]],
    ];

    for (const line of lines) {
      if (line[0] && line[0] === line[1] && line[0] === line[2]) {
        return line[0];
      }
    }

    return null;
  }

  protected handleDisconnect(ws: WebSocket) {
    console.log("Client disconnected");
    for (const game in this.lobbies) {
      this.lobbies[game].players = this.lobbies[game].players.filter(
        (player) => player.ws !== ws
      );
      console.log(`Removed client from game lobby: ${game}`);
      this.broadcastToLobby(game, {
        type: "LOBBY_UPDATE",
        game,
        players: this.lobbies[game].players.map((player) => player.name),
      });

      if (
        this.lobbies[game].gameReady &&
        this.lobbies[game].players.length < 2
      ) {
        this.lobbies[game].gameReady = false;
      }
    }
  }

  private broadcastToLobby(game: string, message: any) {
    if (this.lobbies[game]) {
      this.lobbies[game].players.forEach(({ ws }) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        }
      });
    }
  }
}

export default TicTacToeService;
