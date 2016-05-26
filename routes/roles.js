var models  = require('../models');
var express = require('express');
var router  = express.Router();
var helpers = require('./helpers');
var debug   = require('debug')("routes");

function validRequest(body) {
  return body.title && body.title !== "" &&
         body.description && body.description !== "" &&
         body.email && body.email !== "" &&
         body.identifier && body.identifier !== "" &&
         body.type && body.type !== ""
}

router.post('/create', helpers.requireadmin, function(req, res) {
  if (validRequest(req.body)) {
    models.Role.create({
      title: req.body.title,
      email: req.body.email,
      description: req.body.description,
      identifier: req.body.identifier,
      GroupId: req.body.type,
    }).then(function() {
      res.redirect('/');
    });
  } else {
    debug("Invalid request: " + JSON.stringify(req.body));
    res.render("error", { message: "Invalid role request."});
  }
});

module.exports = router;
