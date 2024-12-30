const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Card = sequelize.define('Card', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'Cards',
  timestamps: false
});

module.exports = Card;
