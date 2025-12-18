var express = require('express');
var sso = require("../util/sso");
var helpers = require('./helpers');
var router  = express.Router();

router.get('/', function(req, res) {
  Promise.all([
    helpers.isadmin(req.user),
    helpers.issearch(req.user),
  ]).then(function(results) {
    var isadmin = results[0];
    var issearch = results[1];
    res.render('kthsearch', {
      user: req.user,
      isadmin,
      issearch,
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

  sso.byKthid(kthid).then(function(results) {
      res.render('kthresult', results)
  })
});

router.get('/search', function(req, res) {
  res.redirect('/kthpeople/search/' + req.query.query);
});
router.get('/search/:query', function(req, res) {
  var query = req.params.query;
    sso.search(query).then(function(results) {
      res.send(results);
    }).catch(function(err) {
      res.render('error', err);
      console.error(err);
    });
});
module.exports = router;
