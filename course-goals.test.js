import test from 'node:test';
import assert from 'node:assert/strict';
import {courseInfo,makeCourse} from './courses.js';
import {courseGoal,advanceCourseGoal} from './course-goals.js';
import {routeToTarget} from './course-planner.js';
import {clearRows,stampShape,emptyBoard,shapes} from './game.js';
for(const id of Object.keys(courseInfo))test(`${id}: real play goals complete after actual clears, not a hidden placement counter`,()=>{
  const course=makeCourse(id),goal=courseGoal(course);let board=structuredClone(course.board),state={},done=false;
  for(const [i,step] of course.steps.entries()){const path=routeToTarget(board,step);assert.ok(path);const result=clearRows(stampShape(board,path.p)),next=advanceCourseGoal(goal,state,board,path.p,result);state=next.state;done=next.complete;assert.equal(done,i===course.steps.length-1);board=result.board;}
  assert.equal(done,true);
});
test('wrong positions do not accidentally complete a T-spin or PC goal',()=>{
  const before=emptyBoard(),p={type:'O',m:shapes.O,x:3,y:18},result=clearRows(stampShape(before,p));
  for(const id of ['tki','pco','mid_skim','right3'])assert.equal(advanceCourseGoal(courseGoal(makeCourse(id)),{},before,p,result).complete,false);
});
