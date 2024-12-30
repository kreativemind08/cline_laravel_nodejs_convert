const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const PrimeplayRecords = sequelize.define('PrimeplayRecords', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  record_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  record_data: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  recorded_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'PrimeplayRecords',
  timestamps: false
});

module.exports = PrimeplayRecords;
