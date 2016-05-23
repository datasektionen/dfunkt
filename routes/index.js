var Sequelize = require("sequelize");
var models  = require('../models');
var express = require('express');
var router  = express.Router();
var helpers = require('./helpers');

router.get('/', function(req, res) {
  Promise.all([
    models.User.findAll({}),
    models.Role.findAll({include: [{model: models.Group, as: "Group"}]}),
    models.Mandate.findAll({include: [{model: models.User, as: "User"},
                                      {model: models.Role, as: "Role"}]}),
    helpers.isadmin(req.user),
    models.Group.findAll({}),
  ]).then(function(results) {
    var users = results[0];
    var roles = results[1];
    var mandates = results[2];
    var isadmin = results[3];
    var groups = results[4];
    res.render('index', {
      user: req.user,
      isadmin: isadmin,
      users: users,
      roles: roles,
      mandates: mandates,
      groups: groups,
    });
  }).catch(function(e) {
    console.log(e);
    res.status(403);
    res.send('error');
  });
});

router.get('/admin', helpers.requireadmin, function(req, res) {
  Promise.all([
    models.User.findAll({}),
    models.Role.findAll({include: [{model: models.Group, as: "Group"}]}),
    models.Mandate.findAll({include: [{model: models.User, as: "User"},
                                      {model: models.Role, as: "Role"}]}),
    helpers.isadmin(req.user),
    models.Group.findAll({}),
  ]).then(function(results) {
    var users = results[0];
    var roles = results[1];
    var mandates = results[2];
    var isadmin = results[3];
    var groups = results[4];
    res.render('admin', {
      user: req.user,
      isadmin: isadmin,
      users: users,
      roles: roles,
      mandates: mandates,
      groups: groups,
    });
  });
});

module.exports = router;
