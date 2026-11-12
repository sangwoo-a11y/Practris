// Factual PCO/MKO geometry from public opener diagrams; independent Practris solver.
// Sources and method scope: docs/perfect-methods.md.
import fs from 'node:fs';
import {emptyBoard,shapes,rotateMatrix,trimMatrix,samePlacement,stampShape,clearRows,occupiedCells,bagQueue} from '../game.js';
import {enumeratePlacements,spawnPiece} from '../placements.js';
const definitions={
 pco_hold_i:{name:'PCO · I 보류',rows:['lll.....ss','loo....sst','joo...zztt','jjj....zzt'],held:'I'},
 pco_standard:{name:'PCO · 기본형',rows:['IJJJ....SS','IOOJ...SST','IOOL..ZZTT','ILLL...ZZT']},
 mko_hold_t:{name:'MKO · T 보류 PC',rows:['s.....z..i','ss...zz..i','js...zlooi','jjj.lllooi'],held:'T'},
};
function parse(rows){const cells=new Map();rows.forEach((r,y)=>[...r].forEach((c,x)=>{const type=c.toUpperCase();if(shapes[type]){if(!cells.has(type))cells.set(type,[]);cells.get(type).push([x,20-rows.length+y]);}}));return [...cells].map(([type,coords])=>{const x=Math.min(...coords.map(c=>c[0])),y=Math.min(...coords.map(c=>c[1]));for(let turns=0;turns<4;turns++){const m=trimMatrix(rotateMatrix(shapes[type],turns)),p={type,m,x,y};if(JSON.stringify(occupiedCells(p).sort())===JSON.stringify(coords.sort()))return p;}throw Error('Bad diagram');});}
function order(board,left){if(!left.length)return [];for(let i=0;i<left.length;i++){const target=left[i],path=enumeratePlacements(board,spawnPiece(target.type)).find(o=>samePlacement(o.p,target));if(!path)continue;const r=clearRows(stampShape(board,path.p));if(r.cleared)continue;const tail=order(r.board,left.filter((_,j)=>j!==i));if(tail)return [{target,clear:0,moves:path.moves,phase:'첫 bag · PC 공간 설계'},...tail];}return null;}
function finish(board,first){const count=first?4:3,memo=new Set();let nodes=0;
 function solve(b,left,used,rows){if(!left)return b.flat().every(v=>!v)?[]:null;if(++nodes>18000)return null;const key=b.map(r=>r.map(v=>v?1:0).join('')).join('')+left+[...used].sort().join('');if(memo.has(key))return null;memo.add(key);
  const types=left===4?[first]:Object.keys(shapes).filter(t=>!used.has(t));
  for(const type of types)for(const {p,moves} of enumeratePlacements(b,spawnPiece(type))){const r=clearRows(stampShape(b,p));if(r.board.slice(0,20-(rows-r.cleared)).some(row=>row.some(Boolean)))continue;const tail=solve(r.board,left-1,left===4?new Set():new Set([...used,type]),rows-r.cleared);if(tail)return [{target:p,clear:r.cleared,moves,perfect:tail.length===0,phase:'남은 공간 · PC 마무리'},...tail];}return null;
 }return solve(board,count,new Set(),4);
}
const mirrorTypes={I:'I',O:'O',T:'T',J:'L',L:'J',S:'Z',Z:'S'};
function mirror(steps){return steps.map(s=>({...s,target:{...s.target,type:mirrorTypes[s.target.type],x:10-s.target.x-s.target.m[0].length,m:s.target.m.map(row=>[...row].reverse())},moves:undefined}));}
function compile(steps){let b=emptyBoard();const out=[];for(const s of steps){const path=enumeratePlacements(b,spawnPiece(s.target.type)).find(o=>samePlacement(o.p,s.target));if(!path)return null;const r=clearRows(stampShape(b,path.p));if(r.cleared!==s.clear)return null;out.push({...s,moves:path.moves});b=r.board;}if(b.flat().some(Boolean))return null;bagQueue(out.map(s=>s.target.type),()=>.5);return out;}
const result={};for(const [id,def] of Object.entries(definitions)){const setup=order(emptyBoard(),parse(def.rows));if(!setup)throw Error('Setup '+id);let b=emptyBoard();for(const s of setup)b=stampShape(b,s.target);const tail=finish(b,def.held);if(!tail)throw Error('PC '+id);const base=[...setup,...tail],variants=[];
 for(const mirrored of [false,true]){const steps=compile(mirrored?mirror(base):base);if(!steps)throw Error('Mirror '+id);variants.push({id:mirrored?'right':'left',name:mirrored?'좌우 반전':'기본 방향',mirrored,kind:def.name,setupCount:setup.length,steps});
  for(let i=0;i<setup.length-1;i++){const swapped=structuredClone(steps);[swapped[i],swapped[i+1]]=[swapped[i+1],swapped[i]];const candidate=compile(swapped);if(candidate){variants.push({id:mirrored?'right-order':'left-order',name:(mirrored?'좌우 반전':'기본 방향')+' · 다른 순서',mirrored,kind:def.name,setupCount:setup.length,steps:candidate});break;}}
 }
 result[id]=variants;console.log(id,variants.length,base.map(s=>s.target.type).join(''));
}
fs.writeFileSync(new URL('../perfect-method-data.js',import.meta.url),'// Verified four-line PC method diagrams and actual SRS completion paths.\nexport const perfectMethodData='+JSON.stringify(result)+';\n');
