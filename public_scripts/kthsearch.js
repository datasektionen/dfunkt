var search_comps = require("./search-components.js");
var ChooseUserBox = search_comps.ChooseUserBox;
ReactDOM.render(
  <ChooseUserBox data={[]} url="/kthpeople/search/" userSelectable={false} />,
  document.getElementById('reactform')
);

