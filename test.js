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
    `:import("path/library.css") { importName: __tmp-rand0ml0l0l; } :local(.exportName) { extends: __tmp-rand0ml0l0l; other: rule; }`,
    ["rand0ml0l0l"]
  )

  it("it should not care if single-quotes are used")
  it("should import multiple classes on a single line")
  it("should consolidate imports by file for multiple files and multiple classes")
  it("should ignore imports not inside a :local")
  it("should ignore imports not inside our rule whitelist")
})
