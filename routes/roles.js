var models  = require('../models');
var express = require('express');
var router  = express.Router();

function validRequest(body) {
  return body.name && body.name !== "" &&
         body.description && body.description !== "" &&
         body.email && body.email !== ""
}

router.post('/create', function(req, res) {
  if (validRequest(req.body)) {
    models.Role.create({
      name: req.body.name,
      email: req.body.email,
      description: req.body.description,
    }).then(function() {
      res.redirect('/');
    });
  } else {
    debug("Invalid request: " + JSON.stringify(req.body));
    res.redirect('/');
  }
});

module.exports = router;
