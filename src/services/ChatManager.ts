import { LobbyManager } from "./LobbyManager";
import WebSocket from "ws";

interface ChatMessage {
  id: string;
  game: string;
  player: string;
  text: string;
  time: string;
}

interface IMessage {
  id: string;
  text: string;
  player: string;
  time: string;
}

const chatHistory: Record<string, ChatMessage[]> = {};

export class ChatManager {
  public static handleChatMessage(ws: WebSocket, data: any) {
    const { type, game, message } = data;

    switch (type) {
      case "SEND_MESSAGE":
        this.receiveMessage(game, message);
        break;

      default:
        console.log("Unknown chat message type:", type);
        break;
    }
  }

  public static receiveMessage(game: string, message: IMessage) {
    const chatMessage: ChatMessage = {
      game,
      player: message.player,
      text: message.text,
      time: message.time,
      id: message.id
    };

    if (!chatHistory[game]) {
      chatHistory[game] = [];
    }

    chatHistory[game].push(chatMessage);
    console.log(game, {
      type: "NEW_MESSAGE",
      message: chatMessage,
    });
    LobbyManager.broadcastToLobby(game, {
      type: "NEW_MESSAGE",
      message: chatMessage,
    });
  }

  public static getChatHistory(game: string): ChatMessage[] {
    return chatHistory[game] || [];
  }
}
