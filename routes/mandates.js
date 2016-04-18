var models  = require('../models');
var express = require('express');
var debug = require('debug')('mandates');
var router  = express.Router();

function validMandateRequest(body) {
  return body.username && body.username !== "" &&
         body.roleId &&
         body.start &&
         body.end &&
         new Date(body.start) <= new Date(body.end);
}

router.post('/create', function(req, res) {
  debug("Request body: " + JSON.stringify(req.body));
  debug("Searching for user " + JSON.stringify(req.body.username));
  if (validMandateRequest(req.body)) {
    models.User.findOne({
      where: {
        name:req.body.username
      }
    }).then(function (user) {
      if (user) {
        debug("creating with user" + JSON.stringify(user));
        models.Mandate.create({
          start: req.body.start,
          end: req.body.end,
          UserId: user.id,
          RoleId: req.body.roleId,
        }).then(function() {
          res.redirect('/');
        });
      } else {
        debug("Could not find a user for request: " + JSON.stringify(req.body));
        // TODO: Add an error page informing user that the request failed
        res.redirect('/');
      }
    });
  } else {
    debug("Programmer error, missing fields, invalid request: " + JSON.stringify(req.body));
    debug("Did js not stop you?");
    res.redirect('/');
  }
});

module.exports = router;
