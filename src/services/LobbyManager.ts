import WebSocket from "ws";
import { GameManager } from "./GameManager";
import { WebSocketService } from "./WebsocketService";

interface LobbyPlayer {
  ws: WebSocket;
  name: string;
  selectedOpponent?: string;
}

interface Lobby {
  players: LobbyPlayer[];
  gameReady: boolean;
}

const lobbies: Record<string, Lobby> = {};

export class LobbyManager {
  public static handleLobbyMessage(ws: WebSocket, data: any) {
    const { type, game, player, opponent } = data;

    switch (type) {
      case "JOIN_LOBBY":
        this.joinLobby(ws, game, player);
        break;

      case "LEAVE_LOBBY":
        this.leaveLobby(ws, game);
        break;

      case "SELECT_OPPONENT":
        this.selectOpponent(ws, game, player, opponent);
        break;

      default:
        console.log("Unknown lobby message type:", type);
        break;
    }
  }
  
  public static joinLobby(ws: WebSocket, game: string, playerName: string) {
    if (!lobbies[game]) {
      lobbies[game] = { players: [], gameReady: false };
    }

    const lobby = lobbies[game];
    const playerExists = lobby.players.some(
      (player) => player.name === playerName
    );

    if (!playerExists) {
      lobby.players.push({ ws, name: playerName });
      console.log(`Added player ${playerName} to lobby ${game}`);
      this.broadcastToLobby(game, {
        type: "LOBBY_UPDATE",
        game,
        players: lobby.players.map((player) => player.name),
      });
    } else {
      console.log(`Player ${playerName} is already in the lobby ${game}`);
      WebSocketService.sendMessage(ws, {
        type: "ERROR",
        message: "Player with this name is already in the lobby.",
      });
    }
  }

  public static leaveLobby(ws: WebSocket, game: string) {
    const lobby = lobbies[game];
    if (lobby) {
      lobby.players = lobby.players.filter((player) => player.ws !== ws);
      console.log(`Removed client from game lobby: ${game}`);
      this.broadcastToLobby(game, {
        type: "LOBBY_UPDATE",
        game,
        players: lobby.players.map((player) => player.name),
      });

      if (lobby.players.length < 2) {
        lobby.gameReady = false;
      }

      if (lobby.players.length === 0) {
        delete lobbies[game];
      }
    }
  }

  public static selectOpponent(
    ws: WebSocket,
    game: string,
    playerName: string,
    selectedOpponent: string
  ) {
    const lobby = lobbies[game];
    const currentPlayer = lobby?.players.find((player) => player.ws === ws);
    if (currentPlayer) {
      currentPlayer.selectedOpponent = selectedOpponent;
      console.log(
        `Player ${currentPlayer.name} selected opponent ${selectedOpponent}`
      );
      this.broadcastToLobby(game, {
        type: "OPPONENT_SELECTED",
        game,
        player: currentPlayer.name,
        opponent: selectedOpponent,
      });

      const allPlayersSelectedEachOther = lobby?.players.every(
        (player) =>
          player.selectedOpponent &&
          lobby.players.find((p) => p.name === player.selectedOpponent)
            ?.selectedOpponent === player.name
      );

      if (allPlayersSelectedEachOther) {
        GameManager.startGame(game);
      }
    }
  }

  public static broadcastToLobby(game: string, message: any) {
    if (lobbies[game]) {
      lobbies[game].players.forEach(({ ws }) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        }
      });
    }
  }

  public static getLobby(game: string): Lobby | undefined {
    return lobbies[game];
  }

  public static getLobbies(): Record<string, Lobby> {
    return lobbies;
  }
}
