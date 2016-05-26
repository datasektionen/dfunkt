var Sequelize = require("sequelize");
var models  = require('../models');
var express = require('express');
var router  = express.Router();
var helpers = require('./helpers');
var moment = require('moment');

router.get('/', function(req, res) {
  var now = new moment().format('YYYY-MM-DD');
  Promise.all([
    models.User.findAll({}),
    models.Role.findAll({include: [{model: models.Group, as: "Group"}]}),
    models.Mandate.findAll({
      include: [{all: true}],
      where: {start: {$lte: now}, end: {$gte: now}},
      order: '"Role.GroupId", "Role.title"'
    }),
    helpers.isadmin(req.user),
    models.Group.findAll({
      order: 'id'
    }),
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

router.get('/user/:kthid', function(req, res) {
  models.User.findOne({where: {kthid:req.params.kthid}}).then(function(user) {
    Promise.all([
      models.Mandate.findAll({
        include: [{all: true}],
        where: {UserId: user.id},
        order: 'start DESC'
      }),
      helpers.isadmin(req.user),
      models.Group.findAll({
        order: 'id'
      })
    ]).then(function(results) {
      var mandates = results[0];
      var isadmin = results[1];
      var groups = results[2];
      res.render('user', {
        user: req.user,
        isadmin: isadmin,
        mandates: mandates,
        groups: groups,
      });
    }).catch(function(e) {
      console.log(e);
      res.status(403);
      res.send('error');
    });
  });
}); 

router.get('/position/:ident', function(req, res) {
  models.Role.findOne({where: {identifier:req.params.ident}}).then(function(role) {
    Promise.all([
      models.Mandate.findAll({
        include: [{all: true}],
        where: {RoleId: role.id},
        order: 'start DESC'
      }),
      helpers.isadmin(req.user),
      models.Group.findAll({
        order: 'id'
      })
    ]).then(function(results) {
      var mandates = results[0];
      var isadmin = results[1];
      var groups = results[2];
      res.render('user', {
        user: req.user,
        isadmin: isadmin,
        mandates: mandates,
        groups: groups,
      });
    }).catch(function(e) {
      console.log(e);
      res.status(403);
      res.send('error');
    });
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
