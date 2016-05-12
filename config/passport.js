var models  = require('../models');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        //We rely on the kthid to *never* change.
        models.User.findOne({where: {kthid:user.user}}).then(function(dbuser) {
        	if(!dbuser || !dbuser.ugkthid) {
        		//If user does not exist or has not been fully create it.
        		models.User.create({
        			first_name: user.first_name,
        			last_name: user.last_name,
        			email: user.email,
        			kthid: user.user,
        			ugkthid: user.ugkthid,
        		});
        	}
        });
        done(null, user.user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    require('./strategies/dauth.js')();
}