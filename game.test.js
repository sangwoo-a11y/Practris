import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyBoard,shapes,shuffledBag,collides,clearRows,validBoard} from './game.js';
test('7-bag contains each piece once',()=>{assert.deepEqual(shuffledBag().sort(),Object.keys(shapes).sort())});
test('collisions respect walls, floor and placed blocks',()=>{const b=emptyBoard(),p={m:shapes.O,x:4,y:18};assert.equal(collides(b,p),false);assert.equal(collides(b,{...p,x:-1}),true);assert.equal(collides(b,{...p,y:19}),true);b[18][4]='T';assert.equal(collides(b,p),true)});
test('clearing four rows leaves a clean independent board',()=>{const b=emptyBoard();for(let y=16;y<20;y++)b[y].fill('I');const r=clearRows(b);assert.equal(r.cleared,4);assert.equal(r.board.length,20);assert.ok(r.board.every(row=>row.every(v=>v===null)));r.board[0][0]='T';assert.equal(r.board[1][0],null)});
test('saved boards reject malformed rows and unknown pieces',()=>{assert.ok(validBoard(emptyBoard()));assert.equal(validBoard([]),false);const b=emptyBoard();b[0][0]='invalid';assert.equal(validBoard(b),false)});
