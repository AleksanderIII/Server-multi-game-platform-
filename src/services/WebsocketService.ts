import WebSocket from "ws";
import http from "http";
import { MessageHandler } from "./MessageHandler";
import { LobbyManager } from "./LobbyManager";
import { GameManager } from "./GameManager";

export class WebSocketService {
  private wss: WebSocket.Server;

  constructor(server: http.Server) {
    this.wss = new WebSocket.Server({ server });
    this.wss.on("connection", this.handleConnection.bind(this));
  }

  private handleConnection(ws: WebSocket) {
    console.log("New WebSocket connection");

    ws.on("message", (message: WebSocket.RawData) =>
      MessageHandler.handleMessage(ws, message)
    );
    ws.on("close", () => this.handleDisconnect(ws));
  }

  private handleDisconnect(ws: WebSocket) {
    console.log("Client disconnected");

    for (const game in LobbyManager.getLobbies()) {
      const lobby = LobbyManager.getLobby(game);
      if (lobby) {
        lobby.players = lobby.players.filter(player => player.ws !== ws);
        if (lobby.players.length === 0) {
          delete LobbyManager.getLobbies()[game];
        } else {
          LobbyManager.broadcastToLobby(game, { type: "LOBBY_UPDATE", game, players: lobby.players.map(player => player.name) });
        }
      }
    }
  }
  
  public static sendMessage(ws: WebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}