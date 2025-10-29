"use strict";
var Sequelize = require("sequelize");
var Promise = require("bluebird");
var models = require("../models");
var express = require("express");
var router = express.Router();
var helpers = require("./helpers");

router.get("/", function (req, res) {
  Promise.all([
    helpers.rolesFindAllCurrent(),
    helpers.isadmin(req.user),
    helpers.issearch(req.user),
  ])
    .then(function (results) {
      var rolemandates = results[0];
      var isadmin = results[1];
      var issearch = results[2];
      res.render("index", {
        user: req.user,
        isadmin,
        issearch,
        rolemandates,
      });
    })
    .catch(function (e) {
      console.error(e);
      res.status(403);
      res.send("error");
    });
});

router.get("/user/:kthid", function (req, res) {
  models.User.findOne({ where: { kthid: req.params.kthid } }).then(function (
    user
  ) {
    if (user) {
      Promise.all([
        models.Mandate.findAll({
          include: [{ all: true, nested: true }],
          where: { UserId: user.id },
          order: [["start", "DESC"]],
        }),
        helpers.isadmin(req.user),
        helpers.issearch(req.user),
      ])
        .then(function (results) {
          var mandates = results[0];
          var isadmin = results[1];
          var issearch = results[2];
          res.render("user", {
            user: req.user,
            userobj: user,
            isadmin,
            mandates,
            issearch,
          });
        })
        .catch(function (e) {
          console.error(e);
          res.status(403);
          res.send("error");
        });
    } else {
      res.status(404);
      res.send("This user does not exist in dfunkt.");
    }
  });
});

router.get("/position/:identifier", function (req, res) {
  var identifier = req.params.identifier;
  models.Role.findOne({ where: { identifier } }).then((role) => {
    if (role == null) {
      res.status(404);
      res.send(`Bad position identfier ${identifier}`);
      return;
    }

    return respondPositionWithRole(role, req, res);
  });
});

router.get("/position/id/:id", function (req, res) {
  var id = req.params.id;
  models.Role.findOne({ where: { id } }).then(function (role) {
    if (role == null) {
      res.status(404);
      res.send(`Bad position id ${id}`);
      return;
    }

    return respondPositionWithRole(role, req, res);
  });
});

function respondPositionWithRole(role, req, res) {
  let mandatesWithRoleIdP = models.Mandate.findAll({
    include: [{ all: true, nested: true }],
    where: { RoleId: role.id },
    order: [["start", "DESC"]],
  });

  return Promise.all([
    mandatesWithRoleIdP,
    helpers.isadmin(req.user),
    helpers.issearch(req.user),
    models.Group.findAll({}),
  ])
    .spread(function (mandates, isadmin, issearch, groups) {
      res.render("position", {
        user: req.user,
        isadmin,
        issearch,
        roleobj: role,
        mandates,
        groups,
      });
    })
    .catch(function (e) {
      console.error(e);
      res.status(403);
      res.send("error");
    });
}

router.get("/admin", helpers.requireadmin, function (req, res) {
  Promise.all([
    models.User.findAll({
      order: ["last_name"],
    }),
    models.Role.findAll({
      include: [{ model: models.Group, as: "Group" }],
      order: ["title"],
    }),
    models.Mandate.findAll({
      include: [
        { model: models.User, as: "User" },
        { model: models.Role, as: "Role" },
      ],
    }),
    helpers.isadmin(req.user),
    helpers.issearch(req.user),
    models.Group.findAll({}),
    models.User.findAll({
      order: ["last_name"],
      where: { admin: true },
    }),
  ]).then(function (results) {
    var users = results[0];
    var roles = results[1];
    var mandates = results[2];
    var isadmin = results[3];
    var issearch = results[4];
    var groups = results[5];
    var admins = results[6];
    res.render("admin", {
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

router.get("/exports", function (req, res) {
  Promise.all([
    helpers.rolesFindAllCurrent(),
    helpers.isadmin(req.user),
    helpers.issearch(req.user),
  ])
    .then(function (results) {
      var rolemandates = results[0];
      var isadmin = results[1];
      var issearch = results[2];
      res.render("exports", {
        user: req.user,
        isadmin,
        issearch,
        rolemandates,
      });
    })
    .catch(function (e) {
      console.error(e);
      res.status(403);
      res.send("error");
    });
});

// Function to calculate maximum simultaneous roles for a user
function calculateMaxSimultaneous(mandates) {
  if (mandates.length <= 1) return mandates.length;

  // Create events for role starts and ends
  const events = [];
  mandates.forEach((mandate) => {
    events.push({ date: new Date(mandate.start), type: "start" });
    events.push({ date: new Date(mandate.end), type: "end" });
  });

  // Sort events by date
  events.sort((a, b) => {
    if (a.date.getTime() === b.date.getTime()) {
      // If same date, process 'end' before 'start' to handle same-day transitions
      return a.type === "end" ? -1 : 1;
    }
    return a.date.getTime() - b.date.getTime();
  });

  let current = 0;
  let max = 0;

  events.forEach((event) => {
    if (event.type === "start") {
      current++;
      max = Math.max(max, current);
    } else {
      current--;
    }
  });

  return max;
}

router.get("/stats", function (req, res) {
  Promise.all([
    helpers.rolesFindAll(),
    helpers.isadmin(req.user),
    helpers.issearch(req.user),
  ])
    .then(function (results) {
      const pageSize = parseInt(req.query.entries) || 20;
      const sorting = req.query.sorting || "count";
      var findAll = results[0];
      var isadmin = results[1];
      var issearch = results[2];

      var usermandates = {};
      findAll.forEach(function (role) {
        role.Mandates.forEach(function (mandate) {
          usermandates[mandate.User.ugkthid] = usermandates[
            mandate.User.ugkthid
          ] || { mandates: [], user: mandate.User };
          usermandates[mandate.User.ugkthid].mandates.push({
            role: role.title,
            start: mandate.start,
            end: mandate.end,
          });
        });
      });
      // Count the number of mandates for each user and add it to the usermandates object
      Object.keys(usermandates).forEach(function (key) {
        usermandates[key].count = usermandates[key].mandates.length;
        usermandates[key].days = usermandates[key].mandates.reduce(function (
          sum,
          mandate
        ) {
          return (
            sum +
            1 +
            Math.ceil(
              (Math.min(new Date(mandate.end), Date.now()) -
                new Date(mandate.start)) /
                86400000
            )
          );
        },
        0);

        // Calculate unique roles
        usermandates[key].uniqueRoles = new Set(
          usermandates[key].mandates.map((mandate) => mandate.role)
        ).size;

        // Calculate maximum simultaneous roles
        usermandates[key].maxSimultaneous = calculateMaxSimultaneous(
          usermandates[key].mandates
        );
      });
      // Sort the usermandates object by the number of mandates and save all data in the object
      var sortedByMandateCount = Object.keys(usermandates)
        .sort(function (a, b) {
          if (usermandates[b].count === usermandates[a].count) {
            return usermandates[b].days - usermandates[a].days;
          }
          return usermandates[b].count - usermandates[a].count;
        })
        .map(function (key, index) {
          return {
            ...usermandates[key],
            idx: index + 1,
          };
        });

      // Sort ascending by mandate count
      var sortedByMandateCountAsc = Object.keys(usermandates)
        .sort(function (a, b) {
          if (usermandates[a].count === usermandates[b].count) {
            return usermandates[a].days - usermandates[b].days;
          }
          return usermandates[a].count - usermandates[b].count;
        })
        .map(function (key, index) {
          return {
            ...usermandates[key],
            idx: index + 1,
          };
        });

      // Total days for each user on a mandate
      var sortedByDaysOnMandate = Object.keys(usermandates)
        .sort(function (a, b) {
          if (usermandates[b].days === usermandates[a].days) {
            return usermandates[b].count - usermandates[a].count;
          }
          return usermandates[b].days - usermandates[a].days;
        })
        .map(function (key, index) {
          return {
            ...usermandates[key],
            idx: index + 1,
          };
        });

      // Sort ascending by days
      var sortedByDaysOnMandateAsc = Object.keys(usermandates)
        .sort(function (a, b) {
          if (usermandates[a].days === usermandates[b].days) {
            return usermandates[a].count - usermandates[b].count;
          }
          return usermandates[a].days - usermandates[b].days;
        })
        .map(function (key, index) {
          return {
            ...usermandates[key],
            idx: index + 1,
          };
        });

      // Sort by unique roles (descending)
      var sortedByUniqueRoles = Object.keys(usermandates)
        .sort(function (a, b) {
          if (usermandates[b].uniqueRoles === usermandates[a].uniqueRoles) {
            return usermandates[b].days - usermandates[a].days;
          }
          return usermandates[b].uniqueRoles - usermandates[a].uniqueRoles;
        })
        .map(function (key, index) {
          return {
            ...usermandates[key],
            idx: index + 1,
          };
        });

      // Sort by unique roles (ascending)
      var sortedByUniqueRolesAsc = Object.keys(usermandates)
        .sort(function (a, b) {
          if (usermandates[a].uniqueRoles === usermandates[b].uniqueRoles) {
            return usermandates[a].days - usermandates[b].days;
          }
          return usermandates[a].uniqueRoles - usermandates[b].uniqueRoles;
        })
        .map(function (key, index) {
          return {
            ...usermandates[key],
            idx: index + 1,
          };
        });

      // Sort by max simultaneous roles (descending)
      var sortedByMaxSimultaneous = Object.keys(usermandates)
        .sort(function (a, b) {
          if (
            usermandates[b].maxSimultaneous === usermandates[a].maxSimultaneous
          ) {
            return usermandates[b].days - usermandates[a].days;
          }
          return (
            usermandates[b].maxSimultaneous - usermandates[a].maxSimultaneous
          );
        })
        .map(function (key, index) {
          return {
            ...usermandates[key],
            idx: index + 1,
          };
        });

      // Sort by max simultaneous roles (ascending)
      var sortedByMaxSimultaneousAsc = Object.keys(usermandates)
        .sort(function (a, b) {
          if (
            usermandates[a].maxSimultaneous === usermandates[b].maxSimultaneous
          ) {
            return usermandates[a].days - usermandates[b].days;
          }
          return (
            usermandates[a].maxSimultaneous - usermandates[b].maxSimultaneous
          );
        })
        .map(function (key, index) {
          return {
            ...usermandates[key],
            idx: index + 1,
          };
        });

      // Sort by dFunk-år (days/365) (descending)
      var sortedByYears = Object.keys(usermandates)
        .sort(function (a, b) {
          const yearsA = usermandates[a].days / 365;
          const yearsB = usermandates[b].days / 365;
          if (yearsB === yearsA) {
            return usermandates[b].days - usermandates[a].days;
          }
          return yearsB - yearsA;
        })
        .map(function (key, index) {
          return {
            ...usermandates[key],
            idx: index + 1,
          };
        });

      // Sort by dFunk-år (ascending)
      var sortedByYearsAsc = Object.keys(usermandates)
        .sort(function (a, b) {
          const yearsA = usermandates[a].days / 365;
          const yearsB = usermandates[b].days / 365;
          if (yearsA === yearsB) {
            return usermandates[a].days - usermandates[b].days;
          }
          return yearsA - yearsB;
        })
        .map(function (key, index) {
          return {
            ...usermandates[key],
            idx: index + 1,
          };
        });

      // Pagination logic
      const page = parseInt(req.query.page) || 1;
      var paginatedItems;
      var totalPages;
      var selectedData;

      if (sorting === "days") {
        selectedData = sortedByDaysOnMandate;
      } else if (sorting === "days_desc") {
        selectedData = sortedByDaysOnMandateAsc;
      } else if (sorting === "count_desc") {
        selectedData = sortedByMandateCountAsc;
      } else if (sorting === "unique") {
        selectedData = sortedByUniqueRoles;
      } else if (sorting === "unique_desc") {
        selectedData = sortedByUniqueRolesAsc;
      } else if (sorting === "simultaneous") {
        selectedData = sortedByMaxSimultaneous;
      } else if (sorting === "simultaneous_desc") {
        selectedData = sortedByMaxSimultaneousAsc;
      } else if (sorting === "years") {
        selectedData = sortedByYears;
      } else if (sorting === "years_desc") {
        selectedData = sortedByYearsAsc;
      } else {
        selectedData = sortedByMandateCount; // default to "count"
      }

      paginatedItems = selectedData.slice(
        (page - 1) * pageSize,
        page * pageSize
      );
      totalPages = Math.ceil(selectedData.length / pageSize);

      res.render("stats", {
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
    })
    .catch(function (e) {
      console.error(e);
      res.status(403);
      res.send("error");
    });
});
module.exports = router;
