const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const IndexPage = sequelize.define('IndexPage', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'IndexPages',
  timestamps: false
});

module.exports = IndexPage;
