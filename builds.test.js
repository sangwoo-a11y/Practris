import test from 'node:test';
import assert from 'node:assert/strict';
import {buildLibrary,getBuild,buildHTML} from './builds.js';
test('famous builds have distinct explanations and canonical attack order',()=>{
  assert.equal(new Set(buildLibrary.map(b=>b.id)).size,5);
  assert.deepEqual(getBuild('dt').flow.filter(s=>s.kind!=='setup').map(s=>s.kind),['double','triple']);
  assert.deepEqual(getBuild('cspin').flow.filter(s=>s.kind!=='setup').map(s=>s.kind),['triple','double']);
  assert.deepEqual(getBuild('albatross').flow.map(s=>s.kind),['double','triple','triple']);
  for(const b of buildLibrary){assert.ok(b.idea&&b.when&&b.watch);assert.ok(b.source.startsWith('https://harddrop.com/wiki/'));for(let i=0;i<b.flow.length;i++)assert.match(buildHTML(b.id,i),new RegExp(`STEP ${i+1}`));}
});
