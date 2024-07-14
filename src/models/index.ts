import Game from "./Game";
import Player from "./Player";

Game.hasMany(Player, {
  sourceKey: "id",
  foreignKey: "gameId",
  as: "players",
});

Player.belongsTo(Game, {
  foreignKey: "gameId",
  as: "game",
});

export { Game, Player };
