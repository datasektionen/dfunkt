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
      res.redirect('/');
    });
  } else {
    debug("User create rejected because empty name.");
    res.redirect('/');
  }
});

router.get('/:user_id/destroy', helpers.requireadmin, function(req, res) {
  models.User.destroy({
    where: {
      id: req.params.user_id
    }
  }).then(function() {
    res.redirect('/');
  });
});

function toggleAdmin(user_id, set_admin) {
  return new Promise( function(resolve, reject) {
    models.User.findById(user_id).then(function(user) {
      if (user) {
	user.update({admin: set_admin}).then(function() {
	  debug("User " + user.first_name + " admin made " + set_admin);
	  resolve();
	});
      } else {
	debug("Failed to update admin status: No user for id " + user_id);
	reject("Failed to update admin status: No user for id " + user_id);
      }
    });
  });
}

router.post('/make-admin', function(req, res) {
  toggleAdmin(req.body.userId, true).then(function() {
    res.redirect('/');
  });
});

router.post('/revoke-admin', function(req, res) {
  toggleAdmin(req.body.userId, false).then(function() {
    res.redirect('/');
  });
});

module.exports = router;
