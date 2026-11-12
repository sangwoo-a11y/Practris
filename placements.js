import {shapes,collides,rotatedPiece,occupiedCells,stampShape,clearRows} from './game.js?v=9';
export const spawnPiece=type=>({type,m:shapes[type].map(row=>[...row]),x:3,y:0,rot:0,lastRotation:false});
export const placementKey=p=>occupiedCells(p).map(([x,y])=>y*10+x).sort((a,b)=>a-b).join(',');

// Exhaustive reachable placements for one piece, with the same movement/kick rules as play.
// Paths include translations and rotation kicks, rather than assuming every slot is a hard drop.
export function enumeratePlacements(board,start){
  if(!start||collides(board,start))return [];
  const states=[{p:{...start},moves:[]}],seen=new Set(),landings=new Map();
  const key=p=>`${p.x},${p.y},${p.rot||0}`;
  seen.add(key(start));
  function enqueue(p,moves){if(p.y< -4||p.y>19||seen.has(key(p)))return;seen.add(key(p));states.push({p,moves});}
  for(let i=0;i<states.length;i++){
    const {p,moves}=states[i];
    if(collides(board,{...p,y:p.y+1})&&occupiedCells(p).every(([,y])=>y>=0)){
      const id=placementKey(p);if(!landings.has(id))landings.set(id,{p,moves});
    }
    for(const [action,dx,dy] of [['left',-1,0],['right',1,0],['down',0,1]]){
      const next={...p,x:p.x+dx,y:p.y+dy,lastRotation:false};
      if(!collides(board,next))enqueue(next,[...moves,action]);
    }
    for(const [action,turns] of [['cw',1],['ccw',-1],['flip',2]]){
      const next=rotatedPiece(board,p,turns);if(next)enqueue(next,[...moves,action]);
    }
  }
  return [...landings.values()];
}
function placedResult(board,p){
  const result=clearRows(stampShape(board,p));
  return {...result,perfect:result.cleared>0&&result.board.every(row=>row.every(v=>v===null))};
}
// Counts are distinct legal landing positions for this piece and the immediately following piece.
// They are not counts of complete perfect-clear solutions. One optional hold is considered.
export function analyzePlacements({board,current,hold=null,queue=[],canHold=true},progress=()=>{}){
  const groups=[{source:'current',type:current.type,start:current,nextType:queue[0]}];
  if(canHold){const type=hold||queue[0];if(type)groups.push({source:'hold',type,start:spawnPiece(type),nextType:hold?queue[0]:queue[1]});}
  const options=[];
  for(const group of groups){
    const candidates=enumeratePlacements(board,group.start);
    for(const candidate of candidates){
      const result=placedResult(board,candidate.p);
      const next=!result.perfect&&group.nextType?enumeratePlacements(result.board,spawnPiece(group.nextType)).map(choice=>{
        const placed=placedResult(result.board,choice.p);return {p:choice.p,cleared:placed.cleared,perfect:placed.perfect};
      }):[];
      options.push({id:options.length,source:group.source,type:group.type,p:candidate.p,moves:candidate.moves,after:result.board,cleared:result.cleared,perfect:result.perfect,nextType:result.perfect?null:group.nextType,next,nextCount:next.length,nextPerfect:next.filter(choice=>choice.perfect).length});
      if(options.length%8===0)progress(options.length);
    }
  }
  return {options,counts:Object.fromEntries(groups.map(group=>[group.source,options.filter(option=>option.source===group.source).length]))};
}

export function boardQuality(board){
  let holes=0;const heights=[];
  for(let x=0;x<10;x++){let seen=false,height=0;for(let y=0;y<20;y++){if(board[y][x]){if(!seen)height=20-y;seen=true;}else if(seen)holes++;}heights.push(height);}
  return {holes,height:Math.max(...heights),totalHeight:heights.reduce((a,b)=>a+b,0),roughness:heights.slice(1).reduce((sum,h,i)=>sum+Math.abs(h-heights[i]),0)};
}
function hardDrops(board,type){
  const out=[],seen=new Set(),origin=spawnPiece(type);if(collides(board,origin))return out;
  for(let rot=0;rot<4;rot++)for(let x=-3;x<10;x++){
    let p=rot?rotatedPiece(board,origin,rot===3?-1:rot):{...origin};if(!p)continue;
    let blocked=false;while(p.x!==x){const next={...p,x:p.x+Math.sign(x-p.x),lastRotation:false};if(collides(board,next)){blocked=true;break;}p=next;}if(blocked)continue;
    while(!collides(board,{...p,y:p.y+1}))p={...p,y:p.y+1,lastRotation:false};const key=placementKey(p);
    if(!seen.has(key)){seen.add(key);out.push(p);}
  }
  return out;
}
export function recommendPlacements(snapshot,result,{maxNodes=2500,timeMs=400}={}){
  const start=performance.now(),memo=new Set();let nodes=0,limited=false;
  const qualityScore=option=>{const q=boardQuality(option.after);option.quality=q;return -q.holes*10000-q.height*200-q.totalHeight*8-q.roughness*3+option.cleared*30+Math.min(option.nextCount,50);};
  for(const option of result.options)option.score=qualityScore(option);
  const ordered=[...result.options].sort((a,b)=>b.score-a.score||(a.source===b.source?0:a.source==='current'?-1:1));
  function solve(b,cur,queue,hold){
    if(b.every(row=>row.every(v=>v===null)))return [];
    if(++nodes>maxNodes||performance.now()-start>timeMs){limited=true;return null;}
    if(cur&&collides(b,spawnPiece(cur)))return null;
    const known=(cur?1:0)+queue.length+(hold?1:0),filled=b.flat().filter(Boolean).length,height=boardQuality(b).height;
    if(!Array.from({length:known},(_,i)=>i+1).some(n=>(filled+4*n)%10===0&&(filled+4*n)/10>=height))return null;
    const needed=Array.from({length:known},(_,i)=>i+1).filter(n=>(filled+4*n)%10===0&&(filled+4*n)/10>=height);
    const key=b.map(row=>row.map(v=>v?'1':'0').join('')).join('')+'|'+cur+'|'+queue.join('')+'|'+hold;if(memo.has(key))return null;memo.add(key);
    const choices=[];
    if(cur)choices.push({type:cur,next:queue[0]||null,queue:queue.slice(1),hold,useHold:false});
    if(hold&&hold!==cur)choices.push({type:hold,next:queue[0]||null,queue:queue.slice(1),hold:cur,useHold:true});
    if(!hold&&cur&&queue[0])choices.push({type:queue[0],next:queue[1]||null,queue:queue.slice(2),hold:cur,useHold:true});
    const branches=[];
    for(const choice of choices)for(const p of (needed[0]<=3?enumeratePlacements(b,spawnPiece(choice.type)).map(o=>o.p):hardDrops(b,choice.type))){
      const placed=placedResult(b,p),q=boardQuality(placed.board);branches.push({p,...placed,choice,score:-q.holes*10000-q.height*200-q.totalHeight*8+placed.cleared*30});
    }
    branches.sort((a,b)=>b.score-a.score);
    for(const branch of branches){
      if(limited)return null;
      const rest=solve(branch.board,branch.choice.next,branch.choice.queue,branch.choice.hold);
      if(rest)return [{p:branch.p,after:branch.board,cleared:branch.cleared,useHold:branch.choice.useHold},...rest];
    }
    return null;
  }
  for(const option of ordered){
    const first={p:option.p,after:option.after,cleared:option.cleared,useHold:option.source==='hold'};
    if(option.perfect){option.solution=[first];continue;}
    const immediate=option.next.find(next=>next.perfect);
    if(immediate){option.solution=[first,{p:immediate.p,after:clearRows(stampShape(option.after,immediate.p)).board,cleared:immediate.cleared,useHold:false}];continue;}
    if(limited)continue;
    const visible=snapshot.queue.slice(0,5),held=option.source==='hold'?snapshot.current.type:snapshot.hold;
    const remaining=option.source==='hold'&&!snapshot.hold?visible.slice(1):visible;
    const rest=solve(option.after,remaining[0]||null,remaining.slice(1),held);
    if(rest)option.solution=[first,...rest];
  }
  const sorted=[...result.options].sort((a,b)=>Number(!!b.solution)-Number(!!a.solution)||(a.solution&&b.solution?a.solution.length-b.solution.length:0)||b.score-a.score||(a.source===b.source?0:a.source==='current'?-1:1));
  result.options=sorted;
  result.recommendation=sorted[0]?{id:sorted[0].id,reason:sorted[0].solution?'pc':'heuristic',steps:sorted[0].solution?.length||null}:null;
  result.search={nodes,limited,window:Math.min(5,snapshot.queue.length)};
  return result;
}
