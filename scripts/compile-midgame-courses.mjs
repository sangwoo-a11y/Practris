// Build midgame drills from verified cavities; no opener is relabeled as an empty-board midgame.
import fs from 'node:fs';
import {courseVariants} from '../course-variants.js';
import {rightComboExamples} from '../right-combos.js';
import {emptyBoard,stampShape,clearRows,samePlacement,collides,rotatedPiece,occupiedCells,classifyTSpin} from '../game.js';
import {enumeratePlacements,spawnPiece} from '../placements.js';
function reach(board,step){
  if(!step.spin)return enumeratePlacements(board,spawnPiece(step.target.type)).find(o=>samePlacement(o.p,step.target));
  const states=[{p:spawnPiece('T'),moves:[]}],seen=new Set();
  for(let i=0;i<states.length;i++){const {p,moves}=states[i],key=[p.x,p.y,p.rot,p.lastRotation,p.kickIndex===4].join(',');if(seen.has(key))continue;seen.add(key);
    if(samePlacement(p,step.target)&&collides(board,{...p,y:p.y+1})){const r=clearRows(stampShape(board,p));if(classifyTSpin(board,p,r.cleared)===step.spin)return {p,moves};}
    for(const [action,dx,dy]of[['left',-1,0],['right',1,0],['down',0,1]]){const n={...p,x:p.x+dx,y:p.y+dy,lastRotation:false};if(!collides(board,n)&&n.y>=-4)states.push({p:n,moves:[...moves,action]});}
    for(const [action,turns]of[['cw',1],['ccw',-1],['flip',2]]){const n=rotatedPiece(board,p,turns);if(n&&n.y>=-4)states.push({p:n,moves:[...moves,action]});}
  }return null;
}
function compile(board,steps){let b=board;const out=[];for(const step of steps){const path=reach(b,step);if(!path)return null;const r=clearRows(stampShape(b,path.p));if(r.cleared!==step.clear)return null;out.push({...step,moves:path.moves});b=r.board;}return out;}
function boardAfter(steps){let b=emptyBoard();for(const s of steps)b=clearRows(stampShape(b,s.target)).board;return b;}
function raised(board,steps,raise){for(let hole=0;hole<10;hole++){const b=board.slice(raise).concat(Array.from({length:raise},()=>Array.from({length:10},(_,x)=>x===hole?null:'J'))),shifted=steps.map(s=>({...s,target:{...s.target,y:s.target.y-raise},phase:'중반 · 지붕과 진입로 설계'})),compiled=compile(b,shifted);if(compiled)return {board:b,steps:compiled};}throw Error('No raised drill');}
const data={mid_tsd:[],mid_tst:[],mid_skim:[],right3:[]};
for(const v of courseVariants.tki.filter(v=>v.id.endsWith('-0'))){
 const board=boardAfter(v.steps.slice(0,4)),steps=v.steps.slice(4);
 for(const h of [2,3])data.mid_tsd.push({id:`${v.id}-h${h}`,name:`${v.kind} 홈 · ${v.mirrored?'오른쪽':'왼쪽'} · 높이 ${h}`,kind:'TSD 홈 설계',mirrored:v.mirrored,...raised(board,steps,h)});
 const x=steps[0].target.x,initial=board.slice(2).concat(Array.from({length:2},()=>Array.from({length:10},(_,c)=>c===x||c===x+1?null:'J')));
 const skim=[{target:{type:'O',m:[[1,1],[1,1]],x,y:18},clear:2,phase:'중반 · 2줄 스키밍'},...steps.map(s=>({...s,phase:'스키밍 이후 · TSD 설계'}))],compiled=compile(initial,skim);
 if(compiled)data.mid_skim.push({id:v.id,name:`${v.kind} · ${v.mirrored?'오른쪽':'왼쪽'} 홈`,kind:'스키밍 → TSD',mirrored:v.mirrored,bagOffset:6,board:initial,steps:compiled});
}
for(const v of courseVariants.albatross.filter(v=>v.id.endsWith('-0'))){const b=boardAfter(v.steps.slice(0,9));for(const h of [2,3])data.mid_tst.push({id:`${v.id}-h${h}`,name:`${v.mirrored?'반전':'기본'} 진입로 · 높이 ${h}`,kind:'TST 지붕 설계',mirrored:v.mirrored,...raised(b,v.steps.slice(9),h)});}
const types={J:'L',L:'J',S:'Z',Z:'S',T:'T',I:'I',O:'O'};
for(const [index,example]of rightComboExamples.entries())for(const flip of [false,true]){
 let b=emptyBoard();for(let y=16;y<20;y++)for(let x=0;x<6;x++)b[y][x]='J';
 const targets=example.targets.map(p=>flip?{...p,type:types[p.type],x:17-p.x-p.m[0].length,m:p.m.map(r=>[...r].reverse())}:p);
 const steps=[...targets.map(target=>({target,clear:0,phase:'오른쪽 3열 · 조합 완성'})),{target:{type:'I',m:[[1],[1],[1],[1]],x:6,y:16},clear:4,phase:'7열 우물 · 4줄 클리어'}],compiled=compile(b,steps);if(!compiled)throw Error('Right3 unreachable');
 data.right3.push({id:`${index}-${flip?'r':'l'}`,name:targets.map(p=>p.type).join(' → ')+' · '+(flip?'반전':'기본'),kind:'3열 조합',mirrored:flip,board:b,steps:compiled});
}
fs.writeFileSync(new URL('../midgame-data.js',import.meta.url),'// Verified midgame boards and reachable design steps.\nexport const midgameData='+JSON.stringify(data)+';\n');console.log(Object.fromEntries(Object.entries(data).map(([k,v])=>[k,v.length])));
