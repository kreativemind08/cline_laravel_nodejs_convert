const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const MusicVisit = sequelize.define('MusicVisit', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  music_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  visited_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'MusicVisits',
  timestamps: false
});

module.exports = MusicVisit;
