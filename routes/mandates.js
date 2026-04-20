var models  = require('../models');
var express = require('express');
var helpers = require('./helpers');
var sso = require('../util/sso');
var debug = require('debug')('dfunkt');
var router  = express.Router();

router.post('/delete/:id', helpers.requireadmin, function(req, res) {
  var id = req.params.id;
  models.Mandate.destroy({
    where: {id: id}
  }).then(function() {
    res.redirect('/'); //TODO: redirect somewhere better
  });
});

router.post('/update', helpers.requireadmin, function(req, res) {
  if(req.body.start && req.body.end && req.body.id) {
    models.Mandate.update({
      start: req.body.start,
      end: req.body.end,
    }, {
      where: {id: req.body.id}
    }).then(function() {
      res.redirect('/');
    });
  } else {
    res.render("error", { message: "Invalid mandate update request."});
  }
});

function validRequest(body) {
  // TODO: Check if user is an actual user 
  return body.roleId && 
         body.start &&
         body.end &&
         body.kthid &&
         body.kthid != "" &&
         new Date(body.start) <= new Date(body.end);
}

function makeSureNoneNull(values) {
  for (var i = 0; i < values.length; i++) {
    var value = values[i];
    if (value === null) {
      return Promise.reject(Error("Value #" + i + " was null."));
    }
  }
  return Promise.resolve(values);
}

function getUsThisUser(kthid) {
  return findKthidUserLocally(kthid)
    .catch(() => ssoCreateUser(kthid));
}

function ssoCreateUser(kthid) {
  return sso.byKthid(kthid)
    .then( function(ssoUser) { //TODO: arrow
      return findOrCreateUser(ssoUser);
    });
}

function findOrCreateUser(user) {
  debug("Goind to find or create dis: " + user);
  return models.User.findOrCreate({
    where: {
      first_name: user.first_name,
      last_name: user.last_name,
      kthid: user.kthid,
      ugkthid: user.ugkthid,
    },
    defaults: {
      admin: false, 
    },
  }).then(function (result) {
    return result[0];
  });
}

function findKthidUserLocally(kthid) {
  return models.User.findOne({
    where: {
      kthid: kthid,
    }
  }).then(function(maybeUser) {
    return maybeUser
      ? Promise.resolve(maybeUser)
      : Promise.reject("User with kthid " + kthid + " was not found locally.");
  });
}

router.post('/create', helpers.requireadmin, function(req, res) {
  debug("Request body: " + JSON.stringify(req.body));
  console.log("Request body: " + JSON.stringify(req.body));

  if (validRequest(req.body)) {
    Promise.all([
      getUsThisUser(req.body.kthid), 
      models.Role.findOne({ where: {
        id:req.body.roleId
      }}),
    ]).catch(function (err){ debug("Error finding user/role: " + err);return Promise.reject(err);})
    .then( makeSureNoneNull )
    .then(function (results) {
      var user = results[0];
      var role = results[1];

      debug("creating mandate with user" + JSON.stringify(user));
      debug("creating mandate with role" + JSON.stringify(role));
      var createSpec = {
        start: req.body.start,
        end: req.body.end,
        UserId: user.id,
        RoleId: role.id,
      };
      debug("ISITMISSING???? " + createSpec.UserId);
      debug("Creating mandate with spec: " + JSON.stringify(createSpec));
      models.Mandate.create(createSpec).then(function() {
        debug("Creating apparently worked.");
        res.redirect('/');
      });
    }, function(reason) {
      debug("Could not find one of the needed fields, reason: ", reason);
      debug("Request body: " + JSON.stringify(req.body));
      res.render("error", { message: "One of the needed fields could not be found."});
    });
  } else {
    debug("Invalid request: " + JSON.stringify(req.body));
    res.render("error", { message: "Invalid mandate request."});
  }
});

module.exports = router;
