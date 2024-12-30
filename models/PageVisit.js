const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const PageVisit = sequelize.define('PageVisit', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  page_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  visited_at: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'PageVisits',
  timestamps: false
});

module.exports = PageVisit;
