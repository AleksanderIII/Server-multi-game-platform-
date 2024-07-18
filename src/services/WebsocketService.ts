import * as WebSocket from "ws";
import { Server as HttpServer } from "http";

export class WebSocketService {
  protected wss: WebSocket.Server;

  constructor(server: HttpServer) {
    this.wss = new WebSocket.Server({ server });
    this.wss.on("connection", this.handleConnection.bind(this));
  }

  protected handleConnection(ws: WebSocket) {
    console.log("New client connected");

    ws.on("message", this.handleMessage.bind(this, ws));

    ws.on("close", () => {
      console.log("Client disconnected");
      this.handleDisconnect(ws);
    });
  }

  protected handleMessage(ws: WebSocket, message: string) {
    console.log(`Received message: ${message}`);
    const data = JSON.parse(message);
    this.routeMessage(ws, data);
  }

  protected handleDisconnect(ws: WebSocket) {
    console.log("Client disconnected");
  }

  protected routeMessage(ws: WebSocket, data: any) {
    // Должно быть переопределено в дочерних классах
  }

  protected sendMessage(ws: WebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  protected broadcastToClients(clients: WebSocket[], message: any) {
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}
