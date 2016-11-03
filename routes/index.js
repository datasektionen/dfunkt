var Sequelize = require("sequelize");
var Promise = require("bluebird");
var models  = require('../models');
var express = require('express');
var router  = express.Router();
var helpers = require('./helpers');

router.get('/', function(req, res) {
  Promise.all([
    helpers.rolesFindAllCurrent(),
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

router.get('/position/:identifier', function(req, res) {
  var identifier = req.params.identifier;
  models.Role.findOne({where: {identifier}})
    .then(role => {
      if ( role == null ) {
        res.status(404);
        res.send(`Bad position identfier ${identifier}`);
        return;
      }

      return respondPositionWithRole(role, req, res);
    });
});

router.get('/position/id/:id', function(req, res) {
  var id = req.params.id;
  models.Role.findOne({where: {id}})
    .then(function(role) {
      if ( role == null ) {
        res.status(404);
        res.send(`Bad position id ${id}`);
        return;
      }

      return respondPositionWithRole(role, req, res);
    })
});

function respondPositionWithRole(role, req, res) {
  let mandatesWithRoleIdP = models.Mandate.findAll({
    include: [{all: true, nested: true}],
    where:   {RoleId: role.id},
    order:   'start DESC'
  });

  return Promise.all([ mandatesWithRoleIdP, helpers.isadmin(req.user), models.Group.findAll({}) ])
    .spread(function (mandates, isadmin, groups) {
      res.render( 'position', {
        user: req.user,
        isadmin,
        roleobj: role,
        mandates,
        groups,
      });
    }).catch(function (e) {
      console.log(e);
      res.status(403);
      res.send('error');
    });
}


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
