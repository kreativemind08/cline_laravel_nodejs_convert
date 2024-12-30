module.exports = (sequelize, DataTypes) => {
  const UserSetting = sequelize.define('UserSetting', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      }
    },
    email_notification: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {});

  UserSetting.associate = (models) => {
    UserSetting.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return UserSetting;
};
