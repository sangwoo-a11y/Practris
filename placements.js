import {shapes,collides,rotatedPiece,occupiedCells,stampShape,clearRows} from './game.js?v=8';
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
