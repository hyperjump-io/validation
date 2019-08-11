const { isType } = require("../../common");


const compile = (doc) => doc;
const interpret = async (type, doc) => {
  return isType[type](await doc);
};

module.exports = { compile, interpret };
