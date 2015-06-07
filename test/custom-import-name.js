"use strict";

/*globals describe it */

var assert = require("assert");
var postcss = require("postcss");
var processor = require("../");


describe("custom-import-name", function() {
  it("should allow to provide a custom imported name", function() {
    var input = ":local(.name) { composes: abc from \"def\"; }";
    var expected = ":import(\"def\") {\n  abc-from-def: abc;\n}\n:local(.name) { composes: abc-from-def; }";
    var pipeline = postcss([processor({
      createImportedName: function(importName, path) { return importName + "-from-" + path; }
    })]);
    assert.equal(pipeline.process(input).css, expected);
  });
});
