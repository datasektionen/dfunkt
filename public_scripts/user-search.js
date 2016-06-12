var search_comps = require("./search-components.js");
var ChooseUserBox = search_comps.ChooseUserBox;
ReactDOM.render(
  <ChooseUserBox data={[]} url="/kthpeople/search/" />,
  document.getElementById('react-user-search')
);

var form = document.getElementById('form-create-mandate');
form.onsubmit = function(){
  var elements = form.elements;
  if (isNonemptyString(elements["kthid"].value) &&
      isNonemptyString(elements["ugkthid"].value)) {
    return true;
  } else {
    alert("Vänligen välj en användare till mandatet.");
    return false;
  }
};

function isNonemptyString(str) {
  return typeof(str) == 'string' && str != '';
}
    


