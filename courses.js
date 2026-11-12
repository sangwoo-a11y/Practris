import {emptyBoard,bagQueue,occupiedCells} from './game.js?v=10';
import {courseVariants} from './course-variants.js?v=10';
export function listCourseVariants(id='tki'){return (courseVariants[id]||courseVariants.tki).map(({id,name,kind,mirrored})=>({id,name,kind,mirrored}));}
export const courseInfo={
  tki:{name:'TKI 3',scope:'첫 bag · T-spin Double',finish:'첫 bag TSD를 완성했습니다.',description:'가로 I를 바닥으로 삼아 첫 bag에서 T-spin Double을 만드는 오프너입니다.',benefit:'적은 미노로 빠르게 첫 TSD를 만들고 후속 쌓기로 이어가기 좋습니다. I가 일찍 나올 때 유리합니다.',purpose:'가로 I 바닥과 지붕이 T의 회전 공간을 만드는 과정을 배웁니다.'},
  dt:{name:'DT Cannon',scope:'토대부터 TSD → TST까지',finish:'같은 보드에서 Double → Triple을 연결했습니다.',description:'Double을 지운 뒤 남는 홈으로 Triple을 연결하는 오프너입니다.',benefit:'두 번의 T-spin을 연속 공격으로 연결합니다. 높은 지붕을 만드는 동안 진입로를 지켜야 합니다.',purpose:'첫 bag의 토대 위에 지붕을 쌓고, 두 줄이 지워진 뒤 남는 트리플 홈을 확인합니다.'},
  cspin:{name:'C-Spin',scope:'첫 bag 토대 · 7미노',finish:'C-Spin의 첫 bag 토대를 완성했습니다.',description:'Triple → Double로 이어지는 빌드입니다. 여기서는 첫 bag 토대를 학습합니다.',benefit:'한 번 만든 지붕을 후속 T-spin에 활용하는 구조를 익히기 좋습니다. 이번 과정에 공격 실행은 포함하지 않습니다.',purpose:'트리플과 더블로 이어갈 첫 bag의 벽·계단을 만듭니다. 이번 과정은 첫 bag까지입니다.'},
  albatross:{name:'Albatross Special',scope:'Air TSD → TST · 2 bag',finish:'첫 Double과 두 번째 bag의 Triple을 연결했습니다.',description:'바닥 위쪽의 Air TSD에서 Triple로 이어지는 연속 T-spin 오프너입니다.',benefit:'첫 공격 뒤 남는 지형을 다시 사용합니다. 줄 지우기 후 지붕의 높이가 달라지는 원리를 익힙니다.',purpose:'바닥보다 위에서 더블을 지운 뒤, 남은 지형에 트리플을 연결합니다.'},
  pco:{name:'Perfect Clear Opener',scope:'첫 bag부터 4줄 PC까지',finish:'PCO 형태에서 보드를 완전히 비웠습니다.',description:'첫 bag에 공간을 남기고 다음 bag으로 채워 보드를 비우는 오프너입니다.',benefit:'PC 공격과 빈 보드로의 전환을 노립니다. 성공 여부는 다음 미노 순서와 홀드에 따라 달라집니다.',purpose:'처음부터 PC 공간을 만들고, 다음 bag의 미노가 빈 공간을 메우는 순서를 배웁니다.'},
};
export function makeCourse(id='tki',variantId=null){
  const info=courseInfo[id]||courseInfo.tki,key=courseInfo[id]?id:'tki';
  const variant=courseVariants[key].find(v=>v.id===variantId)||courseVariants[key][0];
  return {id:key,...info,variantId:variant.id,variantName:variant.name,board:emptyBoard(),steps:structuredClone(variant.steps),queue:bagQueue(variant.steps.map(step=>step.target.type))};
}
export function courseInstruction(course,index){
  if(index>=course.steps.length)return {title:'학습 완료',why:course.finish};
  const step=course.steps[index],p=step.target;
  const xs=occupiedCells(p).map(([x])=>x+1),min=Math.min(...xs),max=Math.max(...xs);
  const location=min===max?`${min}열`:`${min}–${max}열`;
  if(step.spin)return {title:`T를 회전해 ${step.clear}줄 지우기`,why:`지붕 아래 표시된 홈에 회전해 들어간 뒤 SPACE로 확정하세요. ${step.clear===2?'더블 이후 남는 지형도 확인합니다.':'SRS 킥으로 진입할 공간을 남기는 것이 중요합니다.'}`};
  if(step.perfect)return {title:`${p.type}로 마지막 공간 채우기`,why:'줄을 지운 뒤 블록이 하나도 남지 않으면 퍼펙트 클리어입니다.'};
  if(course.id==='tki'&&p.type==='I')return {title:'I를 가로로 놓아 바닥 만들기',why:'T가 들어갈 홈 아래의 높이를 정합니다. 빈 공간을 막지 않도록 표시된 바닥에 놓으세요.'};
  const role=p.m.length>p.m[0].length?'세로 벽과 계단을 만듭니다.':'바닥과 표면을 연결합니다.';
  return {title:`${p.type}를 ${location}에 놓기`,why:course.id==='pco'?`${role} 남은 미노가 채울 빈 공간과 진입로를 남겨두세요.`:`${role} 다음 T의 홈과 통로를 덮지 않게 목표 윤곽을 확인하세요.`};
}
