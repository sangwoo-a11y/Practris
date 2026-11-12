import {colors,occupiedCells,emptyBoard,stampShape,clearRows,shapes,trimMatrix,rotateMatrix} from './game.js?v=14';
import {catalog} from './lesson-data.js?v=14';
export const guides={
  basics:{title:'기본 규칙',lead:'7-bag · 이동 · 회전 · 홀드',sections:[
    ['보드와 줄 지우기',['보드는 가로 10칸, 세로 20칸입니다. 한 줄을 빈칸 없이 채우면 그 줄이 사라집니다.','미노는 네 칸으로 이루어진 I·O·T·S·Z·J·L의 7종입니다. 위쪽 출현 공간이 막히면 게임 오버입니다.']],
    ['7-bag과 홀드',['한 bag에 7종이 한 번씩 들어가며, 순서를 섞어 모두 뽑은 뒤 다음 bag을 엽니다. NEXT에는 다음 5개가 보입니다.','같은 미노가 bag 경계에서 두 번 연속 나올 수 있지만, 세 번 연속 나오지는 않습니다.','C 또는 Shift로 현재 미노를 보관합니다. 자유 연습은 한 미노당 한 번, 스킬 연습은 순서 복구를 위한 재교환을 허용합니다.']],
    ['조작',['←·→ 이동 / ↓ 소프트 드롭 / SPACE 하드 드롭','↑·X 시계 회전 / Z 반시계 회전 / A 180° 회전','ESC 일시정지 / R 다시 시작. 90°는 SRS 벽차기, 180°는 이 연습실의 별도 킥을 사용합니다.']],
    ['조작 설정',['ARR: 연속 이동의 간격입니다. 0이면 DAS 뒤 벽까지 즉시 이동합니다.','DAS: 방향키를 누른 뒤 연속 이동이 시작될 때까지의 대기입니다.','DCD: 회전이나 새 미노 출현 뒤 연속 횡이동을 잠시 멈추는 시간입니다.','SDF: 소프트 드롭의 배속입니다. ∞는 즉시 바닥에 도달합니다. 설정은 시작 화면에서 바꾸고 브라우저에 저장합니다.']],
  ]},
  tspin:{title:'T-spin',lead:'싱글 · 더블 · 트리플',sections:[
    ['판정',['T 미노가 마지막에 회전해 자리를 잡아야 합니다. T 중심 주위 네 대각선 칸 중 세 칸 이상이 벽이나 블록으로 막혀 있는지 확인합니다.','T가 향하는 쪽 두 모서리도 중요합니다. 미니와 일반 T-spin은 같지 않으며, 일부 SRS 킥에는 예외가 있습니다. 이 연습은 일반 싱글·더블·트리플을 목표로 합니다.']],
    ['줄 수',['싱글은 1줄, 더블은 2줄, 트리플은 3줄을 T-spin으로 지우는 것입니다.','같은 종류라도 홈의 위치, 지붕, 받침과 진입 방향이 다릅니다. 싱글·더블·트리플이 항상 섞여 나오며, 성공하면 다른 종류와 지형으로 이어집니다.']],
    ['넣는 순서',['T가 들어갈 공간과 그 위의 진입로를 먼저 살펴보세요. 소프트 드롭으로 홈 옆까지 내린 뒤 회전해 들어갑니다.','트리플은 지붕 아래로 SRS 킥을 사용하는 경우가 많습니다. 바로 하드 드롭하면 홈 위에 잠길 수 있습니다.','회전 후 다시 이동하면 마지막 동작이 회전이 아니게 될 수 있습니다. 목표 위치에서 SPACE로 확정하세요.']],
    ['Opener와 중반 설계',['빌드 학습에서 Opener와 중반 빌드를 고를 수 있습니다. 중반 과제는 이미 쌓인 보드에서 TSD 지붕, TST 진입로, 스키밍 후 연결을 설계합니다.','따라 쌓기는 목표를 보며 놓고, bag 판단은 목표를 숨긴 채 NEXT와 홀드로 순서를 생각합니다. bag 판단은 성공 여부와 무관하게 한 번 섞은 무작위 7-bag을 사용합니다. 고정 순서는 따라 쌓기 예제에서만 보여줍니다.','같은 단계에서 다른 배치로도 목표를 완성할 수 있으면 받아들이고 남은 순서를 다시 계산합니다. 목표 표시로 한 수씩 볼 수 있습니다. 완료 후 다음 과제로 자동 이동하며, 자동 넘김은 끌 수 있습니다.']],
    ['연습 규칙',['완성된 지형에서 T 한 개를 넣습니다. 성공하면 다음 지형이 나오고, 다른 빌드로 건너뛸 수도 있습니다.','시간에 쫓기지 않도록 자동 중력과 접지 자동 잠금은 꺼져 있습니다. 잘못 놓으면 현재 지형에서 다시 시도합니다.']],
  ],links:[{label:'Hard Drop · T-Spin openers 목록',url:'https://harddrop.com/wiki/Category:T-Spin_openers'}]},
  stack63:{title:'6–3 Stacking',lead:'왼쪽 6열 · 우물 1열 · 오른쪽 3열',sections:[
    ['배치 규칙',['1–6열을 왼쪽 영역, 7열을 I 미노용 우물, 8–10열을 오른쪽 영역으로 사용합니다.','우물을 중간에 막지 않고 양쪽을 쌓은 뒤, 세로 I로 4줄을 지웁니다.']],
    ['오른쪽 3열 조합',['J→O→L, J→S→L, J→Z→L은 3×4 직사각형을 채우는 대표 조합입니다. 같은 미노 집합이라도 받침과 순서가 다르면 모양이 달라집니다.','오른쪽에 하나를 놓았으면 나머지 두 미노가 현재 공간을 채울 수 있는지 봅니다. 추천은 실제 3열 지형과 NEXT·홀드의 남은 개수를 함께 확인합니다. I는 7열 우물의 4줄 클리어에 쓸지도 판단하세요.','조합 후보는 3열 내부의 공간을 채울 수 있다는 뜻입니다. 사이에 나오는 미노를 왼쪽에 놓을 수 있는지까지 함께 판단해야 합니다. 별도 연습으로 옮기지 않고 6–3 전체 보드의 추천 점수에 이 조합 가능성을 함께 반영합니다.']],
    ['쌓을 때 볼 것',['아래에 빈칸을 묻지 않는지, 양쪽 높이가 지나치게 벌어지지 않는지 살펴보세요.','NEXT 5개와 홀드를 함께 보고, 다음 미노가 들어갈 표면을 남겨두세요. I를 너무 일찍 써서 우물에 넣을 미노가 없어지지 않게 합니다.']],
    ['이 연습실에서',['빈 보드에서 무작위 7-bag으로 자유롭게 쌓습니다. 다른 위치에 놓아도 그대로 이어집니다.','첫 미노를 놓기 전부터 7열 우물 유지·내부 빈칸·양쪽 높이 균형을 평가하고 다음 한 수까지 비교해 추천합니다. 현재 보드의 추천은 금색 윤곽으로 표시됩니다.','4줄을 지워도 남은 보드와 NEXT를 유지해 계속 쌓습니다. 한 수 되돌리기로 배치를 비교할 수 있습니다. 추천은 평가 점수 기준이며 무한한 미래의 최적해는 아닙니다.']],
  ]},
  perfect:{title:'퍼펙트 클리어',lead:'정답을 보지 않고, 보드를 완전히 비우기',sections:[
    ['퍼펙트 방식 선택',['자유 풀이 또는 PCO 기본형·PCO I 보류·MKO T 보류 PC를 선택할 수 있습니다. 여기의 방식은 사람이 연습할 정형 빌드이며 PC 후보 탐색 엔진 선택과는 다릅니다.','처음부터 설계는 빈 보드에서, 마무리는 준비된 공간에서 시작합니다. 두 경우 모두 새로운 무작위 7-bag을 공급하며 성공할 미노를 골라주지 않습니다.','방식 한 수 힌트는 현재 단계만 보여줍니다. 다른 곳에 놓아 형태를 벗어나면 현재 보드의 자동 PC 추천을 이어가고, 되돌리면 방식 진행과 힌트도 복원합니다.','퍼펙트 방식은 스킬 연습에서만 선택합니다. 토대를 만드는 동안 방식 힌트를 사용하고, 토대 이후에는 실제 NEXT·홀드로 PC 마무리를 계산합니다. 성공하지 않아도 계속 놓을 수 있습니다.']],
    ['성공 조건',['줄을 지운 직후 보드에 블록이 하나도 남지 않으면 퍼펙트 클리어입니다.','이 과제는 두 bag에 걸친 10개 미노로 4줄을 비우는 예시가 있지만, 그 예시와 다른 배치나 더 늦은 퍼펙트 클리어도 허용합니다.']],
    ['생각하는 방법',['2줄은 20칸이므로 5미노, 4줄은 40칸이므로 10미노입니다. 칸 수가 맞아도 모양이 채워지지 않으면 성공할 수 없습니다.','작은 빈 공간을 미노 모양으로 나눠보고, 막힌 구멍이나 한 칸 폭의 깊은 틈을 만들지 않도록 살펴보세요.','NEXT 5개와 홀드로 남은 공간에 맞는 미노를 준비하세요. 모든 임의의 7-bag 순서에서 항상 PC가 가능한 것은 아닙니다.']],
    ['배치 후보와 추천 계산',['후보는 외부 DB나 예시에서 가져오지 않습니다. 현재 위치에서 좌우·아래 이동과 SRS/180° 회전으로 도달할 착지를 너비 우선 탐색(BFS)하고, 같은 네 칸은 중복 제거합니다. 홀드 대안도 따로 계산합니다.','보이는 NEXT 최대 5개와 홀드로 PC 경로를 깊이 우선 탐색(DFS)합니다. 같은 상태는 다시 계산하지 않고, 칸 수와 높이로 불가능한 가지를 줄입니다. PC 탐색은 기본 2,500노드·400ms의 제한이 있습니다.','PC 경로가 확인된 후보를 먼저 보여주고, 그중 짧은 경로를 우선합니다. 확인되지 않은 경우 내부 빈칸, 최대 높이, 전체 높이, 표면 굴곡을 벌점으로 정렬합니다. 전역 최적해나 모든 PC 해법을 보장하지 않습니다.']],
    ['자유 풀이와 도움',['전체 설계도는 펼치지 않고 첫 미노부터 현재 보드의 추천 한 수를 표시합니다. 어디든 유효한 위치에 놓을 수 있습니다.','시작 즉시, 그리고 미노를 놓을 때마다 실제 보드의 후보 수와 추천 위치를 자동 갱신합니다. 예시와 다른 곳에 놓아도 그 상태에서 다시 계산합니다. 자동 분석을 끄고 후보 보기로 열 수도 있습니다.','확인된 PC 경로를 우선 추천합니다. 경로를 찾지 못하면 빈칸·높이를 기준으로 추천하며, PC가 불가능하다는 뜻은 아닙니다. 한 수 되돌리기는 보드, 현재 미노, NEXT와 홀드를 함께 복원합니다. 풀이 예시는 별도 화면에서 한 단계씩 볼 수 있습니다.','후보를 고르면 이번 배치와 그다음 미노의 가능한 위치 수·미리보기가 나옵니다. 추가 홀드 없이 다음 한 수까지의 배치 수이며, 모든 PC 완성 해법의 수를 뜻하지는 않습니다. 분석과 예시는 게임판을 바꾸지 않습니다. PC가 되면 남은 큐와 홀드를 유지해 이어갑니다. 다시 시작이나 다른 과제는 새로운 무작위 bag으로 시작합니다.']],
  ]},
  editor:{title:'빌드 에디터',lead:'팔레트로 미노·점 배치',sections:[
    ['모양 배치',['팔레트에서 미노를 클릭하면 모양 전체를 놓을 수 있습니다. 키보드의 T·I 등의 글자는 미노를 선택하지 않습니다.','X·↑는 시계 회전, Z·Q는 반시계 회전, A는 180° 회전입니다. 배치가 겹치거나 보드를 벗어나면 놓을 수 없습니다.']],
    ['점과 지우개',['점 버튼이나 B로 칸 단위 브러시로 바꿉니다. 클릭·드래그로 칸을 채우거나 덮어씁니다.','우클릭은 미노 모드에서 배치한 모양 전체를, 점 모드에서 한 칸을 지웁니다. 취소 버튼으로 편집을 되돌립니다.']],
    ['저장과 연습',['빌드는 현재 브라우저에만 저장됩니다. 불러오기와 이 빌드로 연습하기를 사용할 수 있습니다.','예전 칸 단위 저장에는 모양 구분 정보가 없어 한 칸씩 삭제됩니다.']],
  ]},
};
export function guideHTML(topic){
  return renderGuidePage(guides[topic]||guides.basics,topic);
}
function renderGuidePage(page,topic){
  return `<span class="eyebrow">PRACTRIS / RULES</span><h2 id="guide-title">${page.title}</h2><p class="book-lead">${page.lead}</p>${topic==='tspin'?spinDiagrams():''}${page.sections.map(([title,items])=>`<section><h3>${title}</h3><ul>${items.map(item=>`<li>${item}</li>`).join('')}</ul></section>`).join('')}${page.links?`<section class="book-sources"><h3>외부 참고</h3>${page.links.map(link=>`<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label} ↗</a>`).join('')}</section>`:''}`;
}
export function boardDiagram(board,target=null,fromRow=12){
  const height=(20-fromRow)*20;
  const cells=board.slice(fromRow).flatMap((row,y)=>row.map((type,x)=>`<rect x="${x*20+1}" y="${y*20+1}" width="18" height="18" fill="${type?colors[type]:'#151d29'}"/>`)).join('');
  const hint=target?occupiedCells(target).map(([x,y])=>`<rect x="${x*20+2}" y="${(y-fromRow)*20+2}" width="16" height="16" fill="${colors[target.type]}44" stroke="#d5ff70" stroke-width="1"/>`).join(''):'';
  return `<svg viewBox="0 0 200 ${height}" role="img" aria-label="${target?target.type+' 미노의 이번 배치 위치':'배치 결과'}">${cells}${hint}</svg>`;
}
export function exampleState(lesson,index){
  let board=structuredClone(lesson.board||emptyBoard());
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

function escaped(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function contextGuideHTML(context={}){
  const mode=context.mode||'home';let page,topic=mode;
  if(mode==='build'){
    const c=context.course||{},bag=context.style==='bag';
    page={title:c.name||'빌드 학습',lead:`${c.scope||''} · ${bag?'무작위 bag 판단':'고정 예제 따라 쌓기'}`,sections:[
      ['어떤 빌드인가요?',[c.description||'현재 지형에 맞춰 선택한 빌드를 직접 쌓습니다.']],
      ['왜 연습하나요?',[c.benefit||c.purpose||'미노의 역할과 진입로를 읽으며 배치 순서를 판단합니다.']],
      ['현재 과제',[context.pending?'새 bag 과제를 준비 중입니다.':`${context.index||0}/${c.steps?.length||0} 단계 · ${context.offPlan?'선택 형태에서 벗어난 배치입니다. 현재 지형에서 목표를 이어갑니다.':'선택한 형태를 설계하는 중입니다.'}`,context.pending?'준비가 끝나면 바로 조작할 수 있습니다.':`현재 ${context.current||'완료'} · 홀드 ${context.hold||'—'} · ${c.steps?.[context.index||0]?.phase||'완료'}`]],
      ['진행 규칙',bag?['미노를 유효한 위치에 놓으면 그대로 고정합니다. 숨겨진 목표와 다르다는 이유로 출현 위치로 되돌리지 않습니다.','같은 단계의 다른 순서로도 설계할 수 있으면 남은 순서를 다시 계산합니다. 다른 곳에 놓으면 형태 이탈을 안내하고 실제 T-spin·PC 목표를 계속 판정합니다.','홀드가 필요한 다음 수는 현재·홀드 상태를 기준으로 안내합니다. 잘못 놓았다면 한 수 전으로 보드·큐·홀드를 되돌릴 수 있습니다.']:['현재 목표 윤곽에 맞춰 이동·회전한 뒤 SPACE로 고정합니다. 위치나 필요한 T-spin 판정이 다르면 현재 수를 다시 시도합니다.']],
      ['완료와 다음 과제',[c.finish||'선택한 목표를 완성하세요.','방향·순서·지형은 매 과제 자동으로 바뀝니다. 완료 후 다음 과제를 켜두면 계속 이어지고, 한 수 전으로 돌아가면 자동 넘김 예약을 취소합니다.']],
    ]};
  }else if(mode==='perfect'){
    const m=context.method,stage=context.stage==='finish'?'마무리만 연습':'처음부터 설계';
    page={...guides.perfect,title:m?`${m.name} · ${stage}`:'퍼펙트 설계 · 자유 풀이',lead:m?m.description:'현재 보드와 NEXT·홀드로 보드를 완전히 비우기',sections:[
      ['현재 선택',[m?`${m.name} / ${stage}. 실제 미노는 성공을 보장하지 않는 무작위 7-bag입니다.`:'정해진 형태를 강제하지 않는 자유 PC 연습입니다.']],
      ['현재 추천 기준',[m&&context.phase==='finish'?'준비된 토대와 실제 NEXT·홀드를 사용해 PC 마무리를 탐색합니다. 정해진 마무리 미노를 공급하지 않습니다.':m&&context.onPlan!==false?'선택한 방식의 현재 단계에 맞으며 실제로 도달 가능한 배치를 우선합니다. 그 안에서 확인된 PC 경로와 다음 미노를 비교합니다.':m?'선택 형태에서 벗어났으므로 현재 보드에서 공통 PC 경로를 다시 탐색합니다.':'현재 보드의 도달 가능한 착지와 보이는 NEXT 최대 5개·홀드로 PC 경로를 탐색합니다.','첫 미노부터 추천합니다. PC 경로를 확인하지 못하면 빈칸·높이 기준 평가임을 표시하며 전역 최적해를 보장하지 않습니다.']],
      ...guides.perfect.sections,
    ]};
  }else if(mode==='tspin')page={...guides.tspin,title:'T-spin · 싱글·더블·트리플 혼합',lead:`현재 ${context.lesson?.kind?.toUpperCase()||'혼합'} · 성공하면 다음 지형`,sections:guides.tspin.sections};
  else if(mode==='stack63')page={...guides.stack63,lead:'첫 미노부터 우물·표면·오른쪽 3열 조합 추천'};
  else if(mode==='editor')page={...guides.editor,title:'빌드 에디터',lead:`현재 ${context.brush==='cell'?'점 브러시':'미노 배치'} · ${context.paint||'T'}`};
  else if(mode==='free')page={...guides.basics,title:'자유 연습',lead:'무작위 7-bag · 자동 중력 · 자유롭게 줄 지우기',sections:[['연습 방법',['SPACE로 시작하고 방향키·회전·홀드로 자유롭게 쌓습니다. 자동 중력과 접지 후 자동 고정을 사용합니다.','모양을 맞추는 목표 없이 줄을 지우며 조작을 익힙니다. PC·6–3의 자동 추천은 각 스킬 연습에서 제공합니다.']],...guides.basics.sections]};
  else return guideHTML('basics');
  page={...page,title:escaped(page.title),lead:escaped(page.lead),sections:page.sections.map(([title,items])=>[escaped(title),items.map(escaped)])};
  return renderGuidePage(page,topic);
}
