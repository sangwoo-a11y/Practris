import test from 'node:test';
import assert from 'node:assert/strict';
import {shapes,emptyBoard,collides,rotatedPiece,stampShape,clearRows,occupiedCells} from './game.js';
import {spawnPiece,enumeratePlacements,placementKey,analyzePlacements} from './placements.js';
import {catalog} from './lesson-data.js';
function replay(board,start,moves){let p=structuredClone(start);for(const move of moves){if(['cw','ccw','flip'].includes(move)){p=rotatedPiece(board,p,{cw:1,ccw:-1,flip:2}[move]);assert.ok(p);}else{const [dx,dy]={left:[-1,0],right:[1,0],down:[0,1]}[move];p={...p,x:p.x+dx,y:p.y+dy};assert.equal(collides(board,p),false);}}return p;}
test('distinct empty-board placements deduplicate rotations of symmetric shapes',()=>{
  const board=emptyBoard();for(const [type,count] of [['O',9],['I',17],['T',34]]){
    const result=enumeratePlacements(board,spawnPiece(type));assert.equal(result.length,count);assert.equal(new Set(result.map(option=>placementKey(option.p))).size,count);
  }
});
test('live analysis accepts off-example boards, preserves input, and reports reachable two-ply counts',()=>{
  const board=stampShape(emptyBoard(),{type:'O',m:shapes.O,x:0,y:18}),snapshot={board,current:spawnPiece('T'),queue:['I','J','L','O'],hold:null};const before=JSON.stringify(snapshot),result=analyzePlacements(snapshot);
  assert.ok(result.counts.current>1);assert.ok(result.counts.hold>1);assert.equal(JSON.stringify(snapshot),before);
  for(const option of result.options){
    const start=option.source==='hold'?spawnPiece('I'):snapshot.current,p=replay(board,start,option.moves);
    assert.equal(placementKey(p),placementKey(option.p));assert.ok(collides(board,{...p,y:p.y+1}));assert.equal(occupiedCells(p).length,4);
    assert.deepEqual(option.after,clearRows(stampShape(board,p)).board);
    assert.equal(option.nextType,option.source==='hold'?'J':'I');
    assert.equal(option.nextCount,enumeratePlacements(option.after,spawnPiece(option.nextType)).length);
  }
});
test('occupied hold does not consume NEXT and a disabled hold is excluded',()=>{
  const snapshot={board:emptyBoard(),current:spawnPiece('S'),hold:'L',queue:['Z','T'],canHold:true};
  const result=analyzePlacements(snapshot);assert.ok(result.options.filter(o=>o.source==='hold').every(o=>o.type==='L'&&o.nextType==='Z'));
  assert.equal(analyzePlacements({...snapshot,canHold:false}).counts.hold,undefined);
});
test('a finishing PC is distinguished from a legal move and ends the preview branch',()=>{
  const board=emptyBoard();for(let y=18;y<20;y++)for(let x=0;x<10;x++)if(x!==4&&x!==5)board[y][x]='J';
  const result=analyzePlacements({board,current:spawnPiece('O'),queue:['I'],canHold:false});const pc=result.options.find(o=>o.perfect);
  assert.ok(pc);assert.equal(pc.cleared,2);assert.ok(pc.after.every(r=>r.every(v=>v===null)));assert.equal(pc.nextCount,0);assert.equal(pc.nextType,null);
});
test('enumeration includes an SRS triple tuck, not only vertical hard drops',()=>{
  const source=catalog.insertions.triple[0],board=source.rows.map(row=>[...row].map(c=>c==='X'?'J':null));
  const result=enumeratePlacements(board,spawnPiece('T'));const option=result.find(o=>clearRows(stampShape(board,o.p)).cleared===3);
  assert.ok(option);assert.ok(option.moves.some(move=>['cw','ccw','flip'].includes(move)));replay(board,spawnPiece('T'),option.moves);
});

import {recommendPlacements,boardQuality} from './placements.js';
test('recommendation prioritizes a proven PC and every recorded step clears the real board',()=>{
  const board=emptyBoard();for(let y=18;y<20;y++)for(let x=0;x<10;x++)if(x!==4&&x!==5)board[y][x]='J';
  const snapshot={board,current:spawnPiece('I'),hold:'O',queue:['T','J','L','S','Z'],canHold:true};
  const result=recommendPlacements(snapshot,analyzePlacements(snapshot),{maxNodes:60,timeMs:100});
  assert.equal(result.recommendation.reason,'pc');const option=result.options[0];assert.equal(option.id,result.recommendation.id);assert.equal(option.source,'hold');
  let currentBoard=board;
  for(const step of option.solution){assert.ok(enumeratePlacements(currentBoard,spawnPiece(step.p.type)).some(o=>placementKey(o.p)===placementKey(step.p)));const placed=clearRows(stampShape(currentBoard,step.p));assert.deepEqual(placed.board,step.after);currentBoard=step.after;}
  assert.ok(currentBoard.flat().every(v=>!v));
});
test('off-plan positions are reranked from the actual board without claiming an unproved PC',()=>{
  const left=stampShape(emptyBoard(),{type:'O',m:shapes.O,x:0,y:18}),right=stampShape(emptyBoard(),{type:'O',m:shapes.O,x:8,y:18});
  const solve=board=>recommendPlacements({board,current:spawnPiece('T'),queue:['I'],canHold:false},analyzePlacements({board,current:spawnPiece('T'),queue:['I'],canHold:false}),{maxNodes:0});
  const a=solve(left),b=solve(right);for(const result of [a,b]){assert.equal(result.recommendation.reason,'heuristic');assert.ok(!result.options[0].solution);assert.equal(result.search.limited,true);for(const option of result.options)assert.deepEqual(option.quality,boardQuality(option.after));}
  assert.notEqual(placementKey(a.options[0].p),placementKey(b.options[0].p));
});

import {makeCourse} from './courses.js';
test('a three-move PC proof includes reachable tucks and conserves queue/hold',()=>{
  const course=makeCourse('pco');let board=emptyBoard();for(const step of course.steps.slice(0,7))board=clearRows(stampShape(board,step.target)).board;
  const snapshot={board,current:spawnPiece(course.queue[7]),queue:course.queue.slice(8,13),hold:null,canHold:true};
  const result=recommendPlacements(snapshot,analyzePlacements(snapshot),{maxNodes:10000,timeMs:2000});
  assert.equal(result.recommendation.reason,'pc');assert.equal(result.recommendation.steps,3);
  let current=snapshot.current.type,queue=[...snapshot.queue],hold=null;
  for(const step of result.options[0].solution){
    if(step.useHold){if(hold)[current,hold]=[hold,current];else{hold=current;current=queue.shift();}}
    assert.equal(step.p.type,current);
    assert.ok(enumeratePlacements(board,spawnPiece(current)).some(o=>placementKey(o.p)===placementKey(step.p)));
    const placed=clearRows(stampShape(board,step.p));assert.deepEqual(placed.board,step.after);board=placed.board;current=queue.shift();
  }
  assert.ok(board.flat().every(v=>!v));
});

import {stackQuality,recommendStackPlacements} from './placements.js';
test('6–3 ranks live off-plan placements, keeps column 7 clear, and explains its metrics',()=>{
  const board=stampShape(emptyBoard(),{type:'O',m:shapes.O,x:1,y:18}),snapshot={board,current:spawnPiece('T'),hold:'L',queue:['I','J','S','Z','O'],canHold:true},original=JSON.stringify(snapshot);
  const result=recommendStackPlacements(snapshot,analyzePlacements(snapshot));const best=result.options[0];
  assert.equal(JSON.stringify(snapshot),original);assert.equal(result.recommendation.id,best.id);assert.equal(result.recommendation.reason,'stack');assert.equal(best.stackQuality.wellBlocks,0);assert.equal(best.stackQuality.holes,0);
  assert.ok(result.options.some(o=>o.stackQuality.wellBlocks>0));assert.ok(best.followUp);
  assert.equal(result.search.depth,2);for(const option of result.options){assert.deepEqual(option.stackQuality,stackQuality(option.after));assert.ok(Number.isFinite(option.score));}
});
test('6–3 prefers a real four-line clear through column 7 and re-evaluates blocked wells',()=>{
  const board=emptyBoard();for(let y=16;y<20;y++)for(let x=0;x<10;x++)if(x!==6)board[y][x]='J';
  const snapshot={board,current:spawnPiece('I'),queue:['T','S'],canHold:false};
  const result=recommendStackPlacements(snapshot,analyzePlacements({...snapshot,continueAfterPerfect:true}));assert.ok(result.options[0].nextCount>0);assert.equal(result.recommendation.reason,'tetris');assert.equal(result.options[0].cleared,4);assert.equal(result.options[0].stackQuality.wellBlocks,0);
  const bad=stampShape(emptyBoard(),{type:'O',m:shapes.O,x:6,y:18});assert.equal(stackQuality(bad).wellBlocks,2);
  const changed=recommendStackPlacements({...snapshot,board:bad},analyzePlacements({...snapshot,board:bad}));assert.equal(changed.recommendation.reason,'stack');assert.notDeepEqual(changed.options[0].after,result.options[0].after);
});
