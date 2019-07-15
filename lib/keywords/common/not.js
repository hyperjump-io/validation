const HVal = require("../../core");


const compile = async (doc, ast) => {
  await HVal.compile(doc, ast);
  return doc.url;
};

const interpret = async (not, doc, ast, memo) => {
  const result = await HVal.interpret(ast, not)(doc, memo);
  return !HVal.isValid(result);
};

module.exports = { compile, interpret };
