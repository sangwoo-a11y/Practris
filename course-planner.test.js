import test from 'node:test';
import assert from 'node:assert/strict';
import {makeCourse} from './courses.js';
import {designBagCourse,planBagCourse,routeToTarget,availableCourseStep} from './course-planner.js';
import {clearRows,stampShape,shapes,randomBags} from './game.js';
import {seededRandom} from './lessons.js';
function replay(course){let board=structuredClone(course.board),current=course.queue[0],cursor=1,held=null;
  for(const step of course.steps){if(step.useHold){if(held)[held,current]=[current,held];else{held=current;current=course.queue[cursor++];}}assert.equal(current,step.target.type);const path=routeToTarget(board,step);assert.ok(path);board=clearRows(stampShape(board,path.p)).board;current=course.queue[cursor++];}
}
for(const id of ['tki','dt','cspin','albatross','mid_tsd','mid_tst','mid_skim'])test(`${id}: planner can explain the fixed reference, but practice draws only once`,()=>{
  const reference=makeCourse(id),planned=planBagCourse(reference,reference.queue);assert.ok(planned);replay(planned);
  let calls=0;const rng=seededRandom(73),random=()=>{calls++;return rng();};const practice=designBagCourse(reference,{random});
  assert.deepEqual(practice.queue,randomBags(4,seededRandom(73)));assert.equal(calls,24);assert.equal(practice.bagOffset,0);assert.equal(practice.randomBag,true);
  for(let i=0;i<practice.queue.length;i+=7)assert.deepEqual(practice.queue.slice(i,i+7).sort(),Object.keys(shapes).sort());
});
test('an unsolved bag is kept without retries, fallback swaps or success filtering',()=>{
  let calls=0;const practice=designBagCourse(makeCourse('tki'),{random:()=>{calls++;return .5;}});
  assert.equal(practice.bagPlanned,false);assert.equal(calls,24);assert.deepEqual(practice.queue,randomBags(4,()=>.5));
});
test('live guidance can choose another reachable setup placement without requiring a full future solution',()=>{
  const course=makeCourse('tki'),choice=availableCourseStep(course.board,course.steps,'O',['S','Z'],null);
  assert.ok(choice);assert.equal(choice.step.target.type,'O');assert.equal(choice.useHold,false);
  const held=availableCourseStep(course.board,course.steps,'T',['S','Z'],'I');assert.ok(held);assert.equal(held.step.target.type,'I');assert.equal(held.useHold,true);
});
