var express = require('express');
var https = require('https');
var debug = require('debug')('dfunkt');
var router  = express.Router();

router.get('/kthid/:kthid', function(req, res) {
  var kthid = req.params.kthid;
  var url = 'https://zfinger.datasektionen.se/user/' + kthid;

  https.get(url, (get_res) => {
    recv_data = "";
    get_res.on('data', (d) => {
      recv_data += d;
    });
    get_res.on('end', () => {
      res.render('kthresult', JSON.parse(recv_data));
    });
  });
});


router.get('/search/:query', function(req, res) {
  var query = req.params.query;
  var url = 'https://zfinger.datasektionen.se/users/' + query;

  https.get(url, (get_res) => {
    recv_data = "";
    get_res.on('data', (d) => {
      recv_data += d;
    });
    get_res.on('end', () => {
      res.render('kthresults', JSON.parse(recv_data));
    });
  });
});

module.exports = router;
