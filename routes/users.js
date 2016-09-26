var models  = require('../models');
var express = require('express');
var helpers = require('./helpers');
var debug = require("debug")("dfunkt");
var router  = express.Router();

router.post('/create', helpers.requireadmin, function(req, res) {
  if (req.body.first_name !== "") {
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
  toggleAdmin(req.body.userId, true).then(function() {
    res.redirect('/');
  }).catch(function (err) {
    res.render('error', {message: err});
  });
});

router.post('/revoke-admin', helpers.requireadmin, function(req, res) {
  toggleAdmin(req.body.userId, false).then(function() {
    res.redirect('/');
  }).catch(function (err) {
    res.render('error', {message: err});
  });
});

function toggleAdmin(user_id, set_admin) {
  return models.User.findById(user_id).then(function(user) {
    if (user) {
      return user.update({admin: set_admin}).then(function() {
        debug("User " + user.first_name + " admin made " + set_admin);
      });
    } else {
      debug("Failed to update admin status: No user for id " + user_id);
      return Promise.reject("Failed to update admin status: No user for id " + user_id);
    }
  });
}

module.exports = router;
