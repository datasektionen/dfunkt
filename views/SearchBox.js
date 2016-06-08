function zfingerParseUser(user) {
  return {
    fullname: user.cn,
    kthid: user.uid,
  };
}

var SearchBox = React.createClass({
  getInitialState: function() {
    return {
      data: [],
      doSort: true,
      searching: false,
      didSearch: false,
      gotError: false,
    };
  },
  handleSubmit: function(query) {
    this.setState({searching: true, didSearch: true, error: false, data: []});
    var request = new XMLHttpRequest();
    request.responseType = "json";
    request.open('GET', this.props.url + encodeURIComponent(query), true);
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        var data = request.response;
        this.setState({data: data.results.map(zfingerParseUser), searching: false});
      } else {
        console.error(this.props.url, request.statusText);
        this.setState({searching: false, error: true});
        // We reached our target server, but it returned an error
      }
    }.bind(this);

    request.onerror = function() {
        console.error(this.props.url, request.statusText);
        this.setState({searching: false, error: true});
    }.bind(this);

    console.log('Sending search for "' + query + '"');
    request.send();
  },
  handleCheckbox: function(event) {
    this.setState({doSort: event.target.checked});
  },
  render: function() {
    var results;
    if (this.state.error) {
      results = <p>Något gick fel. Bugg? <a href="https://github.com/datasektionen/dfunkt/issues/new">Rapportera det!</a></p>
    } else if (this.state.searching) {
      results = <p>Söker...</p>;
    } else if (this.state.didSearch && this.state.data.length == 0) {
      results = <p>Inga resultat alls. Du stavade allt rätt, eller hur?</p>;
    } else {
      var dataCopy = this.state.data.slice(0);
      if (this.state.doSort === true) {
        dataCopy.sort(function(a, b) {
          return a.fullname.localeCompare(b.fullname);
        }); 
      } 
      results = <ResultList data={dataCopy} />;
    }
    return (
        <div>
          <SearchBar handleSubmit={this.handleSubmit} />
          <p>
            <input type='checkbox' checked={this.state.doSort} onChange={this.handleCheckbox} />
            Sortera alfabetiskt
          </p>
          {results}
        </div>
    );
  }
});

var SearchBar = React.createClass({
  getInitialState: function() {
    return {query: ""};
  },
  onSubmit: function() {
    this.props.handleSubmit(this.state.query);
    return false;
  },
  onChange: function(event) {
    this.setState({query: event.target.value});
  },
  onKey: function(e) {
    const enter = 13;
    if (enter == e.keyCode || enter == e.charCode) { // If it's enter
      this.onSubmit();
    } 
  },
  render: function() {
    return (
      <div onKeyPress={this.onKey} >
        <input type='text' placeholder="Namn" onChange={this.onChange} value={this.state.query} />
        <input type='submit' onClick={this.onSubmit} value="Sök"/>
      </div>
    );
  },
});

var ResultList = React.createClass({
  render: function() {
    var resultNodes = this.props.data.map(function(result) {
      return <Result fullname={result.fullname} kthid={result.kthid}/>;
    });
    return <div>{resultNodes}</div>;
  }
});

// tutorial4.js
var Result = React.createClass({
  render: function() {
    return (
      <div className="comment">
        <h3 className="commentAuthor">
          {this.props.fullname}
        </h3>
        <p> 
          kthid: <b>{this.props.kthid}</b>
        </p>
        {this.props.children}
      </div>
    );
  }
});
