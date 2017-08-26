var models  = require('../models');
var express = require('express');
var router  = express.Router();
var helpers = require('./helpers');
var debug   = require('debug')("routes");

function validRequest(body) {
  return body.title && body.title !== "" &&
         body.description && body.description !== "" &&
         body.email && body.email !== "" &&
         body.identifier && body.identifier !== "" &&
         body.type && body.type !== ""
}

router.post('/create', helpers.requireadmin, function(req, res) {
  if (validRequest(req.body)) {
    var active = (req.body.active ? true : false);
    models.Role.create({
      title: req.body.title,
      email: req.body.email,
      description: req.body.description,
      identifier: req.body.identifier,
      active: active,
      GroupId: req.body.type,
    }).then(function() {
      res.redirect('/');
    });
  } else {
    debug("Invalid request: " + JSON.stringify(req.body));
    res.render("error", { message: "Invalid role request."});
  }
});

router.post('/update', helpers.requireadmin, function(req, res) {
  if (validRequest(req.body)) {
    var active = req.body.active;
    models.Role.update({
      title: req.body.title,
      email: req.body.email,
      description: req.body.description,
      identifier: req.body.identifier,
      active: active,
      GroupId: req.body.type,
    }, {
      where: {id: req.body.id}
    }).then(function() {
      res.redirect('/position/id/' + req.body.id);
    });
  } else {
    res.render("error", { message: "Invalid role update request."});
  }
});

router.post('/delete/:id', helpers.requireadmin, function(req, res) {
  var id = req.params.id;
  models.Role.findOne({where: {id: id, identifier: req.body.identifier}}).then(function(role) {
    if(role) {
      //Correct identifier now do the delete.
      //Destroy the role
      models.Role.destroy({
        where: {id: id}
      });
      res.redirect('/'); //Success
    } else {
      res.status(403);
      res.send("failed verification");
    }
  });
});

module.exports = router;
