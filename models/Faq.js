const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Faq = sequelize.define('Faq', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {});

module.exports = Faq;
