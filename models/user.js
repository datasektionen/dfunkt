"use strict";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    kthid: DataTypes.STRING,
    ugkthid: DataTypes.STRING,
    admin: DataTypes.BOOLEAN,
  });
  User.associate = function(models) {
    User.hasMany(models.Mandate);
  };

  return User;
};
