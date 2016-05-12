var models  = require('../models');
var express = require('express');
var helpers = require('./helpers');
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

router.post('/:user_id/make-admin', function(req, res) {
  models.User.findById(req.params.user_id).then(function(user) {
    if (user) {
      user.update({admin: true}).then(function() {
	console.log("User " + user.first_name + " made admin.");
	res.redirect('/');
      });
    } else {
      res.redirect('/'); //TODO: An error page.
    }
  });
});


module.exports = router;
