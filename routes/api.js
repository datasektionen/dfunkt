"use strict";

var express = require('express');
var models = require('../models');
var router = express.Router();
var moment = require('moment');
var helpers = require('./helpers.js');

//
// API:
// DONE - lista alla användare
// DONE - lista alla roller
// DONE - lista en specifik användare och dess nuvarande roller
// DONE - lista en specifik användare och dess nuvarande och gamla roller
// DONE - lista alla roller av en viss typ med senaste
// DONE - lista alla roller av en viss typ med all historik
// DONE - lista alla roller med senaste
// DONE - lista alla roller med all historik
// DONE - lista en specifik roll med nuvarande
// DONE - lista en specifik roll med all historik
//


var defaultRoleAttributes = ['id', 'title', 'description', 'identifier', 'email', 'active'];

router.get('/roles', function (req, res) {
  models.Role.findAll({
    attributes: ['title', 'description', 'identifier', 'email', 'active'],
    include:    [
      {
        model:      models.Group,
        attributes: ["name", "identifier"],
      }
    ],
  }).then(function (roles) {
    res.json(roles);
  });
});

router.get('/role/:identifier/', function (req, res) {
  let identifier = req.params.identifier;
  getOneRoleWithGroup({identifier}, res);
});

router.get("/role/id/:id", function (req, res) {
  let id = req.params.id;
  getOneRoleWithGroup({id}, res);
});

function getOneRoleWithGroup(query, res) {
  getOneRole(query).then(function (role) {
    return getRoleMandates(role.id).then(function (roleMandates) {
      res.json({
        role:     role,
        mandates: roleMandates,
      });
    });
  }).catch(e => {
    res.status(404);
    res.send(e.message);
  });
}

router.get('/role/:identifier/current', function (req, res) {
  getRoleCurrent({identifier: req.params.identifier}, res);
});

router.get('/role/id/:id/current', function (req, res) {
  getRoleCurrent({id: req.params.id}, res);
});

function getRoleCurrent(query, res) {
  getOneRole(query).then(function (role) {
    return getRoleMandatesCurrent(role.id).then(function (mandates) {
      res.json({
        role,
        mandates,
      });
    });
  }).catch(e => {
    res.status(404);
    res.send(e.message);
  });
}

function getOneRole(query) {
  return models.Role.findOne({
    where:      query,
    attributes: defaultRoleAttributes,
    include:    [
      {
        model:      models.Group,
        attributes: ["name", "identifier"],
      }
    ],
  }).then(role => {
    if ( role == null ) {
      throw new Error("Role not found!");
    }

    return role;
  });
}

function getRoleMandatesCurrent(roleid) {
  var now = new moment().format('YYYY-MM-DD');
  return models.Mandate.findAll({
    where:      {RoleId: roleid, start: {$lte: now}, end: {$gte: now}},
    attributes: ['start', 'end'],
    include:    [
      {
        model:      models.User,
        attributes: ['first_name', 'last_name', 'email', 'kthid', 'ugkthid'],
      }
    ]
  });
}

router.get('/roles/type/:groupIdentifier/all', function (req, res) {
  helpers.rolesFindAllType(req.params.groupIdentifier).then(function (roles) {
    if ( !roles ) {
      res.status(404);
      res.send('does not exist');
    } else {
      res.json(roles);
    }
  });
});

router.get('/roles/type/:groupIdentifier/all/current', function (req, res) {
  helpers.rolesFindAllTypeCurrent(req.params.groupIdentifier).then(function (roles) {
    if ( !roles ) {
      res.status(404);
      res.send('does not exist');
    } else {
      res.json(roles);
    }
  });
});

//All roles that have a history and all of their history.
router.get('/roles/all', function (req, res) {
  helpers.rolesFindAll().then(function (roles) {
    if ( !roles ) {
      res.status(404);
      res.send('does not exist');
    } else {
      res.json(roles);
    }
  });
});

router.get('/roles/all/current', function (req, res) {
  helpers.rolesFindAllCurrent().then(function (roles) {
    if ( !roles ) {
      res.status(404);
      res.send('does not exist');
    } else {
      res.json(roles);
    }
  });
});

function getRoleMandates(roleid) {
  return models.Mandate.findAll({
    where:      {RoleId: roleid},
    attributes: ['start', 'end'],
    include:    [
      {
        model:      models.User,
        attributes: ['first_name', 'last_name', 'email', 'kthid', 'ugkthid'],
      }
    ]
  });
}

router.get('/users', function (req, res) {
  models.User.findAll({
    attributes: [
      'first_name',
      'last_name',
      'email',
      'kthid',
      'ugkthid',
      'admin'
    ]
  }).then(function (users) {
    res.json(users);
  });
});

router.get('/user/kthid/:kthid', function (req, res) {
  models.User.findOne({where: {kthid: req.params.kthid}}).then(function (user) {
    getUserMandates(user, res);
  });
});

router.get('/user/kthid/:kthid/current', function (req, res) {
  models.User.findOne({where: {kthid: req.params.kthid}}).then(function (user) {
    getUserMandatesCurrent(user, res);
  });
});

router.get('/user/ugkthid/:ugkthid', function (req, res) {
  models.User.findOne({where: {ugkthid: req.params.ugkthid}}).then(function (user) {
    getUserMandates(user, res);
  });
});

router.get('/user/ugkthid/:ugkthid/current', function (req, res) {
  models.User.findOne({where: {ugkthid: req.params.ugkthid}}).then(function (user) {
    getUserMandatesCurrent(user, res);
  });
});

//Returns the user and mandates for him.
var getUserMandatesCurrent = function (user, res) {
  if ( !user ) {
    res.status(404);
    res.send("does not exist");
  } else {
    var now = new moment().format('YYYY-MM-DD');
    models.Mandate.findAll({
      where:      {UserId: user.id, end: {$gte: now}, start: {$lte: now}},
      attributes: ['start', 'end'],
      include:    [
        {
          model:      models.Role,
          attributes: ['title', 'email']
        }
      ]
    }).then(function (mandates) {
      res.json({
        user:     user,
        mandates: mandates
      });
    });
  }
};

var getUserMandates = function (user, res) {
  if ( !user ) {
    res.status(404);
    res.send("does not exist");
  } else {
    models.Mandate.findAll({
      where:      {UserId: user.id},
      attributes: ['start', 'end'],
      include:    [
        {
          model:      models.Role,
          attributes: ['title', 'email']
        }
      ]
    }).then(function (mandates) {
      res.json({
        user:     user,
        mandates: mandates
      });
    });
  }
};

module.exports = router;
