"use strict";

module.exports = function(sequelize, DataTypes) {
  var Mandate = sequelize.define("Mandate", {
      start: DataTypes.DATEONLY,
      end: DataTypes.DATEONLY,
  }, {
    classMethods: {
      associate: function(models) {
        Mandate.belongsTo(models.User);
        Mandate.belongsTo(models.Role, {onDelete: 'cascade'});
      }
    }
  });

  return Mandate;
};
