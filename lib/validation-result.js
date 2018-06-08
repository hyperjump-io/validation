const ValidationResult = {};

ValidationResult.isValid = (result) => {
  return result.every(([pointer, isValid]) => isValid);
};

module.exports = ValidationResult;
