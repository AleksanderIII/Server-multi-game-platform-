import WebSocket from 'ws';

interface Move {
  row: number;
  col: number;
}

class GameSession {
  private gameId: string;
  private players: { [playerId: string]: { ws: WebSocket, playerId: string } };
  private board: string[][];
  private currentPlayer: 'X' | 'O';

  constructor(gameId: string) {
    this.gameId = gameId;
    this.players = {};
    this.board = this.initializeBoard();
    this.currentPlayer = 'X';
  }

  private initializeBoard(): string[][] {
    return Array.from({ length: 3 }, () => Array(3).fill(''));
  }

  public addPlayer(playerId: string, ws: WebSocket): void {
    this.players[playerId] = { ws, playerId };
  }

  public removePlayer(playerId: string): void {
    delete this.players[playerId];
  }

  public handleMove(playerId: string, move: Move): { validMove: boolean; winner: 'X' | 'O' | null } {
    if (playerId !== this.currentPlayer || this.board[move.row][move.col] !== '') {
      return { validMove: false, winner: null };
    }

    this.board[move.row][move.col] = this.currentPlayer;

    const winner = this.checkWinner();

    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';

    return { validMove: true, winner };
  }

  public getBoard(): string[][] {
    return this.board;
  }

  public getCurrentPlayer(): 'X' | 'O' {
    return this.currentPlayer;
  }

  public getPlayers(): { [playerId: string]: { ws: WebSocket, playerId: string } } {
    return this.players;
  }

  private checkWinner(): 'X' | 'O' | null {
    const lines = [
      ...this.board,
      ...this.board[0].map((_, col) => this.board.map(row => row[col])),
      [this.board[0][0], this.board[1][1], this.board[2][2]],
      [this.board[0][2], this.board[1][1], this.board[2][0]],
    ];

    for (const line of lines) {
      if (line.every(cell => cell === 'X')) {
        return 'X';
      }
      if (line.every(cell => cell === 'O')) {
        return 'O';
      }
    }

    return null;
  }

  public isReady(): boolean {
    return Object.keys(this.players).length === 2;
  }

  public isEmpty(): boolean {
    return Object.keys(this.players).length === 0;
  }
}

export default GameSession;