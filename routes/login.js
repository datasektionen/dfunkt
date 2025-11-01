var express = require('express');
var debug = require('debug')('login');
var router  = express.Router();

var passport = require('passport');

router.get('/test', function(req, res) {
	res.send('test hello ' + req.user);
});

router.get('/oidc', passport.authenticate('openidconnect'));

router.get('/callback',
  passport.authenticate('openidconnect', { failureRedirect: '/login/oidc', failureMessage: true }),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

module.exports = router;
