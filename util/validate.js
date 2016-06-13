function isNonemptyString(str) {
  return typeof(str) == 'string' && str !== '';
}

module.exports = {
  isNonemptyString,
};
