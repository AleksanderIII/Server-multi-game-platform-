import WebSocket from "ws";
import { ChatManager } from "./ChatManager";
import { LobbyManager } from "./LobbyManager";
import { GameManager } from "./GameManager";

export class MessageHandler {
  public static handleMessage(ws: WebSocket, message: WebSocket.RawData) {
    try {
      const data = JSON.parse(message.toString());
      console.log("Received message:", data);

      switch (data.type) {
        case "JOIN_LOBBY":
        case "LEAVE_LOBBY":
        case "SELECT_OPPONENT":
          LobbyManager.handleLobbyMessage(ws, data);
          break;

        case "START_GAME":
        case "MAKE_MOVE":
          GameManager.handleGameMessage(ws, data);
          break;

        case "SEND_MESSAGE":
          console.log(ws, data);
          ChatManager.handleChatMessage(ws, data);
          break;

        default:
          console.log("Unknown message type:", data.type);
          break;
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }
}
