var models = require('../models');
var OpenIDConnectStrategy = require('passport-openidconnect');

module.exports = function(passport) {
    passport.use(new OpenIDConnectStrategy({
        issuer: process.env['OIDC_PROVIDER'],
        authorizationURL: process.env['OIDC_PROVIDER'] + '/authorize',
        tokenURL: process.env['OIDC_PROVIDER'] + '/oauth/token',
        userInfoURL: process.env['OIDC_PROVIDER'] + '/userinfo',
        clientID: process.env['OIDC_ID'],
        clientSecret: process.env['OIDC_SECRET'],
        callbackURL: process.env['REDIRECT_URL'],
        scope: ['openid', 'profile', 'email'],
    },
        function verify(issuer, profile, cb) {
            //We rely on the kthid to *never* change.
            models.User.findOne({ where: { kthid: profile.id } }).then(function(dbuser) {
                if (!dbuser) {
                    //If user does not exist create it.
                    models.User.create({
                        first_name: profile.givenName,
                        last_name: profile.familyName,
                        email: profile.emails[0].value,
                        kthid: profile.id,
                        ugkthid: "ug" + profile.id,
                        admin: false,
                    });
                    console.log("adding user: " + profile.id);
                } else if (!dbuser.ugkthid) { //Update user if they are loggin in for the first time.
                    dbuser.update({
                        first_name: profile.givenName,
                        last_name: profile.familyName,
                        email: profile.emails[0].value,
                        kthid: profile.id,
                        ugkthid: "ug" + profile.id,
                        admin: false,
                    });
                    console.log("updating user: " + profile.id);
                }
            });
            cb(null, profile.id);
        }
    ));

    passport.serializeUser(function(user, cb) {
        cb(null, user)
    });

    passport.deserializeUser(function(user, cb) {
        cb(null, user);
    });
}
