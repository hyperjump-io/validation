import nock from "nock";
import const_ from "~/common/const.json";
import type from "~/common/type.json";
import multipleOf from "~/common/multipleOf.json";
import maximum from "~/common/maximum.json";
import exclusiveMaximum from "~/common/exclusiveMaximum.json";
import minimum from "~/common/minimum.json";
import exclusiveMinimum from "~/common/exclusiveMinimum.json";
import maxLength from "~/common/maxLength.json";
import minLength from "~/common/minLength.json";
import pattern from "~/common/pattern.json";
import items from "~/common/items.json";
import tupleItems from "~/common/tupleItems.json";
import maxItems from "~/common/maxItems.json";
import minItems from "~/common/minItems.json";
import uniqueItems from "~/common/uniqueItems.json";
import properties from "~/common/properties.json";
import patternProperties from "~/common/patternProperties.json";
import propertyNames from "~/common/propertyNames.json";
import maxProperties from "~/common/maxProperties.json";
import minProperties from "~/common/minProperties.json";
import required from "~/common/required.json";
import allOf from "~/common/allOf.json";
import anyOf from "~/common/anyOf.json";
import oneOf from "~/common/oneOf.json";
import not from "~/common/not.json";


export const testDomain = "http://validation.hyperjump.com";

export const loadSchema = (url, json) => {
  return nock(testDomain).get(url).reply(200, json).persist();
};

before(() => {
  nock(testDomain).get("/common/const").reply(200, const_).persist();
  nock(testDomain).get("/common/type").reply(200, type).persist();
  nock(testDomain).get("/common/multipleOf").reply(200, multipleOf).persist();
  nock(testDomain).get("/common/maximum").reply(200, maximum).persist();
  nock(testDomain).get("/common/exclusiveMaximum").reply(200, exclusiveMaximum).persist();
  nock(testDomain).get("/common/minimum").reply(200, minimum).persist();
  nock(testDomain).get("/common/exclusiveMinimum").reply(200, exclusiveMinimum).persist();
  nock(testDomain).get("/common/maxLength").reply(200, maxLength).persist();
  nock(testDomain).get("/common/minLength").reply(200, minLength).persist();
  nock(testDomain).get("/common/pattern").reply(200, pattern).persist();
  nock(testDomain).get("/common/items").reply(200, items).persist();
  nock(testDomain).get("/common/tupleItems").reply(200, tupleItems).persist();
  nock(testDomain).get("/common/maxItems").reply(200, maxItems).persist();
  nock(testDomain).get("/common/minItems").reply(200, minItems).persist();
  nock(testDomain).get("/common/uniqueItems").reply(200, uniqueItems).persist();
  nock(testDomain).get("/common/properties").reply(200, properties).persist();
  nock(testDomain).get("/common/patternProperties").reply(200, patternProperties).persist();
  nock(testDomain).get("/common/propertyNames").reply(200, propertyNames).persist();
  nock(testDomain).get("/common/maxProperties").reply(200, maxProperties).persist();
  nock(testDomain).get("/common/minProperties").reply(200, minProperties).persist();
  nock(testDomain).get("/common/required").reply(200, required).persist();
  nock(testDomain).get("/common/allOf").reply(200, allOf).persist();
  nock(testDomain).get("/common/anyOf").reply(200, anyOf).persist();
  nock(testDomain).get("/common/oneOf").reply(200, oneOf).persist();
  nock(testDomain).get("/common/not").reply(200, not).persist();
});

after(nock.cleanAll);
