import test from 'node:test';
import assert from 'node:assert/strict';
import {perfectMethods,makePerfectPractice} from './perfect-methods.js';
import {perfectMethodData} from './perfect-method-data.js';
import {makeLesson,seededRandom} from './lessons.js';
import {emptyBoard,shapes,stampShape,clearRows,randomBags} from './game.js';
import {routeToTarget} from './course-planner.js';
import {courseInfo} from './courses.js';
import {exampleState} from './guides.js';
for(const [method,info] of Object.entries(perfectMethods))for(let round=0;round<perfectMethodData[method].length;round++)for(const stage of ['build','finish'])test(`${method} ${round} ${stage}: random practice stays independent of the verified example`,()=>{
  const lesson=makeLesson('perfect',round,{method,stage,seed:0,bagRandom:seededRandom(91)}),skip=stage==='finish'?info.setupCount:0;
  assert.equal(lesson.methodId,method);assert.equal(lesson.variantId,perfectMethodData[method][round].id);assert.equal(lesson.bagOffset,0);assert.equal(lesson.setupRemaining,stage==='finish'?0:info.setupCount);
  assert.deepEqual(lesson.queue,randomBags(4,seededRandom(91)));
  if(stage==='build')assert.deepEqual(lesson.board,emptyBoard());else assert.equal(lesson.board.flat().filter(Boolean).length,4*skip);
  let board=structuredClone(lesson.board),lines=0;for(const [i,step] of lesson.steps.entries()){
    assert.equal(lesson.exampleQueue[i],step.target.type);const path=routeToTarget(board,step);assert.ok(path);const r=clearRows(stampShape(board,path.p));assert.equal(r.cleared,step.clear);lines+=r.cleared;board=r.board;
  }
  assert.equal(lines,4);assert.deepEqual(board,emptyBoard());assert.deepEqual(exampleState(lesson,0).board,lesson.board);assert.deepEqual(exampleState(lesson,lesson.steps.length).board,emptyBoard());
});
test('free and named methods consume the same random bag source without selecting successful orders',()=>{
  const draws=[];for(const method of ['free',...Object.keys(perfectMethods)]){
    let calls=0;const rng=seededRandom(9),lesson=makeLesson('perfect',0,{method,bagRandom:()=>{calls++;return rng();}});assert.equal(calls,24);draws.push(lesson.queue);}
  for(const queue of draws)assert.deepEqual(queue,draws[0]);
  assert.throws(()=>makePerfectPractice('missing'),/Unknown/);
});
test('continuing after PC preserves the actual remaining bag instead of starting a reference queue',()=>{
  const live=randomBags(4,seededRandom(19)).slice(10),lesson=makeLesson('perfect',2,{method:'pco_hold_i',liveQueue:live,bagRandom:()=>{throw Error('must not redraw');}});
  assert.deepEqual(lesson.queue,live);assert.notEqual(lesson.queue,live);
});
test('perfect methods are available to skills and absent from build learning',()=>{
  assert.equal(Object.values(perfectMethods).length,3);assert.ok(Object.keys(courseInfo).every(id=>id!=='pco'&&!id.startsWith('pc_')&&id!=='right3'));
});
