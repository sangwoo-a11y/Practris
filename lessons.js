import {emptyBoard,shapes,rotateMatrix,trimMatrix,stampShape,collides,clearRows,bagQueue} from './game.js?v=6';
import {catalog} from './lesson-data.js?v=6';
export const isLesson=mode=>['stack63','perfect','tspin'].includes(mode);
export function seededRandom(seed){let state=seed>>>0||1;return()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296;};}
const piece=p=>({type:p.type,x:p.x,y:p.y,m:trimMatrix(rotateMatrix(shapes[p.type],p.turns||0))});
const mirrorTypes={J:'L',L:'J',S:'Z',Z:'S',T:'T',I:'I',O:'O'};
function mirror(p,stack=false){
  const width=p.m[0].length;
  const x=stack?(p.x===6?p.x:(p.x<6?6:17)-p.x-width):10-p.x-width;
  return {...p,type:mirrorTypes[p.type],x,m:p.m.map(row=>[...row].reverse())};
}
function canDrop(board,p){let falling={...p,y:0};if(collides(board,falling))return false;while(!collides(board,{...falling,y:falling.y+1}))falling.y++;return falling.y===p.y;}
function validBuildOrder(steps){
  let board=emptyBoard();
  for(let i=0;i<steps.length-1;i++){
    const p=steps[i].target;if(!canDrop(board,p))return false;const stamped=stampShape(board,p);if(!stamped)return false;
    const result=clearRows(stamped);if(result.cleared)return false;board=result.board;
  }
  return true;
}
function varyOrder(steps,random){
  const result=steps.map(step=>({...step}));
  // Swap only independent placements in the same bag. Never reorder the finishing move.
  for(let attempt=0;attempt<24;attempt++){
    const i=Math.floor(random()*(result.length-2));if(i<0||Math.floor(i/7)!==Math.floor((i+1)/7))continue;
    [result[i],result[i+1]]=[result[i+1],result[i]];
    if(!validBuildOrder(result))[result[i],result[i+1]]=[result[i+1],result[i]];
  }
  return result;
}
export function makeLesson(mode,round=0,{kind='mixed',seed=1,attempt=0}={}){
  if(!isLesson(mode))throw new Error('Unknown practice mode');
  const random=seededRandom((seed^Math.imul(round+1,2654435761)^Math.imul(attempt+1,2246822519))>>>0);
  const spin=kind==='mixed'?['single','double','triple'][round%3]:kind;
  const flipped=random()<.5;
  let board=emptyBoard(),steps,title;
  if(mode==='stack63'||mode==='perfect'){
    const pool=catalog[mode],source=pool[(round+(seed>>>0)%pool.length)%pool.length];
    steps=source.plan.map(p=>({target:piece(p)}));
    if(flipped)steps=steps.map(s=>({...s,target:mirror(s.target,mode==='stack63')}));
    steps= varyOrder(steps,random);
    steps.at(-1).clear=4;if(mode==='perfect')steps.at(-1).perfect=true;
    title=mode==='stack63'?'6–3 STACKING':'PERFECT CLEAR';
  }else{
    const pool=catalog.insertions[spin],index=(Math.floor(round/(kind==='mixed'?3:1))+(seed>>>0)%pool.length)%pool.length;
    const source=pool[index];board=source.rows.map(row=>[...row].map(c=>c==='X'?'J':null));
    let target=piece(source.target);
    if(flipped){board=board.map(row=>[...row].reverse());target=mirror(target);}
    // Distinct garbage foundations vary the height and landscape without changing the spin cavity.
    // Keep support and pivot-corner columns solid so the verified spin remains a full spin.
    const raise=2+Math.floor(random()*3),occupied=new Set();
    for(const row of target.m)row.forEach((v,x)=>{if(v)occupied.add(target.x+x);});
    const raw=rotateMatrix(shapes.T,source.target.turns),offset=Math.min(...raw.flatMap(row=>row.flatMap((v,x)=>v?[x]:[])));
    const pivot=flipped?9-(source.target.x-offset+1):source.target.x-offset+1;
    occupied.add(pivot-1);occupied.add(pivot+1);
    const allowed=Array.from({length:10},(_,x)=>x).filter(x=>!occupied.has(x));
    board=board.slice(raise);
    for(let y=0;y<raise;y++){const hole=allowed[Math.floor(random()*allowed.length)];board.push(Array.from({length:10},(_,x)=>x===hole?null:'J'));}
    target={...target,y:target.y-raise};
    steps=[{target,clear:{single:1,double:2,triple:3}[spin],tspin:true,spin}];title=`T-SPIN ${spin.toUpperCase()}`;
  }
  const queue=bagQueue(steps.map(s=>s.target.type),random);
  const id=JSON.stringify([board.map(row=>row.map(v=>v?'X':'.').join('')),steps.map(s=>s.target)]);
  return {board,steps,queue,title,kind:mode==='tspin'?spin:null,id};
}
