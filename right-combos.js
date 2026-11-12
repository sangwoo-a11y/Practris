import {shapes,rotateMatrix,trimMatrix} from './game.js?v=14';
const rotations=Object.fromEntries(Object.entries(shapes).map(([type,m])=>[type,[...new Map(Array.from({length:4},(_,r)=>{const shape=trimMatrix(rotateMatrix(m,r));return [JSON.stringify(shape),shape];})).values()].filter(m=>m[0].length<=3)]));
export const rightComboExamples=[
  {name:'J → O → L',types:['J','O','L'],targets:[{type:'J',m:[[1,0,0],[1,1,1]],x:7,y:18},{type:'O',m:[[1,1],[1,1]],x:8,y:17},{type:'L',m:[[1,1,1],[1,0,0]],x:7,y:16}]},
  {name:'J → S → L',types:['J','S','L'],targets:[{type:'J',m:[[1,0,0],[1,1,1]],x:7,y:18},{type:'S',m:[[1,0],[1,1],[0,1]],x:7,y:16},{type:'L',m:[[1,1],[0,1],[0,1]],x:8,y:16}]},
  {name:'J → Z → L',types:['J','Z','L'],targets:[{type:'J',m:[[0,1],[0,1],[1,1]],x:8,y:17},{type:'Z',m:[[0,1],[1,1],[1,0]],x:7,y:17},{type:'L',m:[[1,1,1],[1,0,0]],x:7,y:16}]},
];
// Geometric completion of the actual right strip. These are combo candidates;
// using intervening pieces on the left is not a proof of a full-board continuation.
export function rightComboPlan(board,available=[]){
  const strip=board.map(row=>row.slice(7)),first=strip.findIndex(row=>row.some(Boolean)),height=first<0?0:20-first;
  let targetHeight=Math.max(4,Math.ceil(height/4)*4),filled=strip.flat().filter(Boolean).length,missing=3*targetHeight-filled;
  if(missing===0){targetHeight+=4;missing=12;}
  if(targetHeight>20||missing<0||missing>12||missing%4)return {status:'irregular',types:[],placements:[],missing,targetHeight};
  const needed=missing/4,top=20-targetHeight;
  function find(types){
    const counts=Object.fromEntries(Object.keys(shapes).map(t=>[t,types.filter(v=>v===t).length])),memo=new Set();
    function solve(b,left){
      if(left===0)return b.slice(top).every(row=>row.every(Boolean))?[]:null;
      const key=b.slice(top).map(row=>row.map(v=>v?1:0).join('')).join('')+'|'+Object.values(counts).join(',');if(memo.has(key))return null;memo.add(key);
      for(const type of Object.keys(shapes))if(counts[type])for(const m of rotations[type])for(let x=0;x<=3-m[0].length;x++){
        const hit=y=>m.some((row,dy)=>row.some((v,dx)=>v&&(y+dy>=20||(y+dy>=0&&b[y+dy][x+dx]))));if(hit(0))continue;
        let y=0;while(!hit(y+1))y++;if(y<top)continue;
        const next=b.map(row=>[...row]);m.forEach((row,dy)=>row.forEach((v,dx)=>{if(v)next[y+dy][x+dx]=type;}));
        counts[type]--;const tail=solve(next,left-1);counts[type]++;
        if(tail)return [{type,m,x:x+7,y},...tail];
      }
      return null;
    }
    return solve(strip,needed);
  }
  const plan=find(available);if(plan)return {status:'available',types:plan.map(p=>p.type),placements:plan,missing,targetHeight};
  const possible=find(Object.keys(shapes).flatMap(t=>Array(needed).fill(t)));
  return {status:possible?'waiting':'blocked',types:possible?.map(p=>p.type)||[],placements:possible||[],missing,targetHeight};
}
