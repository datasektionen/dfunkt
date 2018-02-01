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

router.get("/fix_nulls", helpers.requireadmin, function (req, res) {
  console.log("FINDING USERs");
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
    res.send(users);
  });
});

module.exports = router;
