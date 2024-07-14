import { Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import Player from '../models/Player';
import logger from '../config/logger';

class PlayerController {
  public async createPlayer(req: Request, res: Response): Promise<Response> {
    await check('name', 'Name is required').notEmpty().run(req);
    await check('gameId', 'Game ID must be an integer').optional().isInt().run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error(`Validation failed: ${JSON.stringify(errors.array())}`);
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const player = await Player.create(req.body);
      logger.info(`Player created: ${JSON.stringify(player)}`);
      return res.status(201).json(player);
    } catch (error) {
      logger.error(`Failed to create player: ${error}`);
      return res.status(500).json({ error: 'Failed to create player' });
    }
  }

  public async getAllPlayers(req: Request, res: Response): Promise<Response> {
    try {
      const players = await Player.findAll();
      logger.info('Retrieved all players');
      return res.status(200).json(players);
    } catch (error) {
      logger.error(`Failed to retrieve players: ${error}`);
      return res.status(500).json({ error: 'Failed to retrieve players' });
    }
  }

  public async getPlayerById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const player = await Player.findByPk(id);

      if (player) {
        logger.info(`Player retrieved: ${JSON.stringify(player)}`);
        return res.status(200).json(player);
      }

      logger.warn(`Player not found: ${id}`);
      return res.status(404).json({ error: 'Player not found' });
    } catch (error) {
      logger.error(`Failed to retrieve player: ${error}`);
      return res.status(500).json({ error: 'Failed to retrieve player' });
    }
  }

  public async updatePlayer(req: Request, res: Response): Promise<Response> {
    await check('name', 'Name is required').optional().notEmpty().run(req);
    await check('gameId', 'Game ID must be an integer').optional().isInt().run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error(`Validation failed: ${JSON.stringify(errors.array())}`);
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const [updated] = await Player.update(req.body, { where: { id } });

      if (updated) {
        const updatedPlayer = await Player.findByPk(id);
        logger.info(`Player updated: ${JSON.stringify(updatedPlayer)}`);
        return res.status(200).json(updatedPlayer);
      }

      logger.warn(`Player not found: ${id}`);
      return res.status(404).json({ error: 'Player not found' });
    } catch (error) {
      logger.error(`Failed to update player: ${error}`);
      return res.status(500).json({ error: 'Failed to update player' });
    }
  }

  public async deletePlayer(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const deleted = await Player.destroy({ where: { id } });

      if (deleted) {
        logger.info(`Player deleted: ${id}`);
        return res.status(204).json();
      }

      logger.warn(`Player not found: ${id}`);
      return res.status(404).json({ error: 'Player not found' });
    } catch (error) {
      logger.error(`Failed to delete player: ${error}`);
      return res.status(500).json({ error: 'Failed to delete player' });
    }
  }
}

export default new PlayerController();