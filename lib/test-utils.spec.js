import nock from "nock";


export const testDomain = "http://validation.hyperjump.io";

export const loadSchema = (url, json) => {
  return nock(testDomain, { allowUnmocked: true }).get(url).reply(200, json).persist();
};

after(nock.cleanAll);
