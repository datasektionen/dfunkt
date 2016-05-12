var Sequelize = require("sequelize");
var models  = require('../models');
var express = require('express');
var router  = express.Router();
var helpers = require('./helpers');

router.get('/', function(req, res) {
  Promise.all([
    models.User.findAll({}),
    models.Role.findAll({}),
    models.Mandate.findAll({include: [{model: models.User, as: "User"},
                                      {model: models.Role, as: "Role"}]}),
  ]).then(function(results) {
    var users = results[0];
    var roles = results[1];
    var mandates = results[2];
    res.render('index', {
      user: req.user,
      users: users,
      roles: roles,
      mandates: mandates,
    });
  }).catch(function(e) {
    console.log(e);
    res.status(403);
    res.send('error');
  });
});

router.get('/admin', helpers.requireadmin, function(req, res) {
  res.render('admin', {
    user: req.user,
  });
});

module.exports = router;
