var models  = require('../models');
var express = require('express');
var router  = express.Router();

router.post('/create', function(req, res) {
  if (req.body.name !== "") {
    models.User.create({
      name: req.body.name,
      kthid: req.body.kthid,
    }).then(function() {
      res.redirect('/');
    });
  } else {
    debug("User create rejected because empty name.");
    res.redirect('/');
  }
});

router.get('/:user_id/destroy', function(req, res) {
  models.User.destroy({
    where: {
      id: req.params.user_id
    }
  }).then(function() {
    res.redirect('/');
  });
});

module.exports = router;
