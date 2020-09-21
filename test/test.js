const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const processor = require("../src");

function normalize(str) {
  return str.replace(/\r\n?/g, "\n").replace(/\n$/, "");
}

describe("test-cases", function () {
  const testDir = path.join(__dirname, "test-cases");
  fs.readdirSync(testDir).forEach(function (testCase) {
    if (fs.existsSync(path.join(testDir, testCase, "source.css"))) {
      it("should " + testCase.replace(/-/g, " "), function () {
        const input = normalize(
          fs.readFileSync(path.join(testDir, testCase, "source.css"), "utf-8")
        );
        const expected = normalize(
          fs.readFileSync(path.join(testDir, testCase, "expected.css"), "utf-8")
        );
        expect(postcss([processor]).process(input).css).toEqual(expected);
      });
    }
  });
});
