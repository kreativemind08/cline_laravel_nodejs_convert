const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Policy = sequelize.define('Policy', {
  page_title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  page_content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {});

module.exports = Policy;
