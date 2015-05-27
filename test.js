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
    `
:import("path/library.css") {
  importName: __tmp_importName_rand0ml0l0l; }
:local(.exportName) { extends: __tmp_importName_rand0ml0l0l; other: rule; }`,
    ["rand0ml0l0l"]
  )

  check(
    "it should not care if single-quotes are used",
    `:local(.exportName) { extends: importName from 'path/library.css'; other: rule; }`,
    `
:import("path/library.css") {
  importName: __tmp_importName_rand0ml0l0l; }
:local(.exportName) { extends: __tmp_importName_rand0ml0l0l; other: rule; }`,
    ["rand0ml0l0l"]
  )

  check(
    "should import multiple classes on a single line",
    `:local(.exportName) { extends: importName secondImport from 'path/library.css'; other: rule; }`,
    `
:import("path/library.css") {
  importName: __tmp_importName_rand0ml0l0l;
  secondImport: __tmp_secondImport_rand0ml1l1l; }
:local(.exportName) { extends: __tmp_importName_rand0ml0l0l __tmp_secondImport_rand0ml1l1l; other: rule; }`,
    ["rand0ml0l0l", "rand0ml1l1l"]
  )

  check(
    "should consolidate imports by file for multiple files and multiple classes",

    /* INPUT */
    `
:local(.exportName) {
  extends: importName secondImport from 'path/library.css';
  other: rule;
}
:local(.otherExport) {
  extends: thirdImport from 'path/library.css';
  extends: otherLibImport from 'path/other-lib.css';
}`,

    /* OUTPUT */
    `
:import("path/other-lib.css") {
  otherLibImport: __tmp_otherLibImport_rand0ml3l3l3;
}
:import("path/library.css") {
  importName: __tmp_importName_rand0ml0l0l;
  secondImport: __tmp_secondImport_rand0ml1l1l;
  thirdImport: __tmp_thirdImport_rand0ml2l2l;
}
:local(.exportName) {
  extends: __tmp_importName_rand0ml0l0l __tmp_secondImport_rand0ml1l1l;
  other: rule;
}
:local(.otherExport) {
  extends: __tmp_thirdImport_rand0ml2l2l;
  extends: __tmp_otherLibImport_rand0ml3l3l3;
}`,
    /* RANDOMS */
    ["rand0ml0l0l", "rand0ml1l1l", "rand0ml2l2l", "rand0ml3l3l3"]
  )

  check(
    "should ignore imports not inside our rule whitelist",
    `:local(.exportName) { imports: importName from "path/library.css"; something-else: otherLibImport from "path/other-lib.css"; }`,
    `:local(.exportName) { imports: importName from "path/library.css"; something-else: otherLibImport from "path/other-lib.css"; }`
  )
})
