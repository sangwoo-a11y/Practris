import test from 'node:test';
import assert from 'node:assert/strict';
import {makeCourse} from './courses.js';
import {designBagCourse,planBagCourse,routeToTarget} from './course-planner.js';
import {clearRows,stampShape,shapes} from './game.js';
function replay(course){
  let board=structuredClone(course.board),current=course.queue[0],cursor=1,held=null,uses=0;
  for(const step of course.steps){
    if(step.useHold){uses++;if(held)[held,current]=[current,held];else{held=current;current=course.queue[cursor++];}}
    assert.equal(current,step.target.type,'actual current/hold must provide the target, without duplicating a piece');
    const path=routeToTarget(board,step);assert.ok(path);const result=clearRows(stampShape(board,path.p));assert.equal(result.cleared,step.clear);board=result.board;
    current=course.queue[cursor++];
  }
  const full=course.bagOffset===6?['I','J','L','S','Z','T',...course.queue]:course.queue;
  for(let i=0;i<full.length;i+=7)assert.deepEqual(full.slice(i,i+7).sort(),Object.keys(shapes).sort());
  return {board,held,uses};
}
for(const id of ['tki','dt','pco','mid_tsd','mid_tst','mid_skim','right3'])test(`${id}: bag planning respects real queue, hold, dependencies and SRS`,()=>{
  const course=designBagCourse(makeCourse(id),{seed:42,round:2});assert.equal(course.bagPractice,true);replay(course);
});
test('bag practice samples many draw orders and hold choices, rather than cycling two scripts',()=>{
  const draws=new Set(),orders=new Set();let holds=0;
  for(let round=0;round<16;round++){
    const course=designBagCourse(makeCourse('tki'),{seed:73,round});draws.add(course.queue.slice(0,7).join(''));orders.add(course.steps.map(s=>s.target.type).join(''));holds+=replay(course).uses;
  }
  assert.ok(draws.size>=12);assert.ok(orders.size>=6);assert.ok(holds>8);
});
test('remaining goals can be replanned with an occupied hold after a different valid placement',()=>{
  const base=makeCourse('right3'),first=base.steps[0],board=clearRows(stampShape(base.board,first.target)).board;
  const tail=planBagCourse({...base,board,steps:base.steps.slice(1)},['I','L','S','Z','J','T','O'],{initialHold:'O'});
  assert.ok(tail);assert.equal(tail.steps[0].target.type,'O');assert.equal(tail.steps[0].useHold,true);
});
