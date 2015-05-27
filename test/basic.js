"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _assert = require("assert");

var _assert2 = _interopRequireDefault(_assert);

var _postcss = require("postcss");

var _postcss2 = _interopRequireDefault(_postcss);

var _ = require("../");

var _2 = _interopRequireDefault(_);

var pipeline = (0, _postcss2["default"])([_2["default"]]),
    check = function check(desc, input, expected, randomStrs) {
  it(desc, function () {
    _2["default"].getRandomStr = randomStrs ? function () {
      return randomStrs.shift();
    } : _2["default"].defaultRandomStr;
    _assert2["default"].equal(pipeline.process(input).css, expected);
  });
};

describe("processor", function () {
  check("it should extract an import within a :local", ":local(.exportName) { extends: importName from \"path/library.css\"; other: rule; }", "\n:import(\"path/library.css\") {\n  importName: __tmp_importName_rand0ml0l0l; }\n:local(.exportName) { extends: __tmp_importName_rand0ml0l0l; other: rule; }", ["rand0ml0l0l"]);

  check("it should not care if single-quotes are used", ":local(.exportName) { extends: importName from 'path/library.css'; other: rule; }", "\n:import(\"path/library.css\") {\n  importName: __tmp_importName_rand0ml0l0l; }\n:local(.exportName) { extends: __tmp_importName_rand0ml0l0l; other: rule; }", ["rand0ml0l0l"]);

  check("should import multiple classes on a single line", ":local(.exportName) { extends: importName secondImport from 'path/library.css'; other: rule; }", "\n:import(\"path/library.css\") {\n  importName: __tmp_importName_rand0ml0l0l;\n  secondImport: __tmp_secondImport_rand0ml1l1l; }\n:local(.exportName) { extends: __tmp_importName_rand0ml0l0l __tmp_secondImport_rand0ml1l1l; other: rule; }", ["rand0ml0l0l", "rand0ml1l1l"]);

  check("should consolidate imports by file for multiple files and multiple classes",

  /* INPUT */
  "\n:local(.exportName) {\n  extends: importName secondImport from 'path/library.css';\n  other: rule;\n}\n:local(.otherExport) {\n  extends: thirdImport from 'path/library.css';\n  extends: otherLibImport from 'path/other-lib.css';\n}",

  /* OUTPUT */
  "\n:import(\"path/other-lib.css\") {\n  otherLibImport: __tmp_otherLibImport_rand0ml3l3l3;\n}\n:import(\"path/library.css\") {\n  importName: __tmp_importName_rand0ml0l0l;\n  secondImport: __tmp_secondImport_rand0ml1l1l;\n  thirdImport: __tmp_thirdImport_rand0ml2l2l;\n}\n:local(.exportName) {\n  extends: __tmp_importName_rand0ml0l0l __tmp_secondImport_rand0ml1l1l;\n  other: rule;\n}\n:local(.otherExport) {\n  extends: __tmp_thirdImport_rand0ml2l2l;\n  extends: __tmp_otherLibImport_rand0ml3l3l3;\n}",
  /* RANDOMS */
  ["rand0ml0l0l", "rand0ml1l1l", "rand0ml2l2l", "rand0ml3l3l3"]);

  check("should ignore imports not inside our rule whitelist", ":local(.exportName) { imports: importName from \"path/library.css\"; something-else: otherLibImport from \"path/other-lib.css\"; }", ":local(.exportName) { imports: importName from \"path/library.css\"; something-else: otherLibImport from \"path/other-lib.css\"; }");
});