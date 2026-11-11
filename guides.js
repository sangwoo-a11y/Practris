import {colors,occupiedCells,emptyBoard,stampShape,clearRows,shapes,trimMatrix,rotateMatrix} from './game.js?v=6';
import {catalog} from './lesson-data.js?v=6';
export const guides={
  basics:{title:'기본 규칙',lead:'7-bag · 이동 · 회전 · 홀드',sections:[
    ['보드와 줄 지우기',['보드는 가로 10칸, 세로 20칸입니다. 한 줄을 빈칸 없이 채우면 그 줄이 사라집니다.','미노는 네 칸으로 이루어진 I·O·T·S·Z·J·L의 7종입니다. 위쪽 출현 공간이 막히면 게임 오버입니다.']],
    ['7-bag과 홀드',['한 bag에 7종이 한 번씩 들어가며, 순서를 섞어 모두 뽑은 뒤 다음 bag을 엽니다. NEXT에는 다음 5개가 보입니다.','같은 미노가 bag 경계에서 두 번 연속 나올 수 있지만, 세 번 연속 나오지는 않습니다.','C 또는 Shift로 현재 미노를 보관합니다. 자유 연습은 한 미노당 한 번, 스킬 연습은 순서 복구를 위한 재교환을 허용합니다.']],
    ['조작',['←·→ 이동 / ↓ 소프트 드롭 / SPACE 하드 드롭','↑·X 시계 회전 / Z 반시계 회전 / A 180° 회전','ESC 일시정지 / R 다시 시작. 90°는 SRS 벽차기, 180°는 이 연습실의 별도 킥을 사용합니다.']],
    ['조작 설정',['ARR: 연속 이동의 간격입니다. 0이면 DAS 뒤 벽까지 즉시 이동합니다.','DAS: 방향키를 누른 뒤 연속 이동이 시작될 때까지의 대기입니다.','DCD: 회전이나 새 미노 출현 뒤 연속 횡이동을 잠시 멈추는 시간입니다.','SDF: 소프트 드롭의 배속입니다. ∞는 즉시 바닥에 도달합니다. 설정은 시작 화면에서 바꾸고 브라우저에 저장합니다.']],
  ]},
  tspin:{title:'T-spin',lead:'싱글 · 더블 · 트리플',sections:[
    ['판정',['T 미노가 마지막에 회전해 자리를 잡아야 합니다. T 중심 주위 네 대각선 칸 중 세 칸 이상이 벽이나 블록으로 막혀 있는지 확인합니다.','T가 향하는 쪽 두 모서리도 중요합니다. 미니와 일반 T-spin은 같지 않으며, 일부 SRS 킥에는 예외가 있습니다. 이 연습은 일반 싱글·더블·트리플을 목표로 합니다.']],
    ['줄 수',['싱글은 1줄, 더블은 2줄, 트리플은 3줄을 T-spin으로 지우는 것입니다.','같은 종류라도 홈의 위치, 지붕, 받침과 진입 방향이 다릅니다. 종류 선택 또는 혼합 연습으로 바꿀 수 있습니다.']],
    ['넣는 순서',['T가 들어갈 공간과 그 위의 진입로를 먼저 살펴보세요. 소프트 드롭으로 홈 옆까지 내린 뒤 회전해 들어갑니다.','트리플은 지붕 아래로 SRS 킥을 사용하는 경우가 많습니다. 바로 하드 드롭하면 홈 위에 잠길 수 있습니다.','회전 후 다시 이동하면 마지막 동작이 회전이 아니게 될 수 있습니다. 목표 위치에서 SPACE로 확정하세요.']],
    ['연습 규칙',['완성된 지형에서 T 한 개를 넣습니다. 성공하면 다음 지형이 나오고, 다른 빌드로 건너뛸 수도 있습니다.','시간에 쫓기지 않도록 자동 중력과 접지 자동 잠금은 꺼져 있습니다. 잘못 놓으면 현재 지형에서 다시 시도합니다.']],
  ],links:[{label:'Hard Drop · T-Spin openers 목록',url:'https://harddrop.com/wiki/Category:T-Spin_openers'}]},
  stack63:{title:'6–3 Stacking',lead:'왼쪽 6열 · 우물 1열 · 오른쪽 3열',sections:[
    ['배치 규칙',['1–6열을 왼쪽 영역, 7열을 I 미노용 우물, 8–10열을 오른쪽 영역으로 사용합니다.','우물을 중간에 막지 않고 양쪽을 쌓은 뒤, 세로 I로 4줄을 지웁니다.']],
    ['쌓을 때 볼 것',['아래에 빈칸을 묻지 않는지, 양쪽 높이가 지나치게 벌어지지 않는지 살펴보세요.','NEXT 5개와 홀드를 함께 보고, 다음 미노가 들어갈 표면을 남겨두세요. I를 너무 일찍 써서 우물에 넣을 미노가 없어지지 않게 합니다.']],
    ['이 연습실에서',['7-bag 규칙을 지키는 준비된 과제입니다. 현재 배치는 밝게, 이후 배치는 옅은 윤곽으로 표시됩니다.','표시된 순서를 따라 바닥과 표면을 익히고, 성공하면 다른 배치로 이어갑니다. 실제 무제한 스태킹은 자유 연습에서 시도하세요.']],
  ]},
  perfect:{title:'퍼펙트 클리어',lead:'정답을 보지 않고, 보드를 완전히 비우기',sections:[
    ['성공 조건',['줄을 지운 직후 보드에 블록이 하나도 남지 않으면 퍼펙트 클리어입니다.','이 과제는 두 bag에 걸친 10개 미노로 4줄을 비우는 예시가 있지만, 그 예시와 다른 배치나 더 늦은 퍼펙트 클리어도 허용합니다.']],
    ['생각하는 방법',['2줄은 20칸이므로 5미노, 4줄은 40칸이므로 10미노입니다. 칸 수가 맞아도 모양이 채워지지 않으면 성공할 수 없습니다.','작은 빈 공간을 미노 모양으로 나눠보고, 막힌 구멍이나 한 칸 폭의 깊은 틈을 만들지 않도록 살펴보세요.','NEXT 5개와 홀드로 남은 공간에 맞는 미노를 준비하세요. 모든 임의의 7-bag 순서에서 항상 PC가 가능한 것은 아닙니다.']],
    ['자유 풀이와 도움',['처음에는 정답 위치나 전체 설계도를 표시하지 않습니다. 어디든 유효한 위치에 놓을 수 있습니다.','현재 미노 힌트는 준비된 예시와 같은 흐름일 때만 한 미노의 위치를 보여줍니다. 이미 다른 흐름이라면 잘못된 정답을 강요하지 않습니다.','한 수 되돌리기는 보드, 현재 미노, NEXT와 홀드를 함께 복원합니다. 풀이 예시는 별도 화면에서 한 단계씩 볼 수 있습니다.','예시는 게임판을 바꾸지 않습니다. 성공하면 새로운 순서의 빈 보드로 이어갑니다.']],
  ]},
  editor:{title:'빌드 에디터',lead:'팔레트로 미노·점 배치',sections:[
    ['모양 배치',['팔레트에서 미노를 클릭하면 모양 전체를 놓을 수 있습니다. 키보드의 T·I 등의 글자는 미노를 선택하지 않습니다.','X·↑는 시계 회전, Z·Q는 반시계 회전, A는 180° 회전입니다. 배치가 겹치거나 보드를 벗어나면 놓을 수 없습니다.']],
    ['점과 지우개',['점 버튼이나 B로 칸 단위 브러시로 바꿉니다. 클릭·드래그로 칸을 채우거나 덮어씁니다.','우클릭은 미노 모드에서 배치한 모양 전체를, 점 모드에서 한 칸을 지웁니다. 취소 버튼으로 편집을 되돌립니다.']],
    ['저장과 연습',['빌드는 현재 브라우저에만 저장됩니다. 불러오기와 이 빌드로 연습하기를 사용할 수 있습니다.','예전 칸 단위 저장에는 모양 구분 정보가 없어 한 칸씩 삭제됩니다.']],
  ]},
};
export function guideHTML(topic){
  const page=guides[topic]||guides.basics;
  return `<span class="eyebrow">PRACTRIS / RULES</span><h2 id="guide-title">${page.title}</h2><p class="book-lead">${page.lead}</p>${topic==='tspin'?spinDiagrams():''}${page.sections.map(([title,items])=>`<section><h3>${title}</h3><ul>${items.map(item=>`<li>${item}</li>`).join('')}</ul></section>`).join('')}${page.links?`<section class="book-sources"><h3>외부 참고</h3>${page.links.map(link=>`<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label} ↗</a>`).join('')}</section>`:''}`;
}
export function boardDiagram(board,target=null,fromRow=12){
  const height=(20-fromRow)*20;
  const cells=board.slice(fromRow).flatMap((row,y)=>row.map((type,x)=>`<rect x="${x*20+1}" y="${y*20+1}" width="18" height="18" fill="${type?colors[type]:'#151d29'}"/>`)).join('');
  const hint=target?occupiedCells(target).map(([x,y])=>`<rect x="${x*20+2}" y="${(y-fromRow)*20+2}" width="16" height="16" fill="${colors[target.type]}44" stroke="#d5ff70" stroke-width="1"/>`).join(''):'';
  return `<svg viewBox="0 0 200 ${height}" role="img" aria-label="${target?target.type+' 미노의 이번 배치 위치':'배치 결과'}">${cells}${hint}</svg>`;
}
export function exampleState(lesson,index){
  let board=emptyBoard();
  for(let i=0;i<index;i++)board=clearRows(stampShape(board,lesson.steps[i].target)).board;
  return {board,target:index<lesson.steps.length?lesson.steps[index].target:null};
}

function spinDiagrams(){
  return `<div class="spin-diagrams">${['single','double','triple'].map((kind,index)=>{
    const source=catalog.insertions[kind][0],board=source.rows.map(row=>[...row].map(c=>c==='X'?'J':null));
    const target={...source.target,m:trimMatrix(rotateMatrix(shapes.T,source.target.turns))};
    return `<figure>${boardDiagram(board,target,13)}<figcaption>${kind.toUpperCase()} <span>${index+1}줄</span></figcaption></figure>`;
  }).join('')}</div>`;
}
