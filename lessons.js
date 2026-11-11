import {emptyBoard,shapes,rotateMatrix,trimMatrix,stampShape} from './game.js?v=4';
const target=(type,x,y,turns=0)=>({type,x,y,m:trimMatrix(rotateMatrix(shapes[type],turns))});
const mirrorTypes={J:'L',L:'J',S:'Z',Z:'S',T:'T',I:'I',O:'O'};
function mirror(p){return {...p,type:mirrorTypes[p.type],x:10-p.x-p.m[0].length,m:p.m.map(row=>[...row].reverse())};}
export const isLesson=mode=>['stack63','perfect','t-design','t-insert'].includes(mode);
export function makeLesson(mode,round=0){
  const board=emptyBoard(),flipped=round%2===1;
  if(mode==='stack63'){
    const order=[0,2,4];
    let placements=[...order.map(x=>target('O',x,18)),...order.map(x=>target('O',x,16)),...([7,8,9].map(x=>target('I',x,16,1)))];
    if(round>0){
      placements=[target('L',7,17,1),target('I',1,19),target('J',3,18,2),target('S',8,17,1),target('J',7,16,2),target('Z',2,16,1),target('O',4,16),target('T',0,17,1),target('T',0,16,2)];
      if(round%2===0)placements=placements.map(p=>({...p,type:mirrorTypes[p.type],x:(p.x<6?6:17)-p.x-p.m[0].length,m:p.m.map(row=>[...row].reverse())}));
    }
    placements.push(target('I',6,16,1));
    return {board,title:round===0?'6–3 Stacking · 기초':'6–3 Stacking · 혼합 미노',principle:'왼쪽 6열 · 7열 우물 · 오른쪽 3열. 우물은 끝까지 비우고 양쪽을 같은 높이로 쌓습니다.',steps:placements.map((p,i)=>({target:p,text:i===9?'I를 7열 우물에 넣어 4줄을 지우세요.':`${p.type}를 표시된 ${p.x+1}–${p.x+p.m[0].length}열에 놓으세요. ${p.x<6?'왼쪽 6열':'오른쪽 3열'}을 채우고 7열은 비웁니다.`,...(i===9?{clear:4}:{})}))};
  }
  if(mode==='perfect'){
    // Every course starts empty; mixed-piece courses teach a genuine 2×10 tiling.
    const placements=round===0?[0,2,4,6,8].map(x=>target('O',x,18)):[target('J',6,18),target('J',7,18,2),target('I',2,19),target('I',2,18),target('O',0,18)];
    const plan=flipped?placements.map(mirror):placements;
    return {board,title:round===0?'퍼펙트 설계 · O 기초':'퍼펙트 설계 · J/L + I + O',principle:'빈 보드에서 2 × 10 직사각형을 만듭니다. 현재 미노는 밝게, 다음 배치는 옅게 표시됩니다.',steps:plan.map((p,i)=>({target:p,text:i===4?'마지막 공간을 채워 보드를 완전히 비우세요.':`${p.type}를 표시된 ${p.x+1}–${p.x+p.m[0].length}열 모양대로 놓으세요. 아래 빈칸을 막지 않습니다.`,...(i===4?{clear:2,perfect:true}:{})}))};
  }
  // Five reachable hard-drop placements build a T-spin double from an empty board.
  let plan=[target('J',4,17,3),target('J',0,18),target('I',6,19),target('I',6,18),target('T',0,17,2)];
  let final=target('T',2,18,2);
  if(flipped){plan=plan.map(mirror);final=mirror(final);}
  const insertion=mode==='t-insert',raise=insertion?Math.floor(round/2)%3:0;
  if(raise){
    plan=plan.map(p=>({...p,y:p.y-raise}));final={...final,y:final.y-raise};
    for(let y=20-raise;y<20;y++)for(let x=0;x<10;x++)if(x!==(flipped?0:9))board[y][x]='J';
  }
  let built=board;for(const p of plan)built=stampShape(built,p);
  const turn=flipped?'X':'Z';
  const insertText=`${flipped?'먼저 → 한 칸. ':''}↓로 바닥까지 → ${turn} → ↓로 끝까지 → ${turn} → SPACE. 회전으로 홈에 진입하세요.`;
  return {board:insertion?built:board,title:insertion?`T-spin 넣기 · ${round%6+1}`:'T-spin 빌드 설계',principle:insertion?'완성된 홈에 회전으로 진입하세요. 성공하면 좌우·높이가 다른 다음 빌드가 나옵니다.':'빈 보드부터 받침 → 바닥 → 벽 → 지붕 순서로 쌓습니다. 마지막에는 회전으로 T를 넣습니다.',steps:[...(insertion?[]:plan.map((p,i)=>({target:p,text:[`${p.type}를 표시된 곳에 세워 홈 옆 받침을 만드세요.`,`${p.type}로 반대쪽 바닥을 채우세요.`,'I를 가로로 놓아 바닥을 연결하세요.','I를 그 위에 놓아 벽 높이를 맞추세요.','T를 뒤집어 지붕을 만드세요. 아래 진입 공간은 비워둡니다.'][i]}))),{target:final,text:insertText,clear:2,tspin:true}]};
}
