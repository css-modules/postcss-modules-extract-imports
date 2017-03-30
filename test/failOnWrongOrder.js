'use strict';

const assert = require('assert');
const postcss = require('postcss');
const processor = require('../');

describe('failOnWrongOrder', () => {
  let pipeline;

  beforeEach(() => {
    pipeline = postcss([
      processor({failOnWrongOrder: true}),
    ]);
  });

  it('should throw an exception', () => {
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

    assert.throws(() => pipeline.process(input).css,
      /Failed to resolve order of composed modules/);
  });
});
