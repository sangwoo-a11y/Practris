import {shapes,shuffledBag,collides,rotatedPiece,samePlacement,stampShape,clearRows,classifyTSpin} from './game.js?v=12';
import {spawnPiece,enumeratePlacements} from './placements.js?v=12';
import {seededRandom} from './lessons.js?v=12';
export function routeToTarget(board,step){
  if(step.moves){let p=spawnPiece(step.target.type);for(const action of step.moves){if(['cw','ccw','flip'].includes(action))p=rotatedPiece(board,p,{cw:1,ccw:-1,flip:2}[action]);else p=p&&{...p,x:p.x+({left:-1,right:1}[action]||0),y:p.y+(action==='down'?1:0),lastRotation:false};if(!p||collides(board,p))return null;}const stamped=stampShape(board,p);if(!stamped)return null;const r=clearRows(stamped);if(samePlacement(p,step.target)&&collides(board,{...p,y:p.y+1})&&r.cleared===step.clear&&(!step.spin||classifyTSpin(board,p,r.cleared)===step.spin))return {p,moves:step.moves};return null;}
  return enumeratePlacements(board,spawnPiece(step.target.type)).find(o=>samePlacement(o.p,step.target))||null;
}
function groupsFor(steps){const groups=[];let group=[];for(const step of steps){if(group.length&&group[0].phase!==step.phase){groups.push(group);group=[];}group.push(step);if(step.clear){groups.push(group);group=[];}}if(group.length)groups.push(group);return groups;}
// Search placement dependencies against a real draw order. Each placed piece may
// use hold once; hold can cross bag boundaries, and consumed draws are never copied.
export function planBagCourse(course,queue,{maxNodes=10000,initialHold=null}={}){
  const groups=groupsFor(course.steps),dead=new Set(),paths=new Map();let nodes=0;
  function visit(board,groupIndex,mask,current,cursor,held){
    if(groupIndex===groups.length)return [];
    if(++nodes>maxNodes||!current)return null;
    const group=groups[groupIndex];if(mask===(1<<group.length)-1)return visit(board,groupIndex+1,0,current,cursor,held);
    const key=[groupIndex,mask,current,cursor,held].join('|');if(dead.has(key))return null;dead.add(key);
    const choices=[{type:current,cursor,held,useHold:false}];
    if(held&&held!==current)choices.push({type:held,cursor,held:current,useHold:true});
    if(!held&&queue[cursor])choices.push({type:queue[cursor],cursor:cursor+1,held:current,useHold:true});
    for(const choice of choices)for(let i=0;i<group.length;i++){
      const step=group[i];if((mask&(1<<i))||step.target.type!==choice.type)continue;
      if(step.clear&&mask!==(((1<<group.length)-1)^(1<<i)))continue;
      const pathKey=[groupIndex,mask,i].join('|');if(!paths.has(pathKey))paths.set(pathKey,routeToTarget(board,{...step,moves:step.spin?step.moves:undefined}));const path=paths.get(pathKey);if(!path)continue;
      const result=clearRows(stampShape(board,path.p));if(result.cleared!==step.clear)continue;
      const tail=visit(result.board,groupIndex,mask|(1<<i),queue[choice.cursor],choice.cursor+1,choice.held);
      if(tail)return [{...step,moves:path.moves,useHold:choice.useHold},...tail];
    }
    return null;
  }
  const steps=visit(course.board,0,0,queue[0],1,initialHold);return steps?{...course,steps,queue:[...queue],bagPractice:true}:null;
}
export function designBagCourse(course,{seed=1,round=0}={}){
  const random=seededRandom((seed^Math.imul(round+1,2654435761))>>>0);
  for(let attempt=0;attempt<24;attempt++){
    const queue=Array.from({length:4},()=>shuffledBag(random)).flat();
    if(course.bagOffset===6)queue.unshift(course.steps[0].target.type);
    const planned=planBagCourse(course,queue);if(planned)return {...planned,bagNote:'이 형태가 가능한 7-bag 과제 · 홀드로 순서 판단',bagSeed:seed,bagRound:round};
  }
  // A selected feasible drill, not a claim that every random bag supports this opener.
  let currentQueue=[...course.queue],planned=planBagCourse(course,currentQueue);
  if(!planned)throw Error('Course has no legal bag plan');
  const start=course.bagOffset===6?1:0;
  for(let attempt=0;attempt<36;attempt++){const trial=[...currentQueue],bag=Math.floor(random()*Math.max(1,Math.ceil(course.steps.length/7))),offset=start+bag*7,i=offset+Math.floor(random()*6);if(i+1>=trial.length)continue;[trial[i],trial[i+1]]=[trial[i+1],trial[i]];const candidate=planBagCourse(course,trial);if(candidate){planned=candidate;currentQueue=trial;}}
  return {...planned,bagNote:'이 형태가 가능한 7-bag 과제 · 홀드로 순서 판단',bagSeed:seed,bagRound:round};
}
export function nextCourseVariant(id,variantId,variants){const index=variants.findIndex(v=>v.id===variantId);return variants[(index+1)%variants.length]?.id;}
