var models  = require('../models');

var denied = function(res) {
  res.status(403);
  res.send('denied');
}

exports.requirelogin = function(req, res, next) {
  if(req.user) {
    next()
  } else {
    denied(res);
  }
}

exports.requireadmin = function(req, res, next) {
  models.User.findOne({where: {kthid:req.user}}).then(function(user) {
    console.log(user);
    if(user && user.admin) {
      next()
    } else {
      denied(res);
    }
  }); 
}