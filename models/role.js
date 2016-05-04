"use strict";

module.exports = function(sequelize, DataTypes) {
  var Role = sequelize.define("Role", {
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    email: DataTypes.STRING,
  }, {
    classMethods: {
      associate: function(models) {
        Role.hasMany(models.Mandate)
      }
    }
  });

  return Role;
};
