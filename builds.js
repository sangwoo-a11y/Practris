// Concept guides: attack flow and setup decisions, not a single universal placement recipe.
export const buildLibrary=[
  {id:'tki',name:'TKI 3',tags:['TSD','초반 공격'],summary:'가로 I 바닥을 활용해 빠른 T-spin Double을 준비하는 대표적인 오프너입니다.',when:'I가 초반에 와서 가로 바닥을 만들기 편할 때 살펴보세요.',idea:'가로 I 위의 높이를 조절하면서 T가 들어갈 홈과 지붕을 만듭니다.',watch:'I를 놓는 방향만 외우기보다 T 진입로와 남은 미노의 표면을 함께 보세요. TKI에는 여러 변형이 있습니다.',flow:[
    {label:'가로 I 바닥',kind:'setup',title:'I로 기준 높이 만들기',text:'I를 가로로 사용해 바닥의 기준을 잡습니다. 좌우 방향은 미노 순서와 다음 배치에 맞춰 고릅니다.',check:'바닥에 구멍을 묻지 않았는지 확인하세요.'},
    {label:'T-spin Double',kind:'double',title:'홈과 지붕 연결',text:'남은 미노로 T 홈과 회전 진입에 필요한 지붕을 준비하고 T-spin Double로 두 줄을 지웁니다.',check:'T를 단순히 떨어뜨리는 자리와 회전해 들어가는 자리를 구분하세요.'},
    {label:'후속 전개',kind:'setup',title:'남은 표면에서 이어가기',text:'첫 더블 뒤의 표면과 다음 bag을 보고 후속 T-spin이나 평평한 스태킹으로 연결합니다. 후속 수를 하나로 고정하지 않습니다.',check:'첫 공격 뒤에 깊은 구멍이나 막힌 우물이 남지 않게 하세요.'},
  ],source:'https://harddrop.com/wiki/TKI_3_Opening'},
  {id:'dt',name:'DT Cannon',tags:['TSD','TST','연속 공격'],summary:'Double → Triple 순서로 연결하는 빌드입니다. 첫 공격과 그 뒤의 트리플 구조를 함께 준비합니다.',when:'연속 공격의 연결과 높은 구조에서 T를 회전해 넣는 원리를 익히고 싶을 때 좋습니다.',idea:'첫 T-spin Double을 지우고 나서, 남은 지형이 다음 T-spin Triple의 토대가 되도록 설계합니다.',watch:'Double만 보고 지붕을 막아버리면 뒤의 Triple이 끊깁니다. 벽 높이와 진입 공간을 함께 확인하세요.',flow:[
    {label:'연결 구조',kind:'setup',title:'두 번의 공격을 함께 보기',text:'Double 자리와 Triple로 이어질 벽·지붕의 역할을 나눠 봅니다. 지금 채울 칸과 다음 공격을 위해 남길 공간이 다릅니다.',check:'다음 T가 들어올 길을 남겨두세요.'},
    {label:'T-spin Double',kind:'double',title:'첫 두 줄 지우기',text:'첫 T로 Double을 만들며 위쪽 블록이 내려온 뒤의 형태를 확인합니다.',check:'줄이 지워진 뒤 높이가 어떻게 바뀌는지 예상해보세요.'},
    {label:'T-spin Triple',kind:'triple',title:'남은 지형에서 세 줄 지우기',text:'준비된 지붕과 벽을 활용해 다음 T를 회전 진입시키고 Triple을 만듭니다.',check:'너무 이른 하드 드롭으로 지붕 위에 잠그지 않게 하세요.'},
  ],source:'https://harddrop.com/wiki/DT_Cannon'},
  {id:'cspin',name:'C-Spin',tags:['TST','TSD','연속 공격'],summary:'Triple → Double의 진행으로 알려진 빌드입니다. DT Cannon과 공격 순서를 비교해보세요.',when:'트리플 이후 남는 지형을 다음 더블로 바꾸는 과정을 배우고 싶을 때 살펴보세요.',idea:'큰 지붕 구조로 Triple을 만든 뒤, 줄이 사라져 바뀐 지형에서 Double을 이어갑니다.',watch:'지붕이 높아질수록 막히기 쉽습니다. 다음 bag을 보며 진입 공간과 탈출 후 표면을 확인하세요.',flow:[
    {label:'지붕과 진입로',kind:'setup',title:'Triple을 위한 구조',text:'T가 지붕 아래로 회전해 들어갈 통로를 준비합니다. 벽을 채우는 것과 진입로를 막는 것은 다릅니다.',check:'지붕 아래의 공간을 성급히 채우지 마세요.'},
    {label:'T-spin Triple',kind:'triple',title:'먼저 세 줄 지우기',text:'첫 큰 공격에서 Triple을 지운 뒤, 위에 남은 블록의 새 위치를 봅니다.',check:'클리어 전 모양을 그대로 외워 다음 수를 놓지 마세요.'},
    {label:'T-spin Double',kind:'double',title:'남은 홈으로 두 줄 더',text:'줄 지우기로 바뀐 표면에서 Double을 연결합니다.',check:'DT Cannon의 Double → Triple과 순서가 반대입니다.'},
  ],source:'https://harddrop.com/wiki/C-Spin'},
  {id:'albatross',name:'Albatross Special',tags:['TSD','TST','고층 전개'],summary:'Double → Triple → Triple을 노리는 대표적인 연속 T-spin 빌드입니다.',when:'여러 번의 공격을 이어 보면서 높은 스택을 관리하는 법을 배우고 싶을 때 살펴보세요.',idea:'한 번의 공격만 만들지 않고, 줄이 지워진 뒤에도 다음 트리플의 구조가 남도록 계획합니다.',watch:'긴 전개일수록 순서와 높이 관리가 중요합니다. 모양을 억지로 고정하면 진입 공간이 막히거나 위쪽이 닫힐 수 있습니다.',flow:[
    {label:'T-spin Double',kind:'double',title:'첫 공격과 토대',text:'Double을 만들면서 이후 두 번의 트리플로 연결할 지형을 준비합니다.',check:'첫 공격에 모든 공간을 써버리지 않았는지 확인하세요.'},
    {label:'T-spin Triple',kind:'triple',title:'첫 번째 Triple',text:'준비된 높은 지형에서 Triple을 지우고, 남은 벽과 지붕의 새 위치를 살핍니다.',check:'줄이 사라진 뒤의 높이 변화를 예상하세요.'},
    {label:'T-spin Triple',kind:'triple',title:'두 번째 Triple',text:'후속 T로 다음 Triple을 연결합니다. 상대 공격이나 미노 순서에 따라 다른 전개로 전환할 판단도 필요합니다.',check:'빌드를 완성하는 것과 안전하게 이어가는 것을 함께 보세요.'},
  ],source:'https://harddrop.com/wiki/Albatross_Special'},
  {id:'pco',name:'Perfect Clear Opener',tags:['PC','공간 설계'],summary:'첫 bag에서 준비한 공간을 다음 bag으로 채워 보드를 완전히 비우는 것을 노리는 오프너입니다.',when:'미노 순서와 남은 공간을 함께 읽는 연습을 하고 싶을 때 좋습니다.',idea:'4줄 40칸을 채우려면 10미노가 필요합니다. 첫 7개를 놓은 뒤 남는 공간을 다음 미노들로 나눠 봅니다.',watch:'같은 모양으로 시작해도 다음 순서와 홀드에 따라 PC 가능 여부가 달라집니다. 모든 순서에서 성공하는 한 가지 배치는 없습니다.',flow:[
    {label:'첫 bag 준비',kind:'setup',title:'채울 공간을 남기기',text:'첫 7종을 놓으면서 마지막에 필요한 공간이 막히지 않도록 준비합니다.',check:'한 칸짜리 구멍이나 접근할 수 없는 공간을 만들지 마세요.'},
    {label:'다음 bag 읽기',kind:'setup',title:'남은 공간을 분할',text:'NEXT와 홀드를 보고 들어갈 미노와 순서를 생각합니다. 네 칸씩 나눠질 수 있어도 실제로 진입할 수 있는지도 확인합니다.',check:'면적과 모양, 진입 가능성을 따로 확인하세요.'},
    {label:'Perfect Clear',kind:'perfect',title:'줄 지우기 뒤 빈 보드',text:'마지막 줄을 지웠을 때 모든 블록이 없어져야 PC입니다. 단순히 4줄을 지우는 것만으로는 PC가 아닙니다.',check:'완성 후 블록이 남아 있는지 확인하세요.'},
  ],source:'https://harddrop.com/wiki/Perfect_Clear_Opener'},
];
export function getBuild(id){return buildLibrary.find(build=>build.id===id)||buildLibrary[0];}
export function buildHTML(id,index=0){
  const build=getBuild(id),step=build.flow[Math.max(0,Math.min(index,build.flow.length-1))];
  return `<div class="learn-article-top"><span class="eyebrow">BUILD LIBRARY</span><div class="build-tags">${build.tags.map(tag=>`<span>${tag}</span>`).join('')}</div></div><h2>${build.name}</h2><p class="build-summary">${build.summary}</p><div class="build-flow" aria-label="기술 진행 구조">${build.flow.map((item,i)=>`<button data-build-step="${i}" class="flow-step ${item.kind} ${i===index?'active':''}" aria-pressed="${i===index}"><small>0${i+1}</small><span>${item.label}</span></button>`).join('')}</div><p class="flow-caption">기술 진행 구조 · 실제 설치 형태는 미노 순서와 변형에 따라 달라집니다.</p><section class="build-current"><span class="eyebrow">STEP ${index+1} / ${build.flow.length}</span><h3>${step.title}</h3><p>${step.text}</p><div class="build-check">체크 · ${step.check}</div></section><div class="build-step-controls"><button id="learn-prev" ${index===0?'disabled':''}>← 이전</button><button id="learn-next" ${index===build.flow.length-1?'disabled':''}>다음 →</button></div><div class="build-notes"><section><h3>핵심 원리</h3><p>${build.idea}</p></section><section><h3>언제 살펴볼까</h3><p>${build.when}</p></section><section><h3>놓치기 쉬운 점</h3><p>${build.watch}</p></section></div><div class="build-actions"><button data-build-rules="${id==='pco'?'perfect':'tspin'}">관련 규칙 가이드북 ↗</button><a href="${build.source}" target="_blank" rel="noopener noreferrer">오프너 더 보기 ↗</a></div>`;
}
