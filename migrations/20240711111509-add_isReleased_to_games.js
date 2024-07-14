'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('games', 'isReleased', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, // По умолчанию игра не реализована
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('games', 'isReleased');
  }
};