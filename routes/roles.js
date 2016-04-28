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

router.get('/list', function(req, res) {
  models.Role.findAll({
    attributes: ["name", "description", "email", "id"],
  }).then(function(roles) {
    models.Mandate.findAll({
      attributes: ["start", "end", "RoleId"],
      include: [{
	model: models.User, 
	attributes: ["name", "kthid"],
      }],
    }).then(function(mandates) {
      res.json({roles: roles.map(function(role){
	return jsonRenderRole(role, mandates);
      })});
    });
  });
});

function jsonRenderRole(role, allMandates) {
  function byId(mandate) {
    return mandate.RoleId === role.id;
  };

  return {
    title:  role.name,
    description: role.description,
    email: role.email,
    mandates: allMandates.filter(byId).map(jsonRenderMandate),
  };
}

//TODO: Improve
function jsonRenderMandate(mandate) {
  return mandate;
}

module.exports = router;
