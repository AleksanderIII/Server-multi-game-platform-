import { Request, Response } from "express";
import Game from "../models/Game";
import logger from "../config/logger";
import { Optional } from "sequelize";

interface GameAttributes {
  id: number;
  name: string;
  genre: string;
  releaseDate: Date | null;
  isReleased: boolean;
  imageUrl: string;
}

interface GameCreationAttributes extends Optional<GameAttributes, "id"> {}

class GameController {
  public async createGame(req: Request, res: Response): Promise<Response> {
    try {
      const { name, genre, releaseDate, isReleased, imageUrl } = req.body;

      if (!name || !genre) {
        return res.status(400).json({ error: "Name and genre are required" });
      }

      const gameData: GameCreationAttributes = {
        name,
        genre,
        releaseDate,
        isReleased,
        imageUrl
      };

      const game = await Game.create(gameData);

      return res.status(201).json({ game });
    } catch (error) {
      logger.error(`Failed to create game: ${error}`);
      return res.status(500).json({ error: "Failed to create game" });
    }
  }

  public async getAllGames(req: Request, res: Response): Promise<Response> {
    try {
      const games = await Game.findAll();
      return res.json(games);
    } catch (error) {
      logger.error(`Failed to fetch games: ${error}`);
      return res.status(500).json({ error: "Failed to fetch games" });
    }
  }

  public async getGameById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const game = await Game.findByPk(id);

      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }

      return res.json({ game });
    } catch (error) {
      logger.error(`Failed to fetch game by ID: ${error}`);
      return res.status(500).json({ error: "Failed to fetch game by ID" });
    }
  }

  public async updateGame(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name, genre, releaseDate, isReleased } = req.body;

      const game = await Game.findByPk(id);

      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }

      await game.update({ name, genre, releaseDate, isReleased });

      return res.json({ game });
    } catch (error) {
      logger.error(`Failed to update game: ${error}`);
      return res.status(500).json({ error: "Failed to update game" });
    }
  }

  public async deleteGame(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const game = await Game.findByPk(id);

      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }

      await game.destroy();

      return res.status(204).send();
    } catch (error) {
      logger.error(`Failed to delete game: ${error}`);
      return res.status(500).json({ error: "Failed to delete game" });
    }
  }

  public async addPlayerToGame(req: Request, res: Response): Promise<Response> {
    try {
      const { gameId, playerId } = req.body;

      if (!gameId || !playerId) {
        return res
          .status(400)
          .json({ error: "Both gameId and playerId are required" });
      }

      // Logic to add player to game goes here

      return res.status(501).json({ error: "Not implemented" });
    } catch (error) {
      logger.error(`Failed to add player to game: ${error}`);
      return res.status(500).json({ error: "Failed to add player to game" });
    }
  }

  public async createSession(req: Request, res: Response): Promise<Response> {
    try {
      const { gameId } = req.body;

      if (!gameId) {
        return res.status(400).json({ error: "gameId is required" });
      }

      // Logic to create game session goes here

      return res.status(501).json({ error: "Not implemented" });
    } catch (error) {
      logger.error(`Failed to create game session: ${error}`);
      return res.status(500).json({ error: "Failed to create game session" });
    }
  }

  public async joinGame(req: Request, res: Response): Promise<Response> {
    try {
      const { gameId, playerId } = req.body;

      if (!gameId || !playerId) {
        return res
          .status(400)
          .json({ error: "Both gameId and playerId are required" });
      }

      // Logic to join game goes here

      return res.status(501).json({ error: "Not implemented" });
    } catch (error) {
      logger.error(`Failed to join game: ${error}`);
      return res.status(500).json({ error: "Failed to join game" });
    }
  }
}

export default new GameController();
