
var ChooseUserBox = React.createClass({
  getInitialState: function() {
    return {
      selected: null,
    };
  },
  render: function() {
    var selected = !!this.state.selected;
    var styleResult = selected ? {} : {display:"none"};
    var styleSearchbox = selected ? {display:"none"} : {};
    return (
      <div>
        <input 
          type="hidden" 
          name="ugkthid" 
          value={this.state.selected ? this.state.selected.ugkthid : ""} 
        />
        <input 
          type="hidden" 
          name="kthid" 
          value={this.state.selected ? this.state.selected.kthid : ""} 
        />
        <div style={styleResult}>
          <p>Klicka för att avmarkera.</p>
          <Result 
            {...this.state.selected}
            onSelect={
              function(data) {
                this.setState({selected: null});
              }.bind(this)
            }
          />
        </div>
        <div style={styleSearchbox}>
          <SearchBox 
            {...this.props}
            key="searchbox" 
            onSelect={
              function(data) {
                this.setState({selected: data});
              }.bind(this)
            } 
          />
        </div>
      </div>
    );
  },
});

var SearchBox = React.createClass({
  getInitialState: function() {
    return {
      data: [],
      doSort: false,
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
        this.setState({data: data.results, searching: false});
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
    var sortCheckbox;
    var clickLabel;
    var resultsLength = this.state.data.length;
    if (this.state.error) {
      results = <p>Något gick fel. Bugg? <a href="https://github.com/datasektionen/dfunkt/issues/new">Rapportera det!</a></p>
    } else if (this.state.searching) {
      results = <p>Söker...</p>;
    } else if (this.state.didSearch && resultsLength == 0) {
      results = <p>Inga resultat alls. Du stavade allt rätt, eller hur?</p>;
    } else {
      var dataCopy = this.state.data.slice(0);
      if (this.state.doSort === true) {
        dataCopy.sort(function(a, b) {
          return a.fullname.localeCompare(b.fullname);
        }); 
      } 
      results = <ResultList data={dataCopy} onSelect={this.props.onSelect} />;
      if (resultsLength > 1) {
        sortCheckbox = (
          <p>
            <input type='checkbox' checked={this.state.doSort} onChange={this.handleCheckbox} />
            Sortera alfabetiskt
          </p>
        );
        clickLabel = <p>Klicka för att välja användare.</p>;
      }
    }
    return (
        <div>
          <SearchBar handleSubmit={this.handleSubmit} />
          {sortCheckbox}
          {clickLabel}
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
    if (enter == e.keyCode || enter == e.charCode) {
      e.preventDefault();
      this.onSubmit();
    } 
  },
  render: function() {
    return (
      <div >
        <input type='text' placeholder="Namn" onChange={this.onChange} value={this.state.query} onKeyDown={this.onKey} />
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
      <div className="result" onClick={callOnSelect} >
        <h3 className="result-name">
          {this.props.fullname}
        </h3>
        <p className="result-kthid"> 
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
