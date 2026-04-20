var request = require('request');
var debug = require('debug')('dfunkt');

function parseUser(user) {
  return {
    fullname: user.firstName + ' ' + user.familyName,
    first_name: user.firstName,
    last_name: user.familyName,
    kthid: user.kthid,
    picture: user.picture
  };
}

function httpsGet(url) {
  return new Promise( function(resolve, reject) {
    request.get(url, (error, response, body) => {
      if(error) {
        reject("error GETing from " + url + ": " + error);
      } else {
        resolve(body);
      }
    });
  });
}

function byKthid(kthid) {
  var url = process.env.SSO_API_URL + '/api/users?format=single&u=' + kthid;
  return httpsGet(url).then(function(response) {
    try {
      var resp = JSON.parse(response);
      resp.kthid = kthid;
      return Promise.resolve(parseUser(resp));
    } catch (e) {
      return Promise.reject("No user found in sso with kthid " + kthid + ". SSO responded: " + response);
    }
  });
}

function search(query) {
  //TODO: maybe do something when we have more than 100 results.
  var url = process.env.SSO_API_URL + '/api/search?limit=100&picture=thumbnail&query=' + encodeURIComponent(query);
  return httpsGet(url).then( function(response) {
    try {
      var results = JSON.parse(response);
      var results = results.map(parseUser);
      return Promise.resolve({results: results});
    } catch {
      return Promise.reject("Could not search for " + query + ". SSO responded: " + response);
    }
  });
}

module.exports = {
  byKthid,
  search,
};
