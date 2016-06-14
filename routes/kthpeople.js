var express = require('express');
var https = require('https');
var debug = require('debug')('dfunkt');
var zfinger = require("../util/zfinger");
var helpers = require('./helpers');
var models = require("../models");
var router  = express.Router();

router.get('/', function(req, res) {
  res.render('kthsearch');
});

router.get('/search', function(req, res) {
  res.redirect('/kthpeople/search/' + req.query.query);
});
router.get('/search/:query', function(req, res) {
  var query = req.params.query;
  zfinger.search(query)
    .then((results) => res.send(results))
    .catch((err) => res.render('error', err));
});
module.exports = router;
