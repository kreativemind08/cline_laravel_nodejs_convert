const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const GameDetailView = sequelize.define('GameDetailView', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  game_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  viewed_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'GameDetailViews',
  timestamps: false
});

module.exports = GameDetailView;
