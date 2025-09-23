var models  = require('../models');
var moment = require('moment');
var env = require('../util/env');
var fetch = require('node-fetch');

var denied = function(res) {
  res.status(403);
  res.send('denied');
};

var haspermission = function(user, permission) {
  if (user === undefined)
    return Promise.resolve(false);

  return fetch(`${env.hive_url}/user/${user}/permission/${permission}`)
    .then((res) => res.json())
    .then((data) => data)
    .catch((err) => {
      console.error(err);
      return false;
    })
}

var isadmin = function(user) {
  return haspermission(user, 'admin');
};

exports.isadmin = isadmin;

var issearch = function(user) {
  return haspermission(user, 'search');
};

exports.issearch = issearch;

exports.requirelogin = function(req, res, next) {
  if(req.user) {
    next()
  } else {
    denied(res);
  }
};

exports.requireadmin = function(req, res, next) {
  isadmin(req.user).then(function(admin) {
    if(admin) {
      next();
    } else {
      denied(res);
    }
  }).catch(function(e) {
    console.error(e);
  });
};

exports.requiresearch = function(req, res, next) {
  issearch(req.user).then(function(search) {
    if(search) {
      next();
    } else {
      denied(res);
    }
  }).catch(function(e) {
    console.error(e);
  });
};

var roleAtt = ['title', 'description', 'identifier', 'email', 'active', 'id'];
var userAtt = ['first_name', 'last_name', 'email', 'kthid', 'ugkthid'];
var groupAtt = ['name', 'identifier'];
var mandateAtt = ['start', 'end'];

exports.rolesFindAllTypeCurrent = function (groupIdentifier) {
  var now = new moment().format('YYYY-MM-DD');
  return models.Role.findAll({
    attributes: roleAtt,
    include: [{
      attributes: mandateAtt,
      model: models.Mandate, 
      required: false,
      where: {start: {$lte: now}, end: {$gte: now}},
      include: [{
        attributes: userAtt,
        model: models.User,
      }],
    },{
      attributes: groupAtt,
      required:   true,
      where:      {identifier: groupIdentifier},
      model:      models.Group,
    }],
    order: [
      [models.Group, 'name'],
      ['title'],
    ] 
  });
};

exports.rolesFindAllType = function (groupIdentifier) {
  return models.Role.findAll({
    attributes: roleAtt,
    include: [{
      attributes: mandateAtt,
      model: models.Mandate, 
      required: false,
      include: [{
        attributes: userAtt,
        model: models.User,
      }],
    },{
      attributes: groupAtt,
      required:   true,
      where:      {identifier: groupIdentifier},
      model:      models.Group,
    }],
    order: [
      [models.Group, 'name'],
      ['title'],
    ] 
  });
};

exports.rolesFindAll = function() {
  return models.Role.findAll({
    attributes: roleAtt,
    include: [{
      attributes: mandateAtt,
      model: models.Mandate, 
      required: false,
      include: [{
        attributes: userAtt,
        model: models.User,
      }],
    },{
      attributes: groupAtt,
      model: models.Group, 
    }],
    order: [
      [models.Group, 'name'],
      ['title'],
    ] 
  });
};

exports.rolesFindAllCurrent = function() {
  var now = new moment().format('YYYY-MM-DD');
  return models.Role.findAll({
    attributes: roleAtt,
    include: [{
      attributes: mandateAtt,
      model: models.Mandate, 
      required: false,
      where: {start: {$lte: now}, end: {$gte: now}},
      include: [{
        attributes: userAtt,
        model: models.User,
      }],
    },{
      attributes: groupAtt,
      model: models.Group, 
    }],
    order: [
      [models.Group, 'name'],
      ['title'],
    ] 
  });
};
