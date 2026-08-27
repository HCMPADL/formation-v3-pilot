const test = require("node:test");
const assert = require("node:assert/strict");

global.window = {};
global.document = {
  querySelector: () => ({}),
};
require("../engine.js");
require("../questions.js");

const F = window.FormationEngine;
const Q = window.FormationQuestions;

function profile(value, mode = "quick") {
  return {
    data: Object.fromEntries(
      F.D.map((domain) => [
        domain,
        { core: value, impact: value, nCore: 4, nImpact: 4 },
      ]),
    ),
    mode,
    barriers: [],
    connections: [],
    constraints: [],
  };
}

test("question bank contains exactly 56 quick and 112 deep questions", () => {
  assert.equal(F.D.length, 14);
  assert.equal(
    F.D.reduce((total, domain) => total + Q[domain].slice(0, 4).length, 0),
    56,
  );
  assert.equal(
    F.D.reduce((total, domain) => total + Q[domain].length, 0),
    112,
  );
  F.D.forEach((domain) => assert.equal(Q[domain].length, 8));
});

test("uniform profiles do not manufacture differentiation", () => {
  const high = F.interpret(profile(4.2));
  assert.deepEqual(high.anchors, []);
  assert.equal(high.attention, null);

  const low = F.interpret(profile(1.8));
  assert.equal(low.broad, true);
  assert.equal(low.confidence, "Broad Invitation");
});

test("clear strength and weakness are recognised", () => {
  const weak = profile(3.6);
  weak.data.Sabbath = { core: 1.5, impact: 1.5, nCore: 4, nImpact: 4 };
  assert.equal(F.interpret(weak).attention, "Sabbath");

  const strong = profile(3.1);
  strong.data.Scripture = { core: 4.7, impact: 4.7, nCore: 4, nImpact: 4 };
  assert.deepEqual(F.interpret(strong).anchors, ["Scripture"]);
});

test("deep mode preserves Make Room and Deepen patterns", () => {
  const makeRoom = profile(3.4, "deep");
  makeRoom.data.Solitude = { core: 2.1, impact: 4.2, nCore: 4, nImpact: 4 };
  assert.equal(F.interpret(makeRoom).rows.Solitude.pattern, "Make Room");

  const deepen = profile(3.4, "deep");
  deepen.data.Prayer = { core: 4.2, impact: 2.1, nCore: 4, nImpact: 4 };
  assert.equal(F.interpret(deepen).rows.Prayer.pattern, "Deepen");
});

test("a close Anchor tie is withheld instead of using domain order", () => {
  const tied = profile(3.2);
  tied.data.Prayer = { core: 4.55, impact: 4.55, nCore: 4, nImpact: 4 };
  tied.data.Scripture = { core: 4.53, impact: 4.53, nCore: 4, nImpact: 4 };
  tied.data.Community = { core: 4.52, impact: 4.52, nCore: 4, nImpact: 4 };
  const result = F.interpret(tied);
  assert.deepEqual(result.anchors, []);
  assert.equal(result.diagnostic.anchorTieWithheld, true);
});

test("context cannot manufacture a weak domain", () => {
  const input = profile(3.6);
  input.barriers = ["busyness", "digital", "tiredness"];
  assert.equal(F.interpret(input).attention, null);
});
