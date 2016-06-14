var passport = require('passport');
var express = require('express');
var debug = require('debug')('login');
var router  = express.Router();

router.get('/test', function(req, res) {
  console.log(req.user);
  res.send('test hello ' + req.user);
});

router.get('/dauth/:token', passport.authenticate('dauth', {
  successRedirect: '/',
  failureRedirect: '/',
}));

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
