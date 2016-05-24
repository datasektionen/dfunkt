// Add the 2 urls where needed.
// Uncomment and run the required queries in the correct order.
// manually fix the sequence numbers in the database.
// (OBS: THIS REQUIRES THE DB TO BE EMPTY BEFORE STARTING.)

var pg = require('pg');
var moment = require('moment')
var pgcon = ""; //add url  here

var mysql  = require('mysql');
var mysqlcon = mysql.createConnection(''); //Add url here

mysqlcon.connect(function(err){
  if(err){
    console.log('mysql Database connection error');
  }else{
    console.log('mysql Database connection successful');
    console.log(err)
  }
});

//Users query.
/*mysqlcon.query('SELECT * from people', function(err, rows, fields) {
	for(i in rows) {
		var id = rows[i].id;
		var kthid = rows[i].username;
		var ugkthid = rows[i].ugid;
		var first_name = rows[i].first_name;
		var last_name = rows[i].last_name;
		var email = rows[i].email;
		//console.log(rows[i]);
		//console.log(kthid);
		var bla = 'INSERT INTO "Users" (id, first_name, last_name, email, kthid, ugkthid, admin, "createdAt", "updatedAt") VALUES (' + id +", '" + first_name + "', '" + last_name + "', '" + email + "', '" + kthid + "', '" + ugkthid +"', 'f', now(), now())";
		console.log(bla);
		PGrunQuery(bla, undefined, function(res) {
			console.log(res);
		});
	}
	//console.log(rows);
});*/

//TODO: finish positions query, group query, and mandates query.
//Positions query to roles, requires that groups have been added first.
/*mysqlcon.query('SELECT * from positions', function(err, rows, fields) {
	for(i in rows) {
		var id = rows[i].id;
		var name = rows[i].name;
		var identifier = rows[i].identifier;
		var email = rows[i].email;
		var desc = rows[i].description;
		desc = desc.replace(/'/g, "''");
		var active = rows[i].active;
		var groupid = rows[i].group_id;

		if(active == 1) {
			active = true;
		} else {
			active = false;
		}
		var bla = 'INSERT INTO "Roles" (id, title, description, identifier, email, active, "createdAt", "updatedAt", "GroupId") VALUES (' + id + ", '" + name + "', '" + desc + "', '" + identifier + "', '" + email + "', " + active +", now(), now()," + groupid + ")";
		//console.log(bla);
		PGrunQuery(bla, undefined, function(res) {
			console.log(res);
		});
	}
});*/

//Group adding query.
/*mysqlcon.query('SELECT * from groups', function(err, rows, fields) {
	for(i in rows) {
		//console.log(rows[i]);
		var id = rows[i].id;
		var name = rows[i].name;
		var identifier = rows[i].identifier;
		var bla = 'INSERT INTO "Groups" (id, name, identifier, "createdAt", "updatedAt") VALUES (' + id + ", '" + name + "', '" + identifier + "', now(), now())";
		//console.log(bla)
		PGrunQuery(bla, undefined, function(res) {
			console.log(res);
		});
	}
});*/

//Mandates query.
/*mysqlcon.query('SELECT * FROM mandates', function(err, rows, fields) {
	for(i in rows) {
		//console.log(rows[i]);
		var id = rows[i].id;
		var start = rows[i].start_date;
		var end = rows[i].end_date;
		var userid = rows[i].person_id;
		var roleid = rows[i].position_id;
		//console.log("0" + start);
		//console.log("1" + new Date(start));
		start = new moment(start).format('YYYY-MM-DD');
		end = new moment(end).format('YYYY-MM-DD'); 
		var bla = 'INSERT INTO "Mandates" VALUES ('+ id + ", '" + start + "', '" + end + "', now(), now(), " + userid + ", " + roleid + ")";
		//var bla = 'INSERT INTO "Mandates" (id, start, end, "createdAt", "updatedAt", "UserId", "RoleId") VALUES ('+ id + ", '" + start + "', '" + end + "', now(), now(), " + userid + ", " + roleid + ")";
		//console.log(bla);
		PGrunQuery(bla, undefined, function(res) {
			console.log(res);
		});
	}
});*/

function PGrunQuery(query, params, callback) {
		pg.connect(pgcon, function(err, client, done) {
	  if(err) {
	    return console.error('error fetching client from pool', err);
	  }
	    client.query(query, params, function(err, result) {
	    //call `done()` to release the client back to the pool
	    done();

	    if(err) {
	      console.log(query)
	      return console.error('error running query', err);
	    }
		return callback(result);
	  });
	});
};
