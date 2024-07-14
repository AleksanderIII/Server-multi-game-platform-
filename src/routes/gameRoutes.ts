import { Router } from "express";
import GameController from "../controllers/GameController";

const router = Router();

router.post("/", GameController.createGame);
router.get("/", GameController.getAllGames);
router.get("/:id", GameController.getGameById);
router.put("/:id", GameController.updateGame);
router.delete("/:id", GameController.deleteGame);
router.post("/addPlayer", GameController.addPlayerToGame);

router.post("/createSession", GameController.createSession);
router.post("/:gameId/join", GameController.joinGame);

export default router;