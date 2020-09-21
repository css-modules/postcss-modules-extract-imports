"use strict";

const assert = require("assert");
const topologicalSort = require("../src/topologicalSort");

const STRICT = true;

describe("topologicalSort", () => {
  it("should resolve graphs", () => {
    const graph1 = {
      v1: ["v2", "v5"],
      v2: [],
      v3: ["v2", "v4", "v5"],
      v4: [],
      v5: [],
    };

    const graph2 = {
      v1: ["v2", "v5"],
      v2: ["v4"],
      v3: ["v2", "v4", "v5"],
      v4: [],
      v5: [],
    };

    assert.deepEqual(topologicalSort(graph1, STRICT), [
      "v2",
      "v5",
      "v1",
      "v4",
      "v3",
    ]);
    assert.deepEqual(topologicalSort(graph2, STRICT), [
      "v4",
      "v2",
      "v5",
      "v1",
      "v3",
    ]);
  });

  it("should return exception if there is a cycle in the graph", () => {
    const graph = {
      v1: ["v3"],
      v2: [],
      v3: ["v1"],
    };

    const er = topologicalSort(graph, STRICT);

    assert.ok(er instanceof Error, "Expected exception");
    assert.deepEqual(er.nodes, ["v1", "v3"]);
  });

  it("should resolve graph in non-strict mode", () => {
    const graph = {
      v1: ["v3"],
      v2: [],
      v3: ["v1"],
    };

    assert.deepEqual(topologicalSort(graph, !STRICT), ["v3", "v1", "v2"]);
  });
});
