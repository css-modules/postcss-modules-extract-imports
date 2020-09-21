const assert = require("assert");
const postcss = require("postcss");
const processor = require("../src");

describe("custom-import-name", function () {
  it("should allow to provide a custom imported name", function () {
    const input = ':local(.name) { composes: abc from "def"; }';
    const expected =
      ':import("def") {\n  abc-from-def: abc;\n}\n:local(.name) { composes: abc-from-def; }';
    const pipeline = postcss([
      processor({
        createImportedName: function (importName, path) {
          return importName + "-from-" + path;
        },
      }),
    ]);
    assert.equal(pipeline.process(input).css, expected);
  });
});
