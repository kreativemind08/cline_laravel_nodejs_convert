const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const GameVisit = sequelize.define('GameVisit', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  game_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  visited_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'GameVisits',
  timestamps: false
});

module.exports = GameVisit;
