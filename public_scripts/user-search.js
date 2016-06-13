var validate = require("../util/validate.js");
var search_comps = require("./search-components.js");
var ChooseUserBox = search_comps.ChooseUserBox;
ReactDOM.render(
  <ChooseUserBox data={[]} url="/kthpeople/search/" />,
  document.getElementById('react-user-search')
);

var mandateForm = document.getElementById('form-create-mandate');
validate(mandateForm, function(elements){
  if (!nonemptyStringElements(elements.kthid, elements.ugkthid)) {
    alert("Vänligen välj en användare till mandatet.");
    return false;
  }
});

function validate(form, validator) {
  var elements = form.elements;
  form.onSubmit = function() {
    return validator(elements);
  };
}

function nonemptyStringElements(strings) {
  var result = true;
  for (s in strings) {
    result = result && validate.isNonemptyString(s.value);
  }
  return result;
}

    
