import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PlayerAttributes {
  id: number;
  name: string;
  gameId?: number;
}

interface PlayerCreationAttributes extends Optional<PlayerAttributes, 'id'> {}

class Player extends Model<PlayerAttributes, PlayerCreationAttributes> implements PlayerAttributes {
  public id!: number;
  public name!: string;
  public gameId?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Player.init(
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
    gameId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'games',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'players',
  }
);

export default Player;