var express = require('express');
var https = require('https');
var debug = require('debug')('dfunkt');
var zfinger = require("../util/zfinger");
var helpers = require('./helpers');
var models = require("../models");
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
    zfinger.search(query).then(function(results) {
      res.send(results);
    }).catch(function(err) {
      res.render('error', err);
      console.error(err);
    });
});
module.exports = router;
