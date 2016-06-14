
var express = require('express');
var router  = express.Router();
var debug = require("debug")("dfunkt");
var models  = require('../models');
var helpers = require('./helpers');
var validate = require("../util/validate.js");

router.post('/create', helpers.requireadmin, function(req, res) {
  if (validate.isNonemptyString(req.body.first_name)) {
    models.User.create({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      kthid: req.body.kthid,
      admin: false,
    }).then(function() {
      res.render("success", {
	message: "Created user " + req.body.first_name + " " + req.body.last_name,
      });
    });
  } else {
    debug("User create rejected because empty name.");
    res.render("error", {
      message: "Cannot create a user with an empty name.",
    });
  }
});

router.post('/make-admin', helpers.requireadmin, function(req, res) {
  setAdmin(req.body.userId, true).then(function() {
    res.redirect('/');
  }).catch(function (err) {
    res.render('error', {message: err});
  });
});

router.post('/revoke-admin', helpers.requireadmin, function(req, res) {
  setAdmin(req.body.userId, false).then(function() {
    res.redirect('/');
  }).catch(function (err) {
    res.render('error', {message: err});
  });
});

function setAdmin(userId, adminStatus) {
  return models.User.findById(userId).then(function(user) {
    if (user) {
      return user.update({admin: adminStatus}).then(function() {
        debug("User " + user.first_name + " admin made " + adminStatus);
      });
    } else {
      debug("Failed to update admin status: No user for id " + userId);
      return Promise.reject("Failed to update admin status: No user for id " + userId);
    }
  });
}

module.exports = router;
