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

module.exports = router;
