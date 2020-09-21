const assert = require("assert");
const postcss = require("postcss");
const processor = require("../src");

describe("check-import-order", () => {
  it("should throw an exception", () => {
    const input = `
      .aa {
        composes: b from './b.css';
        composes: c from './c.css';
      }

      .bb {
        composes: c from './c.css';
        composes: b from './b.css';
      }
    `;

    assert.throws(() => {
      postcss([processor({ failOnWrongOrder: true })]).process(input).css;
    }, /Failed to resolve order of composed modules/);
  });
});
