const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const AboutPage = sequelize.define('AboutPage', {
  scn1_bg_image: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scn1_title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scn2_bg_image: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scn2_title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scn2_description1: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scn2_description2: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scn3_bg_image: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scn3_title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scn3_description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scn4_bg_image: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scn4_item1_image: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scn4_item1_title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scn4_item2_image: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scn4_item2_title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scn4_item3_image: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scn4_item3_title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scn5_bg_image: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scn5_left_image: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scn5_title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scn5_description: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {});

module.exports = AboutPage;
