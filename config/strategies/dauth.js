var passport = require('passport');
var CustomStrategy = require('passport-custom').Strategy;
var fetch = require('node-fetch')
var env = require("../../util/env")

function verify(token, callback) {
  fetch(env.login_api_url + "/verify/" + token + "?api_key=" + env.login_key)
    .then((res) => res.json())
    .then((data) => callback(data))
    .catch(() => callback(undefined))
}


module.exports = function() {
  passport.use('dauth', new CustomStrategy(
    function(req, done) {
      var token = req.params.token;
      verify(token, function(user) {
        if(!user) {
          return done(null, false, { message: 'No user'});
        } else {
          return done(null, user);
        }
      });
    }
  ));
};
