var models  = require('../models');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        //We rely on the kthid to *never* change.
        models.User.findOne({where: {kthid:user.user}}).then(function(dbuser) {
        	if(!dbuser) {
        		//If user does not exist create it.
        		models.User.create({
        			first_name: user.first_name,
        			last_name: user.last_name,
        			email: user.email,
        			kthid: user.user,
        			ugkthid: user.ugkthid,
                    admin: false,
        		});
                console.log("adding user: " + user.user);
        	} else if(!dbuser.ugkthid) { //Update user if they are loggin in for the first time.
        		dbuser.update({
        			first_name: user.first_name,
        			last_name: user.last_name,
        			email: user.email,
        			kthid: user.user,
        			ugkthid: user.ugkthid,
                    admin: false,
        		});
                console.log("updating user: " + user.user);
        	}
        });
        done(null, user.user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    require('./strategies/dauth.js')();
};
