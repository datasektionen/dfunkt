var models  = require('../models');
var moment = require('moment');
var request = require('request');

var denied = function(res) {
  res.status(403);
  res.send('denied');
};

var isadmin = function(user) {
  var plsurl = "https://pls.datasektionen.se/api/user/" + user + "/dfunkt/admin";
  return new Promise(function (resolve) {
    request({uri: plsurl, method: 'GET'}, function (error, response, body) {
      if(error) console.error(error);
      if (body === "true") {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

exports.isadmin = isadmin; 

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
