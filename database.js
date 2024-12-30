const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('onehubplay_db', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  dialectModule: require('mysql2'),
  logging: false // Disable logging SQL queries
});

module.exports = sequelize;
