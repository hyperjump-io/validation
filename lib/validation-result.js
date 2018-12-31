const isValid = (result) => result.every(([_pointer, isValid]) => isValid);

module.exports = { isValid };
