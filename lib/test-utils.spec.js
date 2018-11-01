import nock from "nock";


export const testDomain = "http://test.hyperjump.io";

export const loadDoc = (url, json) => {
  return nock(testDomain, { allowUnmocked: true })
    .get(url)
    .reply(200, json, { "Cache-Control": "max-age=2" });
};

after(nock.cleanAll);
