var models  = require('../models');
var express = require('express');
var helpers = require('./helpers');
var zfinger = require('../util/zfinger');
var debug = require('debug')('dfunkt');
var router  = express.Router();

function validRequest(body) {
  // TODO: Check if user is an actual user 
  return body.userId && 
         body.roleId && 
         body.start &&
         body.end &&
         body.ugkthid &&
         body.ugkthid != "" &&
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
};

function findOrCreateUser(user) {
  debug("GOind to find or create dis: " + user);
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
  });
}

function findThisUser(kthid) {
  return models.User.findOne({
    where: {
      kthid: kthid
    }
  }).then(function(maybeUser) {
    debug("after findOne user");
    if (!maybeUser) {
      debug("But it was not found");
      var p = zfinger.queryKthid(kthid);
      p.catch(function(err){ debug("err zfingering user: " + err); return Promise.reject(err);})
      p.then(findOrCreateUser)
      p.catch(function(err){ debug("err creating user: " + err); return Promise.reject(err);});
      return p;
    } else {
      debug("It was found, returning it!");
      return maybeUser;
    }
  }).catch(function(err){ debug("err findThisUser: " + err); return Promise.reject(err);});
}

router.post('/create', helpers.requireadmin, function(req, res) {
  debug("Request body: " + JSON.stringify(req.body));

  if (validRequest(req.body)) {
    Promise.all([
      findThisUser(req.body.kthid), // TODO: add validation with ugkthid smh // Might have just done this
      models.Role.findOne({ where: {
        id:req.body.roleId
      }}),
    ]).catch(function (err){ debug("Error finding user/role: " + err);return Promise.reject(err);})
    .then( makeSureNoneNull )
    .then(function (results) {
      var user = results[0];
      var role = results[1];

      debug("creating with user" + JSON.stringify(user));
      debug("creating with role" + JSON.stringify(role));

      models.Mandate.create({
        start: req.body.start,
        end: req.body.end,
        UserId: user.id,
        RoleId: role.id,
      }).then(function() {
        res.redirect('/');
      });
    }, function(reason) {
      debug("Could not find one of the needed fields, reason: ", reason);
      debug("Request body: " + JSON.stringify(req.body));
      res.render("error", { message: "One of the needed fields could not be found."});
    });
  } else {
    debug("Invalid request: " + JSON.stringify(req.body));
    // TODO: Add an error page informing user that the request failed
    res.render("error", { message: "Invalid mandate request."});
  }
});

module.exports = router;
