var search_comps = require("./search-components.js");
var SearchBox = search_comps.SearchBox;
ReactDOM.render(
  <SearchBox data={[]} url="/kthpeople/search/" />,
  document.getElementById('reactform')
);


