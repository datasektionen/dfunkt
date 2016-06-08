var express = require('express');
var https = require('https');
var debug = require('debug')('dfunkt');
var helpers = require('./helpers');
var router  = express.Router();

router.get('/', function(req, res) {
  Promise.all([
    helpers.isadmin(req.user),
  ]).then(function(results) {
    var isadmin = results[0];
    res.render('kthsearch', {
      user: req.user,
      isadmin: isadmin,
    });
  });
});

function zfingerParseUser(user) {
  return {
    fullname: user.cn,
    kthid: user.uid,
    ugkthid: user.ugKthid,
  };
}

function searchZfinger(query) {
  return new Promise(function(resolve, reject) {
    var url = 'https://zfinger.datasektionen.se/users/' + encodeURIComponent(query);

    https.get(url, (get_res) => {
      recv_data = "";
      get_res.on('data', (d) => {
        recv_data += d;
      });
      
      get_res.on('end', () => {
        var resp = JSON.parse(recv_data);
        resolve({results: resp.results.map(zfingerParseUser)});
      });
    }).on("error", function(err) {
      reject(err);
    });
  });
}

// TODO: Given recent improvements in zfinger, this can safely be removed.
// Unless it is being used somewhere else?
router.get('/kthid', function(req, res) {
  res.redirect('/kthpeople/kthid/' + req.query.kthid);
});
router.get('/kthid/:kthid', function(req, res) {
  var kthid = req.params.kthid;
  var url = 'https://zfinger.datasektionen.se/user/' + kthid;

  https.get(url, (get_res) => {
    recv_data = "";
    get_res.on('data', (d) => {
      recv_data += d;
    });
    get_res.on('end', () => {
      try {
        result = JSON.parse(recv_data);
        res.render('kthresult', result);
      } catch (e) {
        res.render('error',{ message:'No user by that kthid found.' });
      }
    });
  });
});

router.get('/search', function(req, res) {
  res.redirect('/kthpeople/search/' + req.query.query);
});
router.get('/search/:query', function(req, res) {
  var query = req.params.query;
  searchZfinger(query).then(function(results) {
    res.send(JSON.stringify(results));
  }).catch(function(err) {
    res.render('error', err);
  });
});
module.exports = router;
