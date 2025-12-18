"use strict";

var Promise = require("bluebird");
var models  = require('../models');
var express = require('express');
var helpers = require('./helpers');
var debug = require("debug")("dfunkt");
var router  = express.Router();
const sso = require("../util/sso");

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

router.get("/fix_nulls", helpers.requireadmin, function (req, res) {
  models.User.findAll({
    where: {
      $or: [
        {email: null},
        {first_name: null},
        {last_name: null},
      ]
    }
  })
  .then(function (users) {
    const updates = users.map(user => {
      return sso.byKthid(user.kthid)
      .then(userFromSso => {
        return user.update({
          first_name: userFromSso.first_name,
          last_name: userFromSso.last_name,
          email: userFromSso.email,
        });
      })
      .then((newUser) => {
        const ret = newUser.first_name + newUser.last_name;
        return ret;
      });
    });
    Promise.all(updates)
    .then(fixed_names => {
      res.send(fixed_names)
    })
    .catch(err => res.send(err));
  });
});

module.exports = router;
