const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const PromoPageMetric = sequelize.define('PromoPageMetric', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  page_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  interaction_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  interaction_data: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  recorded_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'PromoPageMetrics',
  timestamps: false
});

module.exports = PromoPageMetric;
