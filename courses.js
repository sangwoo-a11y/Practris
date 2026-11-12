import {emptyBoard,bagQueue,occupiedCells} from './game.js?v=9';
import {courseData} from './course-data.js?v=9';
export const courseInfo={
  tki:{name:'TKI 3',scope:'첫 bag · T-spin Double',finish:'첫 bag TSD를 완성했습니다.',purpose:'가로 I 바닥과 지붕이 T의 회전 공간을 만드는 과정을 배웁니다.'},
  dt:{name:'DT Cannon',scope:'토대부터 TSD → TST까지',finish:'같은 보드에서 Double → Triple을 연결했습니다.',purpose:'첫 bag의 토대 위에 지붕을 쌓고, 두 줄이 지워진 뒤 남는 트리플 홈을 확인합니다.'},
  cspin:{name:'C-Spin',scope:'첫 bag 토대 · 7미노',finish:'C-Spin의 첫 bag 토대를 완성했습니다.',purpose:'트리플과 더블로 이어갈 첫 bag의 벽·계단을 만듭니다. 이번 과정은 첫 bag까지입니다.'},
  albatross:{name:'Albatross Special',scope:'Air TSD → TST · 2 bag',finish:'첫 Double과 두 번째 bag의 Triple을 연결했습니다.',purpose:'바닥보다 위에서 더블을 지운 뒤, 남은 지형에 트리플을 연결합니다.'},
  pco:{name:'Perfect Clear Opener',scope:'첫 bag부터 4줄 PC까지',finish:'PCO 형태에서 보드를 완전히 비웠습니다.',purpose:'처음부터 PC 공간을 만들고, 다음 bag의 미노가 빈 공간을 메우는 순서를 배웁니다.'},
};
export function makeCourse(id='tki'){
  const info=courseInfo[id]||courseInfo.tki,key=courseInfo[id]?id:'tki';
  return {id:key,...info,board:emptyBoard(),steps:structuredClone(courseData[key].steps),queue:bagQueue(courseData[key].steps.map(step=>step.target.type))};
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
