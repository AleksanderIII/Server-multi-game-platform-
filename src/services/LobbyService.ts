import * as WebSocket from "ws";
import { Server as HttpServer } from "http";
import { WebSocketService } from "./WebsocketService";

interface LobbyPlayer {
  ws: WebSocket;
  name: string;
  selectedOpponent?: string;
  isReady?: boolean;
}

interface Lobby {
  players: LobbyPlayer[];
  gameReady: boolean;
}

export function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class LobbyService extends WebSocketService {
  private lobbies: Record<string, Lobby> = {};

  constructor(server: HttpServer) {
    super(server);
  }

  protected routeMessage(ws: WebSocket, data: any) {
    const game = data.game;
    const playerName = data.player;

    switch (data.type) {
      case "JOIN_LOBBY":
        this.handleJoinLobby(ws, game, playerName);
        break;

      case "LEAVE_LOBBY":
        this.handleLeaveLobby(ws, game);
        break;

      case "SELECT_OPPONENT":
        this.handleSelectOpponent(ws, game, data.opponent);
        break;

      case "PLAYER_READY":
        this.handlePlayerReady(game, playerName);
        break;

      default:
        console.log(`Unknown message type: ${data.type}`);
        break;
    }
  }

  private handleJoinLobby(ws: WebSocket, game: string, playerName: string) {
    if (!this.lobbies[game]) {
      this.lobbies[game] = { players: [], gameReady: false };
    }

    const playerExists = this.lobbies[game].players.some(
      (player) => player.name === playerName
    );

    if (!playerExists) {
      this.lobbies[game].players.push({ ws, name: playerName });
      console.log(`Added client to game lobby: ${game}`);

      this.broadcastToLobby(game, {
        type: "LOBBY_UPDATE",
        game,
        players: this.lobbies[game].players.map((player) => player.name),
      });

      if (
        this.lobbies[game].players.length === 2 &&
        !this.lobbies[game].gameReady
      ) {
        this.lobbies[game].gameReady = true;
        console.log(`Starting game: ${game}`);
        this.broadcastToLobby(game, { type: "GAME_START", game });
      }
    } else {
      console.log(
        `Player with name ${playerName} already in the lobby: ${game}`
      );
      this.sendMessage(ws, {
        type: "ERROR",
        message: "Player with this name already in the lobby.",
      });
    }
  }

  private handleLeaveLobby(ws: WebSocket, game: string) {
    if (this.lobbies[game]) {
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

  private handleSelectOpponent(
    ws: WebSocket,
    game: string,
    selectedOpponent: string
  ) {
    const currentPlayer = this.lobbies[game].players.find(
      (player) => player.ws === ws
    );

    if (currentPlayer) {
      currentPlayer.selectedOpponent = selectedOpponent;
      console.log(
        `Player ${currentPlayer.name} selected opponent ${selectedOpponent}`
      );

      this.broadcastToLobby(game, {
        type: "OPPONENT_SELECTED",
        game,
        opponent: selectedOpponent,
      });

      const allPlayersSelected = this.lobbies[game].players.every(
        (player) => player.selectedOpponent !== undefined
      );

      if (allPlayersSelected) {
        const personalLobbyId = generateUUID();
        this.broadcastToLobby(game, {
          type: "PERSONAL_LOBBY_START",
          game,
          personalLobbyId,
        });
      }
    }
  }

  private handlePlayerReady(game: string, playerName: string) {
    const clientPlayer = this.lobbies[game].players.find(
      (player) => player.name === playerName
    );

    if (clientPlayer) {
      clientPlayer.isReady = true;
      console.log(`Player ${playerName} is ready`);

      const allPlayersReady =
        this.lobbies[game].players.length === 2 &&
        this.lobbies[game].players.every((player) => player.isReady);

      if (allPlayersReady) {
        this.broadcastToLobby(game, { type: "START_GAME", game });
      }
    }
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
