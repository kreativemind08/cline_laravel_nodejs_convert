const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const GamePlayTime = sequelize.define('GamePlayTime', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  game_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  play_time: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  played_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'GamePlayTimes',
  timestamps: false
});

module.exports = GamePlayTime;
