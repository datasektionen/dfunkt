"use strict";
var Sequelize = require("sequelize");
var Promise = require("bluebird");
var models  = require('../models');
var express = require('express');
var router  = express.Router();
var helpers = require('./helpers');

router.get('/', function(req, res) {
  Promise.all([
    helpers.rolesFindAllCurrent(),
    helpers.isadmin(req.user),
    helpers.issearch(req.user),
  ]).then(function(results) {
    var rolemandates = results[0];
    var isadmin = results[1];
    var issearch = results[2];
    res.render('index', {
      user: req.user,
      isadmin,
      issearch,
      rolemandates,
    });
  }).catch(function(e) {
    console.error(e);
    res.status(403);
    res.send('error');
  });
});

router.get('/user/:kthid', function(req, res) {
  models.User.findOne({where: {kthid:req.params.kthid}}).then(function(user) {
    if(user) {
      Promise.all([
        models.Mandate.findAll({
          include: [{all: true, nested: true}],
          where: {UserId: user.id},
          order: [['start', 'DESC']],
        }),
        helpers.isadmin(req.user),
        helpers.issearch(req.user),
      ]).then(function(results) {
        var mandates = results[0];
        var isadmin = results[1];
        var issearch = results[2];
        res.render('user', {
          user: req.user,
          userobj: user,
          isadmin,
          mandates,
          issearch,
        });
      }).catch(function(e) {
        console.error(e);
        res.status(403);
        res.send('error');
      });
    } else {
      res.status(404);
      res.send('This user does not exist in dfunkt.');
    }
  });
});

router.get('/position/:identifier', function(req, res) {
  var identifier = req.params.identifier;
  models.Role.findOne({where: {identifier}})
    .then(role => {
      if ( role == null ) {
        res.status(404);
        res.send(`Bad position identfier ${identifier}`);
        return;
      }

      return respondPositionWithRole(role, req, res);
    });
});

router.get('/position/id/:id', function(req, res) {
  var id = req.params.id;
  models.Role.findOne({where: {id}})
    .then(function(role) {
      if ( role == null ) {
        res.status(404);
        res.send(`Bad position id ${id}`);
        return;
      }

      return respondPositionWithRole(role, req, res);
    })
});

function respondPositionWithRole(role, req, res) {
  let mandatesWithRoleIdP = models.Mandate.findAll({
    include: [{all: true, nested: true}],
    where:   {RoleId: role.id},
    order:   [['start', 'DESC']],
  });

  return Promise.all([ mandatesWithRoleIdP, helpers.isadmin(req.user), helpers.issearch(req.user), models.Group.findAll({}) ])
    .spread(function (mandates, isadmin, issearch, groups) {
      res.render( 'position', {
        user: req.user,
        isadmin,
        issearch,
        roleobj: role,
        mandates,
        groups,
      });
    }).catch(function (e) {
      console.error(e);
      res.status(403);
      res.send('error');
    });
}


router.get('/admin', helpers.requireadmin, function(req, res) {
  Promise.all([
    models.User.findAll({
      order: ['last_name'],
    }),
    models.Role.findAll({
      include: [{model: models.Group, as: "Group"}],
      order: ['title'],
    }),
    models.Mandate.findAll({include: [{model: models.User, as: "User"},
                                      {model: models.Role, as: "Role"}]}),
    helpers.isadmin(req.user),
    helpers.issearch(req.user),
    models.Group.findAll({}),
    models.User.findAll({
      order: ['last_name'],
      where: {admin: true},
    }),
  ]).then(function(results) {
    var users = results[0];
    var roles = results[1];
    var mandates = results[2];
    var isadmin = results[3];
    var issearch = results[4];
    var groups = results[5];
    var admins = results[6];
    res.render('admin', {
      user: req.user,
      isadmin,
      issearch,
      users,
      roles,
      mandates,
      groups,
      admins,
    });
  });
});

router.get('/exports', function(req, res) {
  Promise.all([
    helpers.rolesFindAllCurrent(),
    helpers.isadmin(req.user),
    helpers.issearch(req.user),
  ]).then(function(results) {
    var rolemandates = results[0];
    var isadmin = results[1];
    var issearch = results[2];
    res.render('exports', {
      user: req.user,
      isadmin,
      issearch,
      rolemandates,
    });
  }).catch(function(e) {
    console.error(e);
    res.status(403);
    res.send('error');
  });
});

router.get('/stats', function(req, res) {
  Promise.all([
    helpers.rolesFindAll(),
    helpers.isadmin(req.user),
    helpers.issearch(req.user),
  ]).then(function(results) {
    const pageSize = parseInt(req.query.entries) || 20;
    const sorting = req.query.sorting || "count";
    var findAll = results[0];
    var isadmin = results[1];
    var issearch = results[2];

    var usermandates = {};
    findAll.forEach(function(role) {
      role.Mandates.forEach(function(mandate) {
        usermandates[mandate.User.ugkthid] = usermandates[mandate.User.ugkthid] || {mandates: [], user: mandate.User};
        usermandates[mandate.User.ugkthid].mandates.push({
          role: role.title,
          start: mandate.start,
          end: mandate.end,
        });
      });
    });
    // Count the number of mandates for each user and add it to the usermandates object
    Object.keys(usermandates).forEach(function(key) {
      usermandates[key].count = usermandates[key].mandates.length;
      usermandates[key].days = usermandates[key].mandates.reduce(function(sum, mandate) {
        return sum + 1 + Math.ceil(((Math.min(mandate.end, Date.now())) - mandate.start) / 86400000);
      }, 0);
    });
    // Sort the usermandates object by the number of mandates and save all data in the object
    var sortedByMandateCount = Object.keys(usermandates).sort(function(a, b) {
      if (usermandates[b].count === usermandates[a].count) {
        return usermandates[b].days - usermandates[a].days;
      }
      return usermandates[b].count - usermandates[a].count;
    }).map(function(key, index) {
      return {
        ...usermandates[key],
        idx: index+1
      };
    });

    // Total days for each user on a mandate
    var sortedByDaysOnMandate = Object.keys(usermandates).sort(function(a, b) {
      if(usermandates[b].days === usermandates[a].days) {
        return usermandates[b].count - usermandates[a].count;
      }
      return usermandates[b].days - usermandates[a].days;
    }).map(function(key, index) {
      return {
        ...usermandates[key],
        idx: index+1
      };
    });
    

    // Pagination logic
    const page = parseInt(req.query.page) || 1;
    var paginatedItems;
    var totalPages;
    if (sorting === "days") {
      paginatedItems = sortedByDaysOnMandate.slice((page - 1) * pageSize, page * pageSize);
      totalPages = Math.ceil(sortedByDaysOnMandate.length / pageSize);
    }else{
      paginatedItems = sortedByMandateCount.slice((page - 1) * pageSize, page * pageSize);
      totalPages = Math.ceil(sortedByMandateCount.length / pageSize);
    }



    res.render('stats', {
      user: req.user,
      isadmin,
      issearch,
      findAll,
      usermandates,
      sortedByMandateCount,
      sortedByDaysOnMandate,
      paginatedItems,
      currentPage: page,
      totalPages,
      pageSize,
      sorting,
    });
  }).catch(function(e) {
    console.error(e);
    res.status(403);
    res.send('error');
  });
});
module.exports = router;
