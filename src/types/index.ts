export interface LobbyPlayer {
  ws: WebSocket;
  name: string;
  selectedOpponent?: string;
}

export interface ILobby {
  join(player: LobbyPlayer): void;
  leave(player: LobbyPlayer): void;
  selectOpponent(playerName: string, opponentName: string): void;
  startGame(): void;
}

export interface IGame {
  start(): void;
  makeMove(playerName: string, move: { row: number; col: number }): void;
  checkWinner(): string | null;
}

export interface IMessage {
  type: string;
  [key: string]: any;
}
