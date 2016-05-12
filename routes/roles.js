var models  = require('../models');
var express = require('express');
var router  = express.Router();
var helpers = require('./helpers');
var debug   = require('debug')("routes");

function validRequest(body) {
  return body.title && body.title !== "" &&
         body.description && body.description !== "" &&
         body.email && body.email !== ""
}

router.post('/create', helpers.requireadmin, function(req, res) {
  if (validRequest(req.body)) {
    models.Role.create({
      title: req.body.title,
      email: req.body.email,
      description: req.body.description,
    }).then(function() {
      res.redirect('/');
    });
  } else {
    debug("Invalid request: " + JSON.stringify(req.body));
    res.redirect('/');
  }
});

module.exports = router;
