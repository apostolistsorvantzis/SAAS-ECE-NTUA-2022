function dateIsValid(date) {
    return date instanceof Date && !isNaN(date);
  }
  
  module.exports = dateIsValid;