var models  = require('../models');
var express = require('express');
var router  = express.Router();
var helpers = require('./helpers');
var debug   = require('debug')("groups");

function validRequest(body) {
  return body.name && body.name !== "" &&
         body.identifier && body.identifier !== ""
}

router.post('/create', helpers.requireadmin, function(req, res) {
  if (validRequest(req.body)) {
    models.Group.create({
      name: req.body.name,
      identifier: req.body.identifier,
    }).then(function() {
      res.redirect('/');
    });
  } else {
    debug("Invalid request: " + JSON.stringify(req.body));
    res.render("error", { message: "Invalid role request."});
  }
});

module.exports = router;
