const nock = require("nock");


const testDomain = "http://test.hyperjump.io";

const loadDoc = (url, json) => {
  return nock(testDomain, { allowUnmocked: true })
    .get(url)
    .reply(200, json, { "Cache-Control": "max-age=2" });
};

after(nock.cleanAll);

module.exports = { testDomain, loadDoc };
