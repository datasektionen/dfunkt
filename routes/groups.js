var express = require('express');
var router  = express.Router();
var debug   = require('debug')("groups");
var helpers = require('./helpers');
var validate = require("../util/validate.js");
var models  = require('../models');

function validRequest(body) {
  return isNonemptyString(body.name) &&
         isNonemptyString(body.identifier);
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
