"use strict";

/*globals describe it */

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var postcss = require("postcss");
var processor = require("../");

var pipeline = postcss([processor]);

function normalize(str) {
  return str.replace(/\r\n?/g, "\n");
}

describe("test-cases", function() {
  var testDir = path.join(__dirname, "test-cases");
  fs.readdirSync(testDir).forEach(function(testCase) {
    if(fs.existsSync(path.join(testDir, testCase, "source.css"))) {
      it("should " + testCase.replace(/-/g, " "), function() {
        var input = normalize(fs.readFileSync(path.join(testDir, testCase, "source.css"), "utf-8"));
        var expected = normalize(fs.readFileSync(path.join(testDir, testCase, "expected.css"), "utf-8"));
        assert.equal(pipeline.process(input).css, expected);
      });
    }
  });
});
