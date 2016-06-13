var express = require('express');
var router  = express.Router();
var moment = require('moment');
var models = require('../models');

router.get('/roles', function(req, res) {
  models.Role.findAll({
    attributes: ['title', 'description', 'email'],
    include: [includeGroupSpec],
  }).then(function(roles) {
    res.json(roles);
  });
});

router.get('/role/:title/', function(req, res) {
  models.Role.findOne({
    where: {title: req.params.title},
    attributes: ['id', 'title', 'description', 'email'],
    include: [includeGroupSpec],
  }).then(function(role) {
    if (role) {
      res.status(404);
      res.send('does not exist');
    } else {
      GetRoleMandates(role.id).then(function(result) {
        res.json({
          role: role,
          mandates: result,
        });
      });
    }
  });
});

router.get('/role/:title/current', function(req, res) {
  models.Role.findOne({
    where: {title: req.params.title},
    attributes: ['id', 'title', 'description', 'email'],
    include: [includeGroupSpec],
  }).then(function(role) {
    if (!role) {
      res.status(404);
      res.send('does not exist');
    } else {
      getCurrentMandatesForRole(role.id).then(function(result) {
        res.json({
          role: role,
          mandates: result,
        });
      });
    }
  });
});

router.get('/roles/type/:type/all', function(req, res) {
  models.Role.findAll({
    where: {type: req.params.type},
    attributes: ['id', 'title', 'description', 'email'],
    include: [includeGroupSpec],
  }).then(function(roles) {
    console.log(roles);
    if (!roles) {
      res.status(404);
      res.send('does not exist');
    } else {
      var promises = [];
      for (var i = roles.length - 1; i >= 0; i--) {
        promises.push(getMandatesForRole(roles[i].id));
      }
      Promise.all(promises).then(function(results) {
        var _res = [];
        for (var i = results.length - 1; i >= 0; i--) {
          var obj = {};
          obj[roles[results.length - i - 1].title] = results[i];
          _res.push(obj);
        }
        res.json(_res);
      });
    }
  });
});

router.get('/roles/type/:type/all/current', function(req, res) {
  models.Role.findAll({
    where: {type: req.params.type},
    attributes: ['id', 'title', 'description', 'email'],
    include: [includeGroupSpec],
  }).then(function(roles) {
    console.log(roles);
    if (!roles) {
      res.status(404);
      res.send('does not exist');
    } else {
      var promises = [];
      for (var i = roles.length - 1; i >= 0; i--) {
        promises.push(getCurrentMandatesForRole(roles[i].id));
      }
      Promise.all(promises).then(function(results) {
        var _res = [];
        for (var i = results.length - 1; i >= 0; i--) {
          var obj = {};
          obj[roles[results.length - i - 1].title] = results[i];
          _res.push(obj);
        }
        res.json(_res);
      });
    }
  });
});

//All roles who has a history and all of their history.
router.get('/roles/all', function(req, res) {
  models.Role.findAll({
    attributes: ['id', 'title', 'description', 'email'],
    include: [includeGroupSpec],
  }).then(function(roles) {
    var promises = [];
    for (var i = roles.length - 1; i >= 0; i--) {
      promises.push(getMandatesForRole(roles[i].id));
    }
    Promise.all(promises).then(function(results) {
      var _res = [];
      for (var i = results.length - 1; i >= 0; i--) {
        var obj = {};
        obj[roles[results.length - i - 1].title] = results[i];
        _res.push(obj);
      }
      res.json(_res);
    });
  });
});

router.get('/roles/all/current', function(req, res) {
  models.Role.findAll({
    attributes: ['id', 'title', 'description', 'email'],
    include: [includeGroupSpec],
  }).then(function(roles) {
    var promises = [];
    for (var i = roles.length - 1; i >= 0; i--) {
      promises.push(getCurrentMandatesForRole(roles[i].id));
    }
    Promise.all(promises).then(function(results) {
      var _res = [];
      for (var i = results.length - 1; i >= 0; i--) {
        var obj = {};
        obj[roles[results.length - i - 1].title] = results[i];
        _res.push(obj);
      }
      res.json(_res);
    });
  });
});


router.get('/users', function(req, res) {
  models.User.findAll({
    attributes: ['first_name', 'last_name', 'email', 'kthid', 'ugkthid', 'admin']
  }).then(function(users) {
    res.json(users);
  });
});

router.get('/user/kthid/:kthid', function(req, res) {
  models.User.findOne({where: {kthid:req.params.kthid}}).then(function(user) {
    sendUserAndHisMandates(user, res);
  });
});

router.get('/user/kthid/:kthid/current', function(req, res) {
  models.User.findOne({where: {kthid:req.params.kthid}}).then(function(user) {
    sendUserAndHisCurrentMandates(user, res);
  });
});

router.get('/user/ugkthid/:ugkthid', function(req, res) {
  models.User.findOne({where: {ugkthid:req.params.ugkthid}}).then(function(user) {
    sendUserAndHisMandates(user, res);
  });
});

router.get('/user/ugkthid/:ugkthid/current', function(req, res) {
  models.User.findOne({where: {ugkthid:req.params.ugkthid}}).then(function(user) {
    sendUserAndHisCurrentMandates(user, res);
  });
});


var getMandatesForRole = function(roleid) {
  models.Mandate.findAll({
    where: {RoleId: roleid},
    attributes: ['start', 'end'],
    include: [includeUserSpec],
  });
};

var getCurrentMandatesForRole = function(roleid) {
  var now = new moment().format('YYYY-MM-DD');
  return models.Mandate.findAll({
    where: {RoleId: roleid, start: {$lte: now}, end: {$gte: now}},
    attributes: ['start', 'end'],
    include: [includeUserSpec],
  });
};

//Returns the user and mandates for him.
var sendUserAndHisMandates = function(user, res) {
  if(user) {
    models.Mandate.findAll({
      where: {UserId: user.id},
      attributes: ['start', 'end'],
      include: [includeRoleSpec],
    }).then(function(mandates) {
      res.json({
        user: user,
        mandates: mandates
      });
    });
  } else {
    res.status(404);
    res.send("does not exist");
  }
};

//Returns the user and mandates for him.
var sendUserAndHisCurrentMandates = function(user, res) {
  if(user) {
    var now = new moment().format('YYYY-MM-DD');
    models.Mandate.findAll({
      where: {UserId: user.id, end: {$gte: now}, start: {$lte: now}},
      attributes: ['start', 'end'],
      include: [includeRoleSpec],
    }).then(function(mandates) {
      res.json({
        user: user,
        mandates: mandates
      });
    });
  } else {
    res.status(404);
    res.send("does not exist");
  }
};

var includeGroupSpec = {
  model: models.Group,
  attributes: ['name', 'identifier'],
};
var includeRoleSpec = {
  model: models.Role,
  attributes: ['title', 'email'],
};
var includeUserSpec = {
  model: models.User,
  attributes: ['first_name', 'last_name', 'email', 'kthid', 'ugkthid'],
};

module.exports = router;
