function zfingerParseUser(user) {
  return {
    fullname: user.cn,
    kthid: user.uid,
    ugkthid: user.ugKthid,
  };
}

var ChooseUserBox = React.createClass({
  getInitialState: function() {
    return {
      selected: null,
    };
  },
  render: function() {
    var searchPart;
    if (this.state.selected) {
      searchPart = <Result {...this.state.selected} onSelect={
        function(data) {
          this.setState({selected: null});
        }.bind(this)
      }/>;
    } else {
      searchPart = <SearchBox {...this.props} onSelect={
        function(data) {
          this.setState({selected: data});
        }.bind(this)
      } />;
    }

    return <div>
      <input 
        type="hidden" 
        name="ugkthid" 
        value={this.state.selected ? this.state.selected.ugkthid : ""} 
      />
      {searchPart}
    </div>;
  },
});

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
      results = <ResultList data={dataCopy} onSelect={this.props.onSelect} />;
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
        <input type='button' onClick={this.onSubmit} value="Sök"/>
      </div>
    );
  },
});

var ResultList = React.createClass({
  render: function() {
    var onSelectF = this.props.onSelect;
    var resultNodes = this.props.data.map(function(result) {
      return <Result {...result} onSelect={onSelectF}/>;
    });
    return <div>{resultNodes}</div>;
  }
});

// tutorial4.js
var Result = React.createClass({
  render: function() {
    var callOnSelect = function() {
      this.props.onSelect({
        fullname: this.props.fullname,
        kthid: this.props.kthid,
        ugkthid: this.props.ugkthid,
      });
    }.bind(this);

    return (
      <div className="comment" onClick={callOnSelect}>
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

module.exports = {
  ChooseUserBox,
  SearchBox,
  SearchBar,
  ResultList,
  Result
}
