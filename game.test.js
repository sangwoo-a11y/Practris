import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyBoard,shapes,shuffledBag,collides,clearRows,validBoard} from './game.js';
test('7-bag contains each piece once',()=>{assert.deepEqual(shuffledBag().sort(),Object.keys(shapes).sort())});
test('collisions respect walls, floor and placed blocks',()=>{const b=emptyBoard(),p={m:shapes.O,x:4,y:18};assert.equal(collides(b,p),false);assert.equal(collides(b,{...p,x:-1}),true);assert.equal(collides(b,{...p,y:19}),true);b[18][4]='T';assert.equal(collides(b,p),true)});
test('clearing four rows leaves a clean independent board',()=>{const b=emptyBoard();for(let y=16;y<20;y++)b[y].fill('I');const r=clearRows(b);assert.equal(r.cleared,4);assert.equal(r.board.length,20);assert.ok(r.board.every(row=>row.every(v=>v===null)));r.board[0][0]='T';assert.equal(r.board[1][0],null)});
test('saved boards reject malformed rows and unknown pieces',()=>{assert.ok(validBoard(emptyBoard()));assert.equal(validBoard([]),false);const b=emptyBoard();b[0][0]='invalid';assert.equal(validBoard(b),false)});

import {rotateMatrix,trimMatrix,stampShape,samePlacement,rotatedPiece,isTSpin} from './game.js';
import {makeLesson} from './lessons.js';
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
  for(const mode of ['stack63','perfect','t-design'])for(let round=0;round<6;round++){
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
    if(mode!=='t-design')assert.ok(board.every(r=>r.every(v=>v===null)));
  }
});
test('T-spin insertion generates six distinct solvable boards and requires a real spin',()=>{
  const variants=new Set();
  for(let round=0;round<6;round++){
    const lesson=makeLesson('t-insert',round),step=lesson.steps[0];
    assert.equal(lesson.steps.length,1);variants.add(JSON.stringify(lesson.board));
    const p=solveSpin(lesson.board,step.target);assert.ok(p,`spin round ${round}`);assert.ok(isTSpin(lesson.board,p));
    assert.equal(clearRows(stampShape(lesson.board,p)).cleared,2);
    assert.equal(isTSpin(lesson.board,{...p,lastRotation:false}),false);
  }
  assert.equal(variants.size,6);
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
