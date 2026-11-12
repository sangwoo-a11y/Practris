import test from 'node:test';
import assert from 'node:assert/strict';
import {perfectMethods,makePerfectPractice} from './perfect-methods.js';
import {perfectMethodData} from './perfect-method-data.js';
import {makeLesson} from './lessons.js';
import {emptyBoard,shapes,stampShape,clearRows} from './game.js';
import {routeToTarget,designBagCourse} from './course-planner.js';
import {makeCourse} from './courses.js';
import {exampleState} from './guides.js';
for(const [method,info] of Object.entries(perfectMethods))for(let round=0;round<perfectMethodData[method].length;round++)for(const stage of ['build','finish'])test(`${method} ${round} ${stage}: legal bags, reachable moves and actual four-line PC`,()=>{
  const lesson=makeLesson('perfect',round,{method,stage,seed:0});assert.equal(lesson.methodId,method);assert.equal(lesson.methodStage,stage);assert.equal(lesson.variantId,perfectMethodData[method][round].id);
  const expectedSkip=stage==='finish'?info.setupCount:0;assert.equal(lesson.bagOffset,expectedSkip);assert.equal(lesson.steps.length,10-expectedSkip);
  if(stage==='build')assert.deepEqual(lesson.board,emptyBoard());else assert.equal(lesson.board.flat().filter(Boolean).length,4*expectedSkip);
  const full=makeLesson('perfect',round,{method,stage:'build',seed:0});assert.deepEqual(lesson.queue,full.queue.slice(expectedSkip));
  for(let i=0;i<full.queue.length;i+=7)assert.deepEqual(full.queue.slice(i,i+7).sort(),Object.keys(shapes).sort());
  let board=structuredClone(lesson.board),lines=0;for(const [i,step] of lesson.steps.entries()){
    assert.equal(lesson.queue[i],step.target.type);const path=routeToTarget(board,step);assert.ok(path);const r=clearRows(stampShape(board,path.p));assert.equal(r.cleared,step.clear);lines+=r.cleared;board=r.board;
  }
  assert.equal(lines,4);assert.ok(board.flat().every(v=>!v));assert.deepEqual(exampleState(lesson,0).board,lesson.board);assert.deepEqual(exampleState(lesson,lesson.steps.length).board,emptyBoard());
});
test('free PC practice stays independent of the selected-method data',()=>{
  assert.deepEqual(makeLesson('perfect',0,{seed:42}),makeLesson('perfect',0,{seed:42,method:'free'}));assert.equal(makeLesson('perfect',0,{seed:42,method:'missing'}).methodId,undefined);assert.throws(()=>makePerfectPractice('missing'),/Unknown/);
});
for(const [id,info] of Object.entries(perfectMethods))test(`${id}: full learning course supports bag/hold design as well`,()=>{
  const planned=designBagCourse(makeCourse(info.courseId),{seed:42});let current=planned.queue[0],index=1,hold=null,board=planned.board;
  for(const step of planned.steps){if(step.useHold){if(hold)[current,hold]=[hold,current];else{hold=current;current=planned.queue[index++];}}assert.equal(current,step.target.type);const path=routeToTarget(board,step);assert.ok(path);board=clearRows(stampShape(board,path.p)).board;current=planned.queue[index++];}
  assert.ok(board.flat().every(v=>!v));
});
