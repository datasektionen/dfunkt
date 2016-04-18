var models  = require('../models');
var express = require('express');
var debug = require('debug')('Mandaties');
var router  = express.Router();

router.post('/create', function(req, res) {
  models.User.findOne({
      where: {
          name:req.body.username
      }
  }).then(function (user) {
      debug("creating with user" + JSON.stringify(user));
      models.Mandate.create({
        start: req.body.start,
        end: req.body.end,
        UserId: user.id,
        RoleId: req.body.roleId,
      }).then(function() {
        res.redirect('/');
      });
  });
});

module.exports = router;
