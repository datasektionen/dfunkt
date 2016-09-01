var Sequelize = require("sequelize");
var models  = require('../models');
var express = require('express');
var router  = express.Router();
var helpers = require('./helpers');
var moment = require('moment');

router.get('/', function(req, res) {
  var now = new moment().format('YYYY-MM-DD');
  Promise.all([
    models.Role.findAll({
      include: [{
        model: models.Mandate, 
        required: false,
        where: {start: {$lte: now}, end: {$gte: now}},
        include: [{model: models.User}],
      },{
        model: models.Group, 
      }],
      order: [
        [models.Group, 'name'],
        ['title'],
      ] 
    }),
    helpers.isadmin(req.user),
  ]).then(function(results) {
    var rolemandates = results[0];
    console.log(rolemandates);
    var isadmin = results[1];
    res.render('index', {
      user: req.user,
      isadmin: isadmin,
      rolemandates: rolemandates,
    });
  }).catch(function(e) {
    console.log(e);
    res.status(403);
    res.send('error');
  });
});

router.get('/user/:kthid', function(req, res) {
  models.User.findOne({where: {kthid:req.params.kthid}}).then(function(user) {
    if(user) {
      Promise.all([
        models.Mandate.findAll({
          include: [{all: true, nested: true}],
          where: {UserId: user.id},
          order: 'start DESC'
        }),
        helpers.isadmin(req.user),
      ]).then(function(results) {
        var mandates = results[0];
        var isadmin = results[1];
        res.render('user', {
          user: req.user,
          userobj: user,
          isadmin: isadmin,
          mandates: mandates,
        });
      }).catch(function(e) {
        console.log(e);
        res.status(403);
        res.send('error');
      });
    } else {
      res.status(404);
      res.send('does not exist');
    }
  });
}); 

router.get('/position/:ident', function(req, res) {
  models.Role.findOne({where: {identifier:req.params.ident}}).then(function(role) {
    if(role) {
      Promise.all([
        models.Mandate.findAll({
          include: [{all: true, nested: true}],
          where: {RoleId: role.id},
          order: 'start DESC'
        }),
        helpers.isadmin(req.user),
      ]).then(function(results) {
        var mandates = results[0];
        var isadmin = results[1];
        res.render('position', {
          user: req.user,
          isadmin: isadmin,
          roleobj: role,
          mandates: mandates,
        });
      }).catch(function(e) {
        console.log(e);
        res.status(403);
        res.send('error');
      });
    } else {
      res.status(404);
      res.send('does not exist');
    }
  });
}); 


router.get('/admin', helpers.requireadmin, function(req, res) {
  Promise.all([
    models.User.findAll({
      order: 'last_name'
    }),
    models.Role.findAll({
      include: [{model: models.Group, as: "Group"}],
      order: 'title'
    }),
    models.Mandate.findAll({include: [{model: models.User, as: "User"},
                                      {model: models.Role, as: "Role"}]}),
    helpers.isadmin(req.user),
    models.Group.findAll({}),
    models.User.findAll({
      order: 'last_name',
      where: {admin: true}
    }),
  ]).then(function(results) {
    var users = results[0];
    var roles = results[1];
    var mandates = results[2];
    var isadmin = results[3];
    var groups = results[4];
    var admins = results[5];
    res.render('admin', {
      user: req.user,
      isadmin: isadmin,
      users: users,
      roles: roles,
      mandates: mandates,
      groups: groups,
      admins: admins,
    });
  });
});

module.exports = router;
