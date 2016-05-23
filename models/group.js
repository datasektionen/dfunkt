"use strict";

module.exports = function(sequelize, DataTypes) {
  var Group = sequelize.define("Group", {
    name: DataTypes.STRING,
    identifier: DataTypes.STRING,
  }, {
    classMethods: {
      associate: function(models) {
        Group.hasOne(models.Role);
      }
    }
  });


  return Group;
};
