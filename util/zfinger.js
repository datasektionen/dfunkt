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

function queryKthid(kthid) {
  return Promise( function(resolve, reject) {
    var url = 'https://zfinger.datasektionen.se/user/' + kthid;
    var request = new XMLHttpRequest();
    request.responseType = "json";
    request.open('GET', this.props.url + encodeURIComponent(query), true);
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        var user = request.response;
        user = zfingerParseUser(user);
        debug("resolving zfinger query with " + user);
        resolve(user);
      } else {
        reject("Had problems connecting to zfinger to create new user.");
      }
    }.bind(this);

    request.onerror = function() {
      reject("Could not connect to zfinger to create new user.");
    }.bind(this);

    request.send();
  });
}

module.exports = {
  queryKthid,
};
