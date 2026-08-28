const test = require('node:test');
const assert = require('node:assert/strict');

global.window = {};
require('../formation-schema-v4.js');
require('../engine.js');
require('../questions-v4.js');
require('../adaptive-long.js');

const F = window.FormationEngine;
const Q = window.FormationQuestionsV4;
const M = window.FormationQuestionMetaV4;
const A = window.FormationAdaptiveLong;

function profile(value, mode = 'quick') {
  return {
    data: Object.fromEntries(F.D.map(domain => [domain,{ core:value, impact:value, nCore:2, nImpact:2 }])),
    mode, barriers:[], connections:[], constraints:[],
  };
}

test('V4.1 question bank contains 56 quick and 112 deep items with explicit facets', () => {
  assert.equal(F.D.length, 14);
  assert.equal(F.D.reduce((n,d)=>n+Q[d].slice(0,4).length,0),56);
  assert.equal(F.D.reduce((n,d)=>n+Q[d].length,0),112);
  F.D.forEach(d=>assert.equal(Q[d].length,8));
  assert.deepEqual(M.facetByIndex,['Practice','Posture','Integration','Fruit','Practice','Posture','Integration','Fruit']);
  F.D.forEach(d=>{
    assert.equal(M.fruitDimensionByDomain[d][3] != null,true);
    assert.equal(M.fruitDimensionByDomain[d][7] != null,true);
  });
});

test('adaptive Deeper Discernment begins at 84 and preserves 112 ceiling',()=>{
  assert.equal(A.initialItems().length,84);
  assert.equal(A.config.minimumQuestions,84);
  assert.equal(A.config.maximumQuestions,112);
  assert.match(A.config.version,/facet-aligned/);
});

test('uniform profiles do not manufacture differentiation', () => {
  const high=F.interpret(profile(4.2));
  assert.deepEqual(high.anchors,[]);
  assert.equal(high.attention,null);
  const low=F.interpret(profile(1.8));
  assert.equal(low.broad,true);
});

test('clear strength and weakness are recognised',()=>{
  const weak=profile(3.6);weak.data.Sabbath={core:1.5,impact:1.5,nCore:2,nImpact:2};assert.equal(F.interpret(weak).attention,'Sabbath');
  const strong=profile(3.1);strong.data.Scripture={core:4.7,impact:4.7,nCore:2,nImpact:2};assert.deepEqual(F.interpret(strong).anchors,['Scripture']);
});

test('deep mode distinguishes making room from deepening',()=>{
  const makeRoom=profile(3.4,'deep');makeRoom.data.Solitude={core:2.1,impact:4.2,nCore:4,nImpact:4};assert.equal(F.interpret(makeRoom).rows.Solitude.pattern,'Make Room');
  const deepen=profile(3.4,'deep');deepen.data.Prayer={core:4.2,impact:2.1,nCore:4,nImpact:4};assert.equal(F.interpret(deepen).rows.Prayer.pattern,'Deepen');
});

test('context and constraints cannot manufacture a weak domain',()=>{
  const input=profile(3.6);input.barriers=['busyness','digital','tiredness'];input.constraints=['time_constraint','care_constraint'];assert.equal(F.interpret(input).attention,null);
});
