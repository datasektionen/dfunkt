var express = require('express');
var models = require('../models');
var router  = express.Router();


router.get("/:RoleId/list", function(req, res) {
  models.Role.findById(req.params.RoleId, {
    attributes: ["title", "description", "email"], 
  }).then(function(role) {
    models.Mandate.findAll({
      where: {RoleId: req.params.RoleId,},
      attributes: ["start", "end"],
      include: [{
	model: models.User, 
	attributes: ["first_name", "kthid"], //TODO: fix
      }],
    }).then(function(mandates) {
      res.json({
	title:  role.title,
	description: role.description,
	email: role.email,
	mandates: mandates,
      });
    });
  });
});

router.get('/list', function(req, res) {
  models.Role.findAll({
    attributes: ["title", "description", "email", "id"],
  }).then(function(roles) {
    models.Mandate.findAll({
      attributes: ["start", "end", "RoleId"],
      include: [{
	model: models.User, 
	attributes: ["first_name", "kthid"], //TODO: fix
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
    title:  role.title,
    description: role.description,
    email: role.email,
    mandates: mostRecentMandate(allMandates.filter(byId)),
  };
}

function mostRecentMandate(mandates) {
  if (mandates.length == 0) {
    return [];
  } else {
    return mandates.reduce(function(prev, curr) {
      if (curr.end > prev.end) {
	return curr;
      } else {
	return prev;
      }
    });
  }
}

module.exports = router;
