const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const DailyFreeSpinUsage = sequelize.define('DailyFreeSpinUsage', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  free_spins: {
    type: DataTypes.INTEGER
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'DailyFreeSpinUsages',
  timestamps: false
});

module.exports = DailyFreeSpinUsage;
