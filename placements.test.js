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
