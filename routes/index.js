var Sequelize = require("sequelize");
var models  = require('../models');
var express = require('express');
var router  = express.Router();

router.get('/', function(req, res) {
  Promise.all([
    models.User.findAll({}),
    models.Role.findAll({}),
    models.Mandate.findAll({}),
  ]).then(function(results) {
    var users = results[0];
    var roles = results[1];
    var mandates = results[2];
    res.render('index', {
      title: 'Express',
      user: req.user,
      users: users,
      roles: roles,
      mandates: mandates,
    });
  }).catch(function(e) {
    res.status(403);
    res.send('error');
  });
});

module.exports = router;
