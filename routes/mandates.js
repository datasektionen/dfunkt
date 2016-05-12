var models  = require('../models');
var express = require('express');
var debug = require('debug')('mandates');
var router  = express.Router();

function validRequest(body) {
  return body.userId && 
         body.roleId && 
         body.start &&
         body.end &&
         new Date(body.start) <= new Date(body.end);
}

function makeSureNoneNull(values) {
  for (var i = 0; i < values.length; i++) {
    var value = values[i];
    if (value === null) {
      return Promise.reject(Error("Value #" + i + " was null."));
    }
  }
  return Promise.resolve(values);
};

router.post('/create', function(req, res) {
  debug("Request body: " + JSON.stringify(req.body));

  if (validRequest(req.body)) {
    Promise.all([
      models.User.findOne({
        where: {
          id:req.body.userId
        }
      }),
      models.Role.findOne({
        where: {
          id:req.body.userId
        }
      }),
    ]).then( makeSureNoneNull )
    .then(function (results) {
      var user = results[0];
      var role = results[1];

      debug("creating with user" + JSON.stringify(user));
      debug("creating with role" + JSON.stringify(role));

      models.Mandate.create({
        start: req.body.start,
        end: req.body.end,
        UserId: user.id,
        RoleId: role.id,
      }).then(function() {
        res.redirect('/');
      });
    }, function(reason) {
      debug("Could not find one of the needed fields, reason: ", reason);
      debug("Request body: " + JSON.stringify(req.body));
      res.redirect('/');
    });
  } else {
    debug("Invalid request: " + JSON.stringify(req.body));
    // TODO: Add an error page informing user that the request failed
    res.redirect('/');
  }
});

module.exports = router;
