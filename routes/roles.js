var models  = require('../models');
var express = require('express');
var router  = express.Router();

router.post('/create', function(req, res) {
  models.Role.create({
    name: req.body.name,
    email: req.body.email,
    description: req.body.description,
  }).then(function() {
    res.redirect('/');
  });
});

module.exports = router;
