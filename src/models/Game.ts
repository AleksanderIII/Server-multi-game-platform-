import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface GameAttributes {
  id: number;
  name: string;
  genre: string;
  releaseDate: Date | null;
  isReleased: boolean;
  imageUrl: string;
}

interface GameCreationAttributes extends Optional<GameAttributes, "id"> {}

class Game
  extends Model<GameAttributes, GameCreationAttributes>
  implements GameAttributes
{
  public id!: number;
  public name!: string;
  public genre!: string;
  public releaseDate!: Date | null;
  public isReleased!: boolean;
  public imageUrl!: string;

  // Required if you want to automatically add timestamps (createdAt, updatedAt)
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Game.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    genre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    releaseDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isReleased: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "game",
  }
);

export default Game;
