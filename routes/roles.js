
var express = require('express');
var router  = express.Router();
var debug   = require('debug')("dfunkt");
var models  = require('../models');
var validate = require("../util/validate.js");
var helpers = require('./helpers');

function validRequest(body) {
  return validate.isNonemptyString(body.title) &&
         validate.isNonemptyString(body.description) &&
         validate.isNonemptyString(body.email) &&
         validate.isNonemptyString(body.identifier) && 
         validate.isNonemptyString(body.type);
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
