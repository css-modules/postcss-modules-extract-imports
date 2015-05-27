import assert from "assert"
import postcss from "postcss"
import processor from "./index.src.js"

let pipeline = postcss([processor]),
  check = (desc, input, expected) => {
    it(desc, () => {
      assert.equal(pipeline.process(input).css, expected)
    })
  }

describe("processor", () => {
  check(
    "it should do nothing",
    "a { b: c; }",
    "a { b: c; }"
  )
})
