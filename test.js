import assert from "assert"
import postcss from "postcss"
import processor from "./index.src.js"

let pipeline = postcss([processor]),
  check = (desc, input, expected, randomStrs) => {
    it(desc, () => {
      processor.getRandomStr = randomStrs ? () => randomStrs.shift() : processor.defaultRandomStr
      assert.equal(pipeline.process(input).css, expected)
    })
  }

describe("processor", () => {
  check(
    "it should extract an import within a :local",
    `:local(.exportName) { extends: importName from "path/library.css"; other: rule; }`,
    `:import("path/library.css") {importName: __tmp_importName_rand0ml0l0l; }\n:local(.exportName) { extends: __tmp_importName_rand0ml0l0l; other: rule; }`,
    ["rand0ml0l0l"]
  )

  check(
    "it should not care if single-quotes are used",
    `:local(.exportName) { extends: importName from 'path/library.css'; other: rule; }`,
    `:import("path/library.css") {importName: __tmp_importName_rand0ml0l0l; }\n:local(.exportName) { extends: __tmp_importName_rand0ml0l0l; other: rule; }`,
    ["rand0ml0l0l"]
  )

  check(
    "should import multiple classes on a single line",
    `:local(.exportName) { extends: importName secondImport from 'path/library.css'; other: rule; }`,
    `:import("path/library.css") {importName: __tmp_importName_rand0ml0l0l;secondImport: __tmp_secondImport_rand0ml1l1l; }\n:local(.exportName) { extends: __tmp_importName_rand0ml0l0l __tmp_secondImport_rand0ml1l1l; other: rule; }`,
    ["rand0ml0l0l", "rand0ml1l1l"]
  )
  it("should consolidate imports by file for multiple files and multiple classes")
  it("should ignore imports not inside a :local")
  it("should ignore imports not inside our rule whitelist")
})
