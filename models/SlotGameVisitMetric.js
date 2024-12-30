const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const SlotGameVisitMetric = sequelize.define('SlotGameVisitMetric', {
  user_id: {
    type: DataTypes.INTEGER
  },
  ip_address: {
    type: DataTypes.STRING
  },
  promo_page_id: {
    type: DataTypes.STRING
  },
  campaign_name: {
    type: DataTypes.STRING
  },
  visit: {
    type: DataTypes.INTEGER
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'SlotGameVisitMetrics',
  timestamps: false
});

module.exports = SlotGameVisitMetric;
