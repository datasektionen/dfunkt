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

let darkmode_status = async ()=>{
  
  // get darkmode status from datasektionen
  var options = {
    'method': 'GET',
    'url': 'https://darkmode.datasektionen.se',
  };

  const request_inner = ()=>{
    return new Promise((resolve, reject)=>{
      request(options, function (error, response) { 
        if (error) {
          console.log("error", error);
          reject(error);
        }
        // resolve(response.body);
        resolve("true");
      });
    });
  }

  bool = (await request_inner()) === "true";

  return bool
}

exports.darkmode_status = darkmode_status;

let darkmode_sensitive_where_logic = async (whereclause = {})=>{

  const status = await darkmode_status();

  console.log("DARKMODE STATUS: ", status)

  // darkmode_sensitive logic
  if (status){
    whereclause = {
      ...whereclause,
      darkmode_sensitive: false,
    }
  }
  return whereclause;
}
exports.darkmode_sensitive_where_logic = darkmode_sensitive_where_logic;

var issearch = function(user) {
  var plsurl = "https://pls.datasektionen.se/api/user/" + user + "/dfunkt/search";
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

  return Promise.all([darkmode_sensitive_where_logic()])
  .then(([whereclause])=>{
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
      where: whereclause,
      order: [
        [models.Group, 'name'],
        ['title'],
      ] 
    });
  })
};

exports.rolesFindAllType = function (groupIdentifier) {
  return Promise.all([darkmode_sensitive_where_logic()])
  .then(([whereclause])=>{
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
      where: whereclause,
      order: [
        [models.Group, 'name'],
        ['title'],
      ] 
    });
  })
};

exports.rolesFindAll = function() {
  return Promise.all([darkmode_sensitive_where_logic()])
  .then(([whereclause])=>{
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
      where: darkmode_sensitive_where_logic(),
      order: [
        [models.Group, 'name'],
        ['title'],
      ] 
    });
  });

};

exports.rolesFindAllCurrent = function() {
  var now = new moment().format('YYYY-MM-DD');
  return Promise.all([darkmode_sensitive_where_logic()])
  .then(([whereclause])=>{
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
      where: whereclause,
      order: [
        [models.Group, 'name'],
        ['title'],
      ] 
    });
  })
};
