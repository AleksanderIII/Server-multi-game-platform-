'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('games', 'genre', {
      type: Sequelize.STRING,
      allowNull: true // Разрешаем NULL значения
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('games', 'genre');
  }
};