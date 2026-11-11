import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyBoard,shapes,shuffledBag,collides,clearRows,validBoard} from './game.js';
test('7-bag contains each piece once',()=>{assert.deepEqual(shuffledBag().sort(),Object.keys(shapes).sort())});
test('collisions respect walls, floor and placed blocks',()=>{const b=emptyBoard(),p={m:shapes.O,x:4,y:18};assert.equal(collides(b,p),false);assert.equal(collides(b,{...p,x:-1}),true);assert.equal(collides(b,{...p,y:19}),true);b[18][4]='T';assert.equal(collides(b,p),true)});
test('clearing four rows leaves a clean independent board',()=>{const b=emptyBoard();for(let y=16;y<20;y++)b[y].fill('I');const r=clearRows(b);assert.equal(r.cleared,4);assert.equal(r.board.length,20);assert.ok(r.board.every(row=>row.every(v=>v===null)));r.board[0][0]='T';assert.equal(r.board[1][0],null)});
test('saved boards reject malformed rows and unknown pieces',()=>{assert.ok(validBoard(emptyBoard()));assert.equal(validBoard([]),false);const b=emptyBoard();b[0][0]='invalid';assert.equal(validBoard(b),false)});

import {rotateMatrix,trimMatrix,stampShape,samePlacement,rotatedPiece,isTSpin,classifyTSpin,bagQueue} from './game.js';
import {makeLesson} from './lessons.js';
import {catalog} from './lesson-data.js';
import {defaults,normalizeHandling,HorizontalRepeat,fallInterval,actionKey} from './handling.js';
test('180-degree rotation flips T and reverses after a second 180',()=>{
  const flipped=rotateMatrix(shapes.T,2);
  assert.deepEqual(flipped,[[0,0,0],[1,1,1],[0,1,0]]);
  assert.deepEqual(rotateMatrix(flipped,2),shapes.T);
  assert.deepEqual(rotateMatrix(shapes.T,-1),rotateMatrix(shapes.T,3));
});
test('editor rotates complete shapes and rejects overlaps without modifying board',()=>{
  const b=emptyBoard(),p={type:'I',m:trimMatrix(rotateMatrix(shapes.I)),x:9,y:16};
  const next=stampShape(b,p);assert.equal(next.flat().filter(Boolean).length,4);
  assert.equal(b.flat().filter(Boolean).length,0);assert.equal(stampShape(next,p),null);
  assert.equal(stampShape(b,{...p,x:10}),null);
  assert.ok(samePlacement(p,{type:'I',m:rotateMatrix(shapes.I),x:7,y:16}));
});
test('all design courses start empty and every hard-drop stage is reachable',()=>{
  for(const mode of ['stack63','perfect'])for(let round=0;round<6;round++){
    const lesson=makeLesson(mode,round);let board=lesson.board;
    assert.equal(board.flat().filter(Boolean).length,0);
    for(const step of lesson.steps){
      if(step.tspin){const solution=solveSpin(board,step.target);assert.ok(solution);assert.ok(isTSpin(board,solution));}
      else{
        let reachable=false;
        for(let turns=0;turns<4;turns++)for(let x=-2;x<10;x++){
          let p={type:step.target.type,m:rotateMatrix(shapes[step.target.type],turns),x,y:0};
          if(collides(board,p))continue;
          while(!collides(board,{...p,y:p.y+1}))p.y++;
          if(samePlacement(p,step.target))reachable=true;
        }
        assert.ok(reachable,`${mode} ${round} ${step.target.type} is reachable by dropping`);
      }
      const next=stampShape(board,step.target);assert.ok(next);
      const result=clearRows(next);board=result.board;
      assert.equal(result.cleared,step.clear||0);
      if(step.perfect)assert.ok(board.every(r=>r.every(v=>v===null)));
    }
    if(mode!=='tspin')assert.ok(board.every(r=>r.every(v=>v===null)));
  }
});
test('all 48 spin terrains remain solvable after mirror/height/garbage variations',()=>{
  for(const kind of ['single','double','triple']){
    const variants=new Set();
    for(let round=0;round<64;round++){
      const lesson=makeLesson('tspin',round,{kind,seed:723}),step=lesson.steps[0];variants.add(JSON.stringify(lesson.board));
      const p=solveSpin(lesson.board,step.target);assert.ok(p,`${kind} ${round} must be reachable`);
      const cleared=clearRows(stampShape(lesson.board,p)).cleared;
      assert.equal(cleared,step.clear);assert.equal(classifyTSpin(lesson.board,p,cleared),kind);
      assert.equal(isTSpin(lesson.board,{...p,lastRotation:false}),false);
    }
    assert.ok(variants.size>=60,`${kind} should not loop a small preset list`);
  }
});
test('every design catalog uses legal 7-bags and each finishing goal actually works',()=>{
  for(const mode of ['perfect','stack63'])for(const entry of catalog[mode]){
    let board=emptyBoard();
    for(let i=0;i<entry.plan.length;i++){
      const p=entry.plan[i],target={...p,m:trimMatrix(rotateMatrix(shapes[p.type],p.turns))};let falling={...target,y:0};
      while(!collides(board,{...falling,y:falling.y+1}))falling.y++;assert.equal(falling.y,target.y);
      const result=clearRows(stampShape(board,target));board=result.board;assert.equal(result.cleared,i===entry.plan.length-1?4:0);
    }
    assert.ok(board.every(row=>row.every(v=>v===null)));
  }
  for(const mode of ['perfect','stack63'])for(const kind of ['single','double','triple'])for(let round=0;round<12;round++){
    const lesson=makeLesson(mode,round,{kind,seed:192});const sequence=lesson.steps.map(s=>s.target.type);
    assert.deepEqual(lesson.queue.slice(0,sequence.length),sequence);
    for(let i=0;i<lesson.queue.length;i+=7)assert.deepEqual([...lesson.queue.slice(i,i+7)].sort(),Object.keys(shapes).sort());
    for(let i=2;i<lesson.queue.length;i++)assert.ok(!(lesson.queue[i]===lesson.queue[i-1]&&lesson.queue[i]===lesson.queue[i-2]));
  }
  assert.throws(()=>bagQueue(['I','I']),/7-bag/);
});
function solveSpin(board,target){
  const queue=[{type:'T',m:shapes.T,x:3,y:0,rot:0,lastRotation:false}],seen=new Set();
  for(let i=0;i<queue.length&&i<10000;i++){
    const p=queue[i],key=[p.x,p.y,p.rot,p.lastRotation].join(',');if(seen.has(key))continue;seen.add(key);
    if(samePlacement(p,target)&&isTSpin(board,p))return p;
    for(const [dx,dy] of [[-1,0],[1,0],[0,1]]){const next={...p,x:p.x+dx,y:p.y+dy,lastRotation:false};if(!collides(board,next))queue.push(next);}
    for(const turn of [-1,1]){const next=rotatedPiece(board,p,turn);if(next)queue.push(next);}
  }
  return null;
}
test('DAS waits and ARR repeats independent of OS key events',()=>{
  const h=new HorizontalRepeat(),s={...defaults,das:100,arr:20};
  assert.equal(h.down(1,0,s),1);assert.equal(h.down(1,20,s),0);
  assert.equal(h.tick(99,s).steps,0);assert.equal(h.tick(100,s).steps,1);
  assert.equal(h.tick(119,s).steps,0);assert.equal(h.tick(140,s).steps,2);
  assert.equal(h.down(-1,150,s),-1);assert.equal(h.tick(249,s).steps,0);
  assert.equal(h.tick(250,s).direction,-1);h.up(-1,260,s);assert.equal(h.tick(360,s).direction,1);
});
test('ARR zero moves to wall after DAS; DCD blocks repeats after rotation/spawn',()=>{
  const h=new HorizontalRepeat(),s={...defaults,das:100,arr:0,dcd:60};h.down(1,0,s);
  assert.equal(h.tick(99,s).steps,0);assert.equal(h.tick(100,s).steps,10);
  h.cut(110,s);assert.equal(h.tick(169,s).steps,0);assert.equal(h.tick(170,s).steps,10);
  h.clear();assert.equal(h.tick(1000,s).steps,0);
});
test('SDF sets gravity multiplier and infinity reaches floor instantly',()=>{
  assert.equal(fallInterval({...defaults,sdf:10},true),90);
  assert.equal(fallInterval({...defaults,sdf:100},true),9);
  assert.equal(fallInterval({...defaults,sdf:'instant'},true),0);
  assert.equal(fallInterval(defaults,false),900);
  assert.deepEqual(normalizeHandling({arr:-5,das:9999,dcd:'bad',sdf:'instant'}),{arr:0,das:500,dcd:0,sdf:'instant'});
});

test('physical key codes survive Korean IME and both shift keys',()=>{
  assert.equal(actionKey({code:'KeyA',key:'ㅁ'}),'a');
  assert.equal(actionKey({code:'KeyT',key:'ㅅ'}),'t');
  assert.equal(actionKey({code:'ShiftLeft',key:'Shift'}),'Shift');
  assert.equal(actionKey({code:'ShiftRight',key:'Shift'}),'Shift');
  assert.equal(actionKey({code:'Space',key:' '}),' ');
});

test('6–3 keeps the seventh-column well open and advances to all seven mino types',()=>{
  for(let round=0;round<3;round++){
    const lesson=makeLesson('stack63',round);let board=lesson.board;
    for(const step of lesson.steps.slice(0,-1)){board=stampShape(board,step.target);assert.ok(board.every(row=>row[6]===null));}
    assert.equal(clearRows(stampShape(board,lesson.steps.at(-1).target)).cleared,4);
  }
  assert.equal(new Set(makeLesson('stack63',1).steps.map(step=>step.target.type)).size,7);
  assert.ok(new Set(makeLesson('perfect',1).steps.map(step=>step.target.type)).size>=3);
});

import {isLesson} from './lessons.js';
import {guides,guideHTML,exampleState,boardDiagram} from './guides.js';
test('only the insertion-based T-spin mode remains',()=>{
  assert.equal(isLesson('tspin'),true);assert.equal(isLesson('t-design'),false);assert.equal(isLesson('t-insert'),false);
  assert.throws(()=>makeLesson('t-design'),/Unknown/);
});
test('guidebook covers skills and the example shows one optional target at a time',()=>{
  for(const topic of ['basics','tspin','stack63','perfect','editor']){assert.ok(guides[topic]);assert.match(guideHTML(topic),/guide-title/);}
  const lesson=makeLesson('perfect',0,{seed:42});
  const first=exampleState(lesson,0);assert.equal(first.board.flat().filter(Boolean).length,0);assert.equal(first.target.type,lesson.steps[0].target.type);
  const last=exampleState(lesson,lesson.steps.length);assert.equal(last.target,null);assert.equal(last.board.flat().filter(Boolean).length,0);
  assert.equal((boardDiagram(first.board,first.target).match(/stroke="#d5ff70"/g)||[]).length,4);
});
