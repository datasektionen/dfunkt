var Sequelize = require("sequelize");
var models  = require('../models');
var express = require('express');
var router  = express.Router();

router.get('/', function(req, res) {
    models.User.findAll({}).then(function(users) {
      models.Role.findAll({}).then(function(roles) {
        models.Mandate.findAll({}).then(function(mandates) {
            res.render('index', {
              title: 'Express',
              users: users,
              roles: roles,
              mandates: mandates,
            });
        });
      });
    });
});

module.exports = router;
