import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBags,shapes} from './game.js';
import {seededRandom,makeLesson} from './lessons.js';
import {perfectMethods} from './perfect-methods.js';
test('each random bag contains seven types and consumes exactly six unbiased shuffle draws',()=>{
  let calls=0;const rng=seededRandom(98),queue=randomBags(6,()=>{calls++;return rng();});assert.equal(calls,36);
  for(let i=0;i<queue.length;i+=7)assert.deepEqual(queue.slice(i,i+7).sort(),Object.keys(shapes).sort());
});
test('different attempts vary the actual first piece, independent of the selected PC method',()=>{
  for(const method of ['free',...Object.keys(perfectMethods)]){
    const first=new Set(),bags=new Set();for(let i=1;i<=64;i++){const lesson=makeLesson('perfect',0,{method,seed:42,bagRandom:seededRandom(Math.imul(i,2654435761))});first.add(lesson.queue[0]);bags.add(lesson.queue.slice(0,7).join(''));}
    assert.equal(first.size,7);assert.ok(bags.size>50);
  }
});
