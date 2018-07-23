import nock from "nock";


export const testDomain = "http://json-reference.hyperjump.com";

export const loadSchema = (url, json) => {
  return nock(testDomain).get(url).reply(200, json).persist();
};

afterEach(nock.cleanAll);
