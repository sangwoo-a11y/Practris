import test from 'node:test';
import assert from 'node:assert/strict';
import {makeCourse,courseInfo,courseInstruction,listCourseVariants} from './courses.js';
import {emptyBoard,shapes,samePlacement,stampShape,clearRows,rotatedPiece,collides,classifyTSpin} from './game.js';
import {enumeratePlacements,spawnPiece} from './placements.js';
for(const id of Object.keys(courseInfo))for(const variant of listCourseVariants(id))test(`${id} ${variant.name}: reachable 7-bag placements and real attacks`,()=>{
  const course=makeCourse(id,variant.id);let board=emptyBoard();const attacks=[];
  assert.deepEqual(course.board,board);
  for(let i=0;i<course.queue.length;i+=7)assert.deepEqual([...course.queue.slice(i,i+7)].sort(),Object.keys(shapes).sort());
  for(const [i,step] of course.steps.entries()){
    assert.equal(course.queue[i],step.target.type);assert.ok(courseInstruction(course,i).why);
    let p=spawnPiece(step.target.type);
    if(step.moves)for(const move of step.moves){
      if(['cw','ccw','flip'].includes(move))p=rotatedPiece(board,p,{cw:1,ccw:-1,flip:2}[move]);
      else p={...p,x:p.x+({left:-1,right:1}[move]||0),y:p.y+(move==='down'?1:0),lastRotation:false};
      assert.ok(p);assert.equal(collides(board,p),false);
    }
    else p=enumeratePlacements(board,p).find(option=>samePlacement(option.p,step.target))?.p;
    assert.ok(p,`${id} step ${i+1} reachable`);assert.ok(samePlacement(p,step.target));assert.ok(collides(board,{...p,y:p.y+1}));
    const result=clearRows(stampShape(board,p));assert.equal(result.cleared,step.clear);
    if(step.spin){assert.equal(classifyTSpin(board,p,result.cleared),step.spin);attacks.push(step.spin);}
    board=result.board;
  }
  if(id==='dt'||id==='albatross')assert.deepEqual(attacks,['double','triple']);
  if(id==='tki')assert.deepEqual(attacks,['double']);
  if(id==='pco')assert.ok(board.flat().every(v=>!v));
  if(id==='cspin'){assert.equal(course.steps.length,7);assert.equal(board.flat().filter(Boolean).length,28);assert.match(course.scope,/토대/);}
});

test('variants expose different geometries, PC finishes and legal bag orders',()=>{
  let total=0;
  for(const id of Object.keys(courseInfo)){
    const variants=listCourseVariants(id);total+=variants.length;
    assert.ok(variants.length>=4);assert.ok(variants.some(v=>v.mirrored));assert.ok(variants.some(v=>!v.mirrored));
    const courses=variants.map(v=>makeCourse(id,v.id));
    assert.ok(new Set(courses.map(c=>c.steps.map(s=>s.target.type).join(''))).size>=2);
    assert.ok(courseInfo[id].description&&courseInfo[id].benefit);
    assert.equal(new Set(courses.map(c=>JSON.stringify(c.steps.map(s=>s.target)))).size,variants.length);
  }
  assert.equal(total,32);assert.equal(new Set(listCourseVariants('tki').map(v=>v.kind)).size,3);assert.equal(new Set(listCourseVariants('pco').map(v=>v.kind)).size,2);
});
