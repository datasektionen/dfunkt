var models  = require('../models');
var express = require('express');
var helpers = require('./helpers');
var zfinger = require('../util/zfinger');
var validate = require("../util/validate.js");
var debug = require('debug')('dfunkt');
var router  = express.Router();

router.post('/create', helpers.requireadmin, function(req, res) {
  var body = req.body;
  debug("Request body: " + JSON.stringify(body));
  if (validRequest(body)) {
    Promise.all([
      getUsThisUser(body.kthid, body.ugkthid), 
      findRoleById(body.roleId),
    ]).then( rejectIfAnyNull )
    .then(function (results) {
      var user = results[0];
      var role = results[1];
      debug("creating mandate with user:" 
          + JSON.stringify(user) 
          + " and role:" 
          + JSON.stringify(role));

      return createMandate(body.start, body.end, user.id, role.id);
    }).then(function() {
      res.redirect('/');
    }).catch(function(reason) {
      debug("Could not find one of the needed fields, reason: ", reason);
      debug("Request body: " + JSON.stringify(req.body));
      res.render("error", { message: "One of the needed fields could not be found."});
    });
  } else {
    debug("Invalid request: " + JSON.stringify(req.body));
    res.render("error", { message: "Invalid mandate request."});
  }
});

function findRoleById(roleId) {
  return models.Role.findOne({ where: {
    id:roleId
  }});
}

function createMandate(start, end, userId, roleId) {
  return models.Mandate.create({
    start: start,
    end: end,
    UserId: userId,
    RoleId: roleId,
  });
}

function validRequest(body) {
  return validate.isNonemptyString(body.kthid) &&
         validate.isNonemptyString(body.ugkthid) &&
         body.roleId && 
         body.start &&
         body.end &&
         new Date(body.start) <= new Date(body.end);
}

function rejectIfAnyNull(values) {
  for (v in values) {
    if (v == null) {
      return Promise.reject(Error("A value was null."));
    }
  }
  return Promise.resolve(values);
};

function getUsThisUser(kthid, ugkthid) {
  return findExactUserLocally(kthid, ugkthid)
    .catch( (e) => findKthidUserLocally(kthid)
            .then((usr) => zfingerUpdateUser(ugkthid, usr)))
    .catch( (e) => findUgkthidUserLocally(ugkthid)
            .then((usr) => zfingerUpdateUser(ugkthid, usr)))
    .catch( (e) => zfingerCreateUser(ugkthid));
}

function zfingerUpdateUser(ugkthid, userToUpdate) {
  return zfinger.byUgkthid(ugkthid).then(function(zfingerUser) {
    if (hasConflictingUgkthid(userToUpdate, zfingerUser.ugkthid)) {
      var errMsg = 
        "Can't update user w/ ugkthid: " + userToUpdate.ugkthid + 
        "to match zfinger user w/ ugkthid: " + zfingerUser.ugkthid +
        " (Different ugkthids. This should never happen! Our db must be corrupted).";
      debug(errMsg);
      console.log("IMPORTANT: " + errMsg); // Because this should never ever happen
      return Promise.reject(errMsg);
    } else {
      userToUpdate.first_name = zfingerUser.first_name;
      userToUpdate.last_name = zfingerUser.last_name;
      userToUpdate.kthid = zfingerUser.kthid;
      userToUpdate.ugkthid = zfingerUser.ugkthid;
      userToUpdate.save();
      return userToUpdate;
    }
  });
}

function zfingerCreateUser(ugkthid) {
  return zfinger.byUgkthid(ugkthid).then(findOrCreateUser);
}

function findOrCreateUser(user) {
  debug("Going to find or create this user: " + user);
  return models.User.findOrCreate({
    where: {
      first_name: user.first_name,
      last_name: user.last_name,
      kthid: user.kthid,
      ugkthid: user.ugkthid,
    },
    defaults: {
      admin: false, 
    },
  }).spread(function (result, didCreate) {
    debug(didCreate ? "Created the user." : "The user was found.");
    return result;
  });
}

function hasConflictingUgkthid(userToCheck, correctUgkthid) {
  return userToCheck.ugkthid && userToCheck.ugkthid !== correctUgkthid;
}

function findExactUserLocally(kthid, ugkthid) {
  return models.User.findOne({
    where: {
      kthid: kthid,
      ugkthid: ugkthid,
    }
  }).then(function(maybeUser) {
    return maybeUser
      ? Promise.resolve(maybeUser)
      : Promise.reject("User with kthid/ugkthid " + kthid + "/" + ugkthid + " was not found locally.");
  });
}

function findKthidUserLocally(kthid) {
  return models.User.findOne({
    where: {
      kthid: kthid,
    }
  }).then(function(maybeUser) {
    return maybeUser
      ? Promise.resolve(maybeUser)
      : Promise.reject("User with kthid " + kthid + " was not found locally.");
  });
}

function findUgkthidUserLocally(ugkthid) {
  return models.User.findOne({
    where: {
      ugkthid: ugkthid,
    }
  }).then(function(maybeUser) {
    return maybeUser
      ? Promise.resolve(maybeUser)
      : Promise.reject("User with ugkthid " + ugkthid + " was not found locally.");
  });
}

module.exports = router;
