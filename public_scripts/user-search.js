var search_comps = require("./search-components.js");
var ChooseUserBox = search_comps.ChooseUserBox;
ReactDOM.render(
  <ChooseUserBox data={[]} url="/kthpeople/search/" />,
  document.getElementById('react-user-search')
);

var form = document.getElementById('form-create-mandate');
form.onsubmit = function(){
  alert("qwe");
  return false;
};


