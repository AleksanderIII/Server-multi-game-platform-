import { LobbyManager } from "./LobbyManager";
import WebSocket from "ws";

interface GameState {
  board: string[];
  currentPlayer: string;
  playerSymbols: Record<string, string>;
  winner: string | null;
}

const games: Record<string, GameState> = {};

export class GameManager {
  public static handleGameMessage(ws: WebSocket, data: any) {
    const { type, game, player, move } = data;

    switch (type) {
      case "START_GAME":
        this.startGame(game);
        break;

      case "MAKE_MOVE":
        this.makeMove(game, player, move);
        break;

      default:
        console.log("Unknown game message type:", type);
        break;
    }
  }

  public static startGame(game: string) {
    const lobby = LobbyManager.getLobby(game);
    if (!lobby || lobby.players.length !== 2) return;

    const [firstPlayer, secondPlayer] =
      Math.random() < 0.5
        ? [lobby.players[0], lobby.players[1]]
        : [lobby.players[1], lobby.players[0]];

    games[game] = {
      board: Array(15 * 15).fill(""),
      currentPlayer: firstPlayer.name,
      playerSymbols: { [firstPlayer.name]: "X", [secondPlayer.name]: "O" },
      winner: null,
    };

    LobbyManager.broadcastToLobby(game, {
      type: "GAME_STARTED",
      game,
      state: games[game],
    });
  }

  public static makeMove(
    game: string,
    playerName: string,
    move: { row: number; col: number }
  ) {
    const gameState = games[game];
    if (!gameState) return;

    const { board, currentPlayer, winner, playerSymbols } = gameState;
    const index = move.row * 15 + move.col;
    if (winner || board[index] || currentPlayer !== playerName) return;

    board[index] = playerSymbols[playerName];
    gameState.currentPlayer =
      currentPlayer === Object.keys(playerSymbols)[0]
        ? Object.keys(playerSymbols)[1]
        : Object.keys(playerSymbols)[0];

    const gameWinner = this.checkWinner(board);
    if (gameWinner) {
      gameState.winner = gameWinner;
    }

    LobbyManager.broadcastToLobby(game, {
      type: "GAME_UPDATE",
      game,
      state: gameState,
    });
  }

  private static checkWinner(board: string[]): string | null {
    const size = 15;
    const winLength = 5;

    for (let i = 0; i < size; i++) {
      for (let j = 0; j <= size - winLength; j++) {
        const row = board.slice(i * size + j, i * size + j + winLength);
        const col = [];
        for (let k = 0; k < winLength; k++) {
          col.push(board[(i + k) * size + j]);
        }
        const diag1 = [];
        const diag2 = [];
        for (let k = 0; k < winLength; k++) {
          diag1.push(board[(i + k) * size + (j + k)]);
          diag2.push(board[(i + k) * size + (j + winLength - 1 - k)]);
        }
        if (
          this.checkLine(row) ||
          this.checkLine(col) ||
          this.checkLine(diag1) ||
          this.checkLine(diag2)
        ) {
          return board[i * size + j];
        }
      }
    }
    return null;
  }

  private static checkLine(line: string[]): string | null {
    if (line.every((cell) => cell && cell === line[0])) {
      return line[0];
    }
    return null;
  }
}
