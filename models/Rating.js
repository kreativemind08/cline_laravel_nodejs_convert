const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Rating = sequelize.define('Rating', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'Ratings',
  timestamps: false
});

module.exports = Rating;
