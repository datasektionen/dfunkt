var models  = require('../models');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        //user.user is the username of user, for example jsimo.
        done(null, user.user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    require('./strategies/dauth.js')();
}