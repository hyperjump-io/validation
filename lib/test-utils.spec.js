const nock = require("nock");


const testDomain = "http://test.hyperjump.io";

const loadDoc = (url, json) => {
  nock(testDomain, { allowUnmocked: true })
    .get(url)
    .reply(200, json, { "Cache-Control": "max-age=2", "Content-Type": "application/validation+json" });
};

after(nock.cleanAll);

module.exports = { testDomain, loadDoc };
