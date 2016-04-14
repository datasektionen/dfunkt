var models  = require('../models');
var express = require('express');
var router  = express.Router();

router.post('/create', function(req, res) {
  models.Mandate.create({
    start: req.body.start,
    end: req.body.end,
    UserId: req.body.userId,
    RoleId: req.body.roleId,
  }).then(function() {
    res.redirect('/');
  });
});

module.exports = router;
