const nock = require("nock");


const testDomain = "http://test.hyperjump.io";

const loadDoc = (url, json, contentType = "application/validation+json") => {
  nock(testDomain, { allowUnmocked: true })
    .get(url)
    .reply(200, json, { "Cache-Control": "max-age=2", "Content-Type": contentType })
    .persist();
};

after(nock.cleanAll);

module.exports = { testDomain, loadDoc };
