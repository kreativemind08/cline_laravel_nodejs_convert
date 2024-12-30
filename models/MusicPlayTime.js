const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const MusicPlayTime = sequelize.define('MusicPlayTime', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  music_id: {
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
  tableName: 'MusicPlayTimes',
  timestamps: false
});

module.exports = MusicPlayTime;
