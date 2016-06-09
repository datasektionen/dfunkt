var https = require('https');
var debug = require('debug')('dfunkt');

function zfingerParseUser(user) {
  return {
    fullname: user.cn,
    first_name: user.givenName,
    last_name: user.sn,
    kthid: user.uid,
    ugkthid: user.ugKthid,
  };
}

function httpsGet(url) {
  return new Promise( function(resolve, reject) {
    https.get(url, (get_res) => {
      recv_data = "";
      get_res.on('data', (d) => {
        recv_data += d;
      });
      get_res.on('end', () => {
        resolve(recv_data);
      });
    }).on("error", function(err) {
      reject("error GETing from " + url + ": " + err);
    });
  });
}


function byKthid(kthid) {
  var url = 'https://zfinger.datasektionen.se/user/' + kthid;
  return httpsGet(url).then(function(response) {
    try {
      var resp = JSON.parse(response);
      return Promise.resolve(zfingerParseUser(resp));
    } catch (e) {
      return Promise.reject("No user found on zfinger with kthid " + kthid + ". Zfinger responded: " + recv_data);
    }
  });
}

function search(query) {
  var url = 'https://zfinger.datasektionen.se/users/' + encodeURIComponent(query);
  return httpsGet(url).then( function(response) {
    var resp = JSON.parse(response);
    return {results: resp.results.map(zfingerParseUser)};
  });
}

module.exports = {
  byKthid,
  search,
};
