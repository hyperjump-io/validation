const Hyperjump = require("@hyperjump/browser");
const Core = require("./core");


const addCommonKeywords = (keywordDomain) => {
  Core.addKeyword(`${keywordDomain}/const`, require("./keywords/common/const"));
  Core.addKeyword(`${keywordDomain}/type`, require("./keywords/common/type"));
  Core.addKeyword(`${keywordDomain}/multipleOf`, require("./keywords/common/multipleOf"));
  Core.addKeyword(`${keywordDomain}/maximum`, require("./keywords/common/maximum"));
  Core.addKeyword(`${keywordDomain}/exclusiveMaximum`, require("./keywords/common/exclusiveMaximum"));
  Core.addKeyword(`${keywordDomain}/minimum`, require("./keywords/common/minimum"));
  Core.addKeyword(`${keywordDomain}/exclusiveMinimum`, require("./keywords/common/exclusiveMinimum"));
  Core.addKeyword(`${keywordDomain}/maxLength`, require("./keywords/common/maxLength"));
  Core.addKeyword(`${keywordDomain}/minLength`, require("./keywords/common/minLength"));
  Core.addKeyword(`${keywordDomain}/pattern`, require("./keywords/common/pattern"));
  Core.addKeyword(`${keywordDomain}/items`, require("./keywords/common/items"));
  Core.addKeyword(`${keywordDomain}/tupleItems`, require("./keywords/common/tupleItems"));
  Core.addKeyword(`${keywordDomain}/maxItems`, require("./keywords/common/maxItems"));
  Core.addKeyword(`${keywordDomain}/minItems`, require("./keywords/common/minItems"));
  Core.addKeyword(`${keywordDomain}/uniqueItems`, require("./keywords/common/uniqueItems"));
  Core.addKeyword(`${keywordDomain}/properties`, require("./keywords/common/properties"));
  Core.addKeyword(`${keywordDomain}/patternProperties`, require("./keywords/common/patternProperties"));
  Core.addKeyword(`${keywordDomain}/propertyNames`, require("./keywords/common/propertyNames"));
  Core.addKeyword(`${keywordDomain}/maxProperties`, require("./keywords/common/maxProperties"));
  Core.addKeyword(`${keywordDomain}/minProperties`, require("./keywords/common/minProperties"));
  Core.addKeyword(`${keywordDomain}/required`, require("./keywords/common/required"));
  Core.addKeyword(`${keywordDomain}/allOf`, require("./keywords/common/allOf"));
  Core.addKeyword(`${keywordDomain}/anyOf`, require("./keywords/common/anyOf"));
  Core.addKeyword(`${keywordDomain}/oneOf`, require("./keywords/common/oneOf"));
  Core.addKeyword(`${keywordDomain}/not`, require("./keywords/common/not"));
  Core.addKeyword(`${keywordDomain}/definitions`, require("./keywords/common/definitions"));
  Core.addKeyword(`${keywordDomain}/validation`, require("./keywords/common/validation"));
};

const JRef = Hyperjump.getContentType("application/reference+json");
Hyperjump.addContentType("application/validation+json", JRef);

addCommonKeywords("http://validation.hyperjump.io/common");
addCommonKeywords("https://validation.hyperjump.io/common");

module.exports = Core;
