import {shapes,colors,emptyBoard,shuffledBag,collides,clearRows,validBoard,rotateMatrix,trimMatrix,occupiedCells,samePlacement,stampShape,rotatedPiece,isTSpin} from './game.js?v=4';
import {defaults,normalizeHandling,HorizontalRepeat,fallInterval,actionKey} from './handling.js?v=4';
import {isLesson,makeLesson} from './lessons.js?v=4';
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
// Decorative mosaics use the same palette as the playable board.
function artGrid(el,w,h,type){const cells=Array(w*h).fill('');if(type==='hero'){const rows=['..........','..........','....TTT...','.....T....','..........','..........','..........','..........','LL....SS..','L...TSSOO.','L..TTTJOO.','ZZ..T.JJJ.','.ZZIIII...','SS.LLL.ZZ.','JSSOOLZZT.','JJJOOLTTT.'];rows.forEach((r,y)=>[...r].forEach((v,x)=>{if(v!=='.')cells[y*w+x]=v}))}else{const patterns={free:['........','........','...T....','..TTT...','........','SS..L...','.SS.L...','IIII.LL.'],skill:['........','...T....','..TTT...','........','JJ...ZZ.','.J...Z..','JJJ.JJJ.','IIIIIIII'],build:['........','...OO...','...OO...','........','L..T....','L.TTTSS.','LL..SS..','IIII....']};patterns[type].forEach((r,y)=>[...r].forEach((v,x)=>{if(v!=='.')cells[y*w+x]=v}))}el.style.setProperty('--cols',w);el.innerHTML=cells.map(t=>`<i${t?` style="--block:${colors[t]}" class="filled"`:''}></i>`).join('')}
artGrid($('#hero-grid'),10,16,'hero');$$('[data-art]').forEach(el=>artGrid(el,8,8,el.dataset.art));
let mode='free',board=emptyBoard(),piece,queue=[],hold=null,canHold=true;
let running=false,paused=false,over=false,lines=0,pieces=0,seconds=0,noticeTimer;
let lesson=null,lessonStep=0,round=0,completed=0,showHint=true;
let brushMode='shape',painting=false;
let paintColor='T',editorMatrix=trimMatrix(shapes.T),pointer=null;
let groups=emptyBoard().map(r=>r.map(()=>0)),groupId=1,history=[];
let handling={...defaults},softDrop=false,fallElapsed=0,groundElapsed=0,sessionElapsed=0;
const horizontal=new HorizontalRepeat();
const dialog=$('#practice'),canvas=$('#board'),ctx=canvas.getContext('2d');
try{handling=normalizeHandling(JSON.parse(localStorage.getItem('practris-handling'))||defaults);}catch{}
function releaseInputs(){horizontal.clear();softDrop=false;fallElapsed=0;}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('#toast').classList.remove('show'),2200);}
function mini(type,matrix=shapes[type]){
  const m=trimMatrix(matrix),w=m[0].length*17,h=m.length*17;
  return `<svg viewBox="0 0 ${w} ${h}" aria-label="${type} 미노">${m.flatMap((r,y)=>r.map((v,x)=>v?`<rect x="${x*17+1}" y="${y*17+1}" width="15" height="15" fill="${colors[type]}"/>`:'')).join('')}</svg>`;
}
function side(){
  $('#hold').innerHTML=hold?mini(hold):'—';$('#next').innerHTML=queue.slice(0,4).map(t=>mini(t)).join('');
  $('#lines').textContent=lines;$('#pieces').textContent=pieces;
  $('#time').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
}
function refill(){if(!isLesson(mode))while(queue.length<7)queue.push(...shuffledBag());}
function spawn(t){
  refill();const type=t||queue.shift();if(!type)return;
  piece={type,m:shapes[type].map(r=>[...r]),x:3,y:0,rot:0,lastRotation:false};refill();fallElapsed=0;groundElapsed=0;
  horizontal.cut(performance.now(),handling);
  if(collides(board,piece)){running=false;over=true;releaseInputs();overlay('GAME OVER','다시 시작');}
  side();
}
function overlay(title,button){$('#board-overlay').hidden=false;$('#overlay-title').textContent=title;$('#start').textContent=button;}
function updateGuide(message=''){
  if(!lesson)return;
  $('#lesson-title').textContent=lesson.title;$('#lesson-principle').textContent=lesson.principle;
  $('#completed').textContent=completed;
  const current=lesson.steps[lessonStep].target;$('#current-piece-guide').innerHTML=mini(current.type,current.m)+`<span>${current.type} · ${current.x+1}열부터</span>`;
  $('#lesson-steps').innerHTML=lesson.steps.map((step,i)=>`<li class="${i===lessonStep?'current':i<lessonStep?'done':''}" ${i===lessonStep?'aria-current="step"':''}>${step.text}</li>`).join('');
  const list=$('#lesson-steps'),activeStep=list.querySelector('[aria-current]');if(activeStep)list.scrollTop=Math.max(0,activeStep.offsetTop-list.clientHeight/2);
  $('#lesson-feedback').textContent=message||`${lessonStep+1} / ${lesson.steps.length} 단계`;
}
function loadLesson(){
  lesson=makeLesson(mode,round);lessonStep=0;board=lesson.board;queue=lesson.steps.map(s=>s.target.type);
  hold=null;canHold=true;over=false;spawn();updateGuide();draw();
}
function reset(){
  releaseInputs();running=false;paused=false;over=false;lines=0;pieces=0;seconds=0;sessionElapsed=0;round=0;completed=0;
  board=emptyBoard();queue=[];hold=null;canHold=true;history=[];groups=emptyBoard().map(r=>r.map(()=>0));groupId=1;pointer=null;lesson=null;
  if(isLesson(mode))loadLesson();else spawn();
  overlay('READY','시작 ▶');$('#board-overlay').hidden=mode==='editor';draw();
}
function configure(m){
  mode=m;showHint=true;$('#hint-toggle').setAttribute('aria-pressed','true');$('#hint-toggle').textContent='목표 표시 ON';const editor=m==='editor',skill=isLesson(m);
  $('#practice-title').textContent=editor?'빌드 에디터':skill?'스킬 연습':'자유 연습';
  $('#board-label').textContent=editor?'BUILD EDITOR':skill?'GUIDED PRACTICE':'FREE PLAY';
  $$('[data-switch]').forEach(b=>b.classList.toggle('active',b.dataset.switch===(skill?'t-design':m)));
  $('.lesson-picker').hidden=!skill;if(skill)$('#lesson').value=m;
  $('#lesson-guide').hidden=!skill;$('#editor-tools').hidden=!editor;$('#keyboard-help').hidden=editor;
  $('#pause').hidden=editor;$('.touch-controls').hidden=editor;
  reset();if(skill)start();
}
function open(m){applyHandling();configure(m);if(!dialog.open){dialog.showModal();document.body.style.overflow='hidden';}canvas.focus({preventScroll:true});}
function close(){running=false;releaseInputs();dialog.close();document.body.style.overflow='';}
$$('[data-open]').forEach(b=>b.onclick=()=>open(b.dataset.open));
$$('[data-switch]').forEach(b=>b.onclick=()=>{configure(b.dataset.switch);canvas.focus({preventScroll:true});});
$('.close-button').onclick=close;$('#back-home').onclick=close;
dialog.addEventListener('cancel',e=>{e.preventDefault();close();});$('#lesson').onchange=e=>{configure(e.target.value);canvas.focus({preventScroll:true});};
function start(){if(over)reset();running=true;paused=false;groundElapsed=0;$('#board-overlay').hidden=true;canvas.focus({preventScroll:true});draw();}
function pause(){if(mode==='editor'||!running||over)return;paused=!paused;releaseInputs();if(paused)overlay('PAUSED','계속 ▶');else start();}
function move(dx,dy){const p={...piece,x:piece.x+dx,y:piece.y+dy,lastRotation:false};if(collides(board,p))return false;piece=p;groundElapsed=0;draw();return true;}
function rotate(turns){
  if(mode==='editor'){
    if(paintColor==='erase'||brushMode==='cell')return;editorMatrix=trimMatrix(rotateMatrix(editorMatrix,turns));editorPreview();draw();return;
  }
  const p=rotatedPiece(board,piece,turns);if(p){piece=p;groundElapsed=0;horizontal.cut(performance.now(),handling);draw();}
}
function retryStep(message){
  releaseInputs();piece={type:lesson.steps[lessonStep].target.type,m:shapes[lesson.steps[lessonStep].target.type].map(r=>[...r]),x:3,y:0,rot:0,lastRotation:false};
  fallElapsed=0;groundElapsed=0;updateGuide(message);draw();
}
function lock(){
  if(isLesson(mode)&&(!samePlacement(piece,lesson.steps[lessonStep].target)||(lesson.steps[lessonStep].tspin&&!isTSpin(board,piece)))){
    retryStep(lesson.steps[lessonStep].tspin?'회전으로 진입하세요. ↓ → 회전 → ↓ → 회전 → SPACE.':'배치가 달라요. 밝은 목표 모양에 맞춰 다시 놓으세요.');return;
  }
  const placed=stampShape(board,piece);if(!placed){running=false;over=true;releaseInputs();overlay('GAME OVER','다시 시작');return;}
  const result=clearRows(placed);board=result.board;lines+=result.cleared;pieces++;canHold=true;
  if(isLesson(mode)){
    lessonStep++;
    if(lessonStep===lesson.steps.length){completed++;round++;toast(`완료 ${completed} · 다음 설계`);loadLesson();}
    else{spawn();updateGuide('좋아요. 다음 배치를 이어가세요.');}
  }else{if(result.cleared)toast(board.every(r=>r.every(t=>!t))?'PERFECT CLEAR':`${result.cleared}줄 클리어`);spawn();}
  side();draw();
}
function block(x,y,type,alpha=1){ctx.globalAlpha=alpha;ctx.fillStyle=colors[type];ctx.fillRect(x*30+2,y*30+2,26,26);ctx.fillStyle='#ffffff30';ctx.fillRect(x*30+3,y*30+2,24,2);ctx.globalAlpha=1;}
function outline(p,color){ctx.strokeStyle=color;ctx.lineWidth=2;for(const [x,y] of occupiedCells(p))ctx.strokeRect(x*30+3,y*30+3,24,24);}
function draw(){
  ctx.fillStyle='#0b0e14';ctx.fillRect(0,0,300,600);ctx.strokeStyle='#ffffff09';ctx.lineWidth=1;
  for(let x=0;x<10;x++)for(let y=0;y<20;y++)ctx.strokeRect(x*30,y*30,30,30);
  board.forEach((r,y)=>r.forEach((t,x)=>{if(t)block(x,y,t);}));
  if(mode==='editor'){
    if(pointer&&paintColor!=='erase'){
      const p={type:paintColor,m:brushMode==='cell'?[[1]]:editorMatrix,...pointer},valid=!collides(board,p);
      for(const [x,y] of occupiedCells(p))if(x>=0&&x<10&&y>=0&&y<20)block(x,y,paintColor,.45);
      outline(p,valid?'#d5ff70':'#ff718d');
    }
    return;
  }
  if(lesson&&showHint){
    for(let i=lesson.steps.length-1;i>=lessonStep;i--){
      const p=lesson.steps[i].target,current=i===lessonStep;
      for(const [x,y] of occupiedCells(p))block(x,y,p.type,current?.28:.08);
      outline(p,current?'#d5ff70':colors[p.type]+'55');
      const [x,y]=occupiedCells(p)[0];ctx.font='12px monospace';ctx.fillStyle=current?'#ffffff':'#9caeca';ctx.fillText(String(i+1),x*30+10,y*30+20);
    }
  }
  if(piece&&!over){let ghost={...piece};while(!collides(board,{...ghost,y:ghost.y+1}))ghost.y++;
    for(const [x,y] of occupiedCells(ghost))block(x,y,piece.type,.15);
    for(const [x,y] of occupiedCells(piece))block(x,y,piece.type);
  }
}
function key(k){
  if(k==='Escape'){pause();return;}
  if(k==='r'){reset();return;}
  if(mode==='editor'){
    if('tioszjl'.includes(k)&&k.length===1){selectMino(k.toUpperCase());return;}
    if(k==='b'){setBrushMode(brushMode==='cell'?'shape':'cell');return;}
    if(['ArrowUp','x','q','a'].includes(k))rotate(k==='a'?2:k==='q'?-1:1);return;
  }
  if(k==='Enter'){start();return;}
  if(!running||paused||over)return;
  if(k==='ArrowLeft')move(-1,0);if(k==='ArrowRight')move(1,0);
  if(k==='ArrowDown')move(0,1);
  if(k==='ArrowUp'||k==='x')rotate(1);if(k==='z')rotate(-1);if(k==='a')rotate(2);
  if(k===' '){while(move(0,1)){}lock();}
  if((k==='c'||k==='Shift')&&canHold){
    const prior=hold;hold=piece.type;spawn(prior||(isLesson(mode)?lesson.steps[lessonStep].target.type:undefined));canHold=false;draw();
  }
}
function active(){return dialog.open&&running&&!paused&&!over&&mode!=='editor';}
const blockedKeys=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' ','Escape','Shift'];
document.addEventListener('keydown',e=>{
  if(!dialog.open||(e.target instanceof Element&&e.target.matches('select,input,textarea'))||e.ctrlKey||e.metaKey||e.altKey)return;
  const k=actionKey(e);
  if(blockedKeys.includes(k))e.preventDefault();
  if(e.repeat)return;
  if(e.target.tagName==='BUTTON'&&k==='Enter')return;
  if(!running&&!over&&mode!=='editor'&&['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' ','a','c','x','z','Shift'].includes(k))start();
  if(active()&&(k==='ArrowLeft'||k==='ArrowRight')){
    const dir=horizontal.down(k==='ArrowLeft'?-1:1,performance.now(),handling);if(dir)move(dir,0);return;
  }
  if(active()&&k==='ArrowDown'){softDrop=true;fallElapsed=0;if(handling.sdf==='instant'){while(move(0,1)){}}else move(0,1);return;}
  key(k);
});
document.addEventListener('keyup',e=>{
  const k=actionKey(e);
  if(k==='ArrowDown'){softDrop=false;fallElapsed=0;}
  if(k==='ArrowLeft'||k==='ArrowRight'){
    const dir=horizontal.up(k==='ArrowLeft'?-1:1,performance.now(),handling);if(dir&&active())move(dir,0);
  }
});
window.addEventListener('blur',()=>{releaseInputs();if(active())pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){releaseInputs();if(active())pause();}});
$$('[data-key]').forEach(b=>b.onclick=()=>key(b.dataset.key));
$('#start').onclick=start;$('#pause').onclick=pause;$('#reset').onclick=reset;
$('#hint-toggle').onclick=()=>{showHint=!showHint;$('#hint-toggle').setAttribute('aria-pressed',String(showHint));$('#hint-toggle').textContent=`목표 표시 ${showHint?'ON':'OFF'}`;draw();};
$('#retry-step').onclick=()=>retryStep('현재 단계를 다시 시작합니다.');

// Persist handling values locally; changing settings releases any held inputs.
function renderHandling(){for(const k of ['arr','das','dcd','sdf'])$('#'+k).value=handling[k];}
function saveHandling(){releaseInputs();try{localStorage.setItem('practris-handling',JSON.stringify(handling));$('#settings-status').textContent='저장됨';}catch{$('#settings-status').textContent='현재 세션에 적용됨';}}
renderHandling();
function applyHandling(){
  handling=normalizeHandling(Object.fromEntries(['arr','das','dcd','sdf'].map(k=>[k,$('#'+k).value===''?handling[k]:$('#'+k).value])));renderHandling();saveHandling();
}
for(const k of ['arr','das','dcd','sdf']){
  $('#'+k).addEventListener('input',e=>{if(e.target.value==='')return;handling=normalizeHandling({...handling,[k]:e.target.value});saveHandling();});
  $('#'+k).addEventListener('change',applyHandling);
}
$('#handling-apply').onclick=applyHandling;
$('#handling-reset').onclick=()=>{handling={...defaults};renderHandling();saveHandling();};
$('#settings-toggle').onclick=()=>{const expanded=$('#handling-settings').hidden;$('#handling-settings').hidden=!expanded;$('#settings-toggle').setAttribute('aria-expanded',String(expanded));releaseInputs();};

// Editor stamps complete tetrominoes. Each stamp keeps an ID for whole-piece deletion.
function snapshot(){return {board:board.map(r=>[...r]),groups:groups.map(r=>[...r])};}
function remember(){history.push(snapshot());if(history.length>100)history.shift();}
function editorPreview(){$('#editor-preview').innerHTML=paintColor==='erase'?'⌫':brushMode==='cell'?`<span style="color:${colors[paintColor]}">■</span>`:mini(paintColor,editorMatrix);}
function setBrushMode(value){if(value==='cell'&&paintColor==='erase')paintColor='T';brushMode=value;$('#brush-shape').setAttribute('aria-pressed',String(value==='shape'));$('#brush-cell').setAttribute('aria-pressed',String(value==='cell'));editorPreview();draw();}
function selectMino(type){paintColor=type;if(type!=='erase'){editorMatrix=trimMatrix(shapes[type]);setBrushMode('shape');}$$('[data-color]').forEach(el=>el.classList.toggle('selected',el.dataset.color===type));editorPreview();draw();canvas.focus({preventScroll:true});}
$('#palette').innerHTML=Object.keys(shapes).map(t=>`<button aria-label="${t} 미노" data-color="${t}" class="${t==='T'?'selected':''}">${mini(t)}<span>${t}</span></button>`).join('')+'<button data-color="erase" aria-label="지우개">⌫</button>';
$$('[data-color]').forEach(b=>b.onclick=()=>selectMino(b.dataset.color));
$('#brush-shape').onclick=()=>{setBrushMode('shape');canvas.focus({preventScroll:true});};$('#brush-cell').onclick=()=>{if(paintColor==='erase')paintColor='T';setBrushMode('cell');canvas.focus({preventScroll:true});};
editorPreview();
$('#editor-left').onclick=()=>rotate(-1);$('#editor-right').onclick=()=>rotate(1);$('#editor-flip').onclick=()=>rotate(2);
$('#undo').onclick=()=>{if(!history.length)return toast('취소할 배치 없음');const prior=history.pop();board=prior.board;groups=prior.groups;draw();};
function pointerCell(e){const r=canvas.getBoundingClientRect();return {x:Math.floor((e.clientX-r.left)/r.width*10),y:Math.floor((e.clientY-r.top)/r.height*20)};}
function eraseAt({x,y}){
  if(x<0||x>=10||y<0||y>=20||!board[y][x])return;
  remember();const id=groups[y][x];
  for(let yy=0;yy<20;yy++)for(let xx=0;xx<10;xx++)if(brushMode==='shape'&&id?groups[yy][xx]===id:(xx===x&&yy===y)){board[yy][xx]=null;groups[yy][xx]=0;}
  draw();
}
function paintAt(e){
  pointer=pointerCell(e);const {x,y}=pointer;if(x<0||x>=10||y<0||y>=20)return;
  if(e.buttons===2||e.button===2||paintColor==='erase'){eraseAt(pointer);return;}
  if(brushMode==='cell'){
    if(board[y][x]===paintColor)return;remember();board[y][x]=paintColor;groups[y][x]=groupId++;draw();return;
  }
  const p={type:paintColor,m:editorMatrix,...pointer},next=stampShape(board,p);
  if(!next){toast('겹치거나 보드를 벗어난 배치');draw();return;}
  remember();board=next;for(const [xx,yy] of occupiedCells(p))groups[yy][xx]=groupId;groupId++;draw();
}
canvas.onpointermove=e=>{if(mode==='editor'){pointer=pointerCell(e);if(painting&&brushMode==='cell')paintAt(e);draw();}};
canvas.onpointerleave=()=>{if(!painting)pointer=null;if(mode==='editor')draw();};
canvas.onpointerdown=e=>{
  canvas.focus({preventScroll:true});
  if(mode!=='editor')return;e.preventDefault();painting=true;canvas.setPointerCapture(e.pointerId);paintAt(e);
};
canvas.onpointerup=canvas.onpointercancel=()=>{painting=false;};
canvas.oncontextmenu=e=>e.preventDefault();
$('#save').onclick=()=>{try{localStorage.setItem('practris-build',JSON.stringify({version:2,board,groups}));toast('저장 완료');}catch{toast('저장 공간을 사용할 수 없습니다.');}};
$('#load').onclick=()=>{
  try{
    const data=JSON.parse(localStorage.getItem('practris-build')),saved=Array.isArray(data)?data:data?.board;
    if(!validBoard(saved))return toast('저장된 빌드 없음');
    const ids=data?.groups,validIds=Array.isArray(ids)&&ids.length===20&&ids.every((r,y)=>Array.isArray(r)&&r.length===10&&r.every((v,x)=>Number.isSafeInteger(v)&&v>=0&&v<1000000&&(saved[y][x]?v>0:v===0)));
    remember();board=saved;groups=validIds?ids:emptyBoard().map(r=>r.map(()=>0));groupId=1+Math.max(...groups.flat());pointer=null;draw();toast('불러오기 완료');
  }catch{toast('빌드를 불러올 수 없습니다.');}
};
$('#try').onclick=()=>{const saved=board.map(r=>[...r]);configure('free');board=saved;spawn();if(!over)start();draw();};

let lastFrame=performance.now();
function frame(now){
  const dt=Math.min(100,now-lastFrame);lastFrame=now;
  if(active()){
    sessionElapsed+=dt;const elapsed=Math.floor(sessionElapsed/1000);if(elapsed!==seconds){seconds=elapsed;side();}
    const repeat=horizontal.tick(now,handling);for(let i=0;i<repeat.steps;i++)if(!move(repeat.direction,0))break;
    if(!isLesson(mode)||softDrop){
      const interval=fallInterval(handling,softDrop);fallElapsed+=dt;
      if(interval===0){while(move(0,1)){}fallElapsed=0;}
      else while(fallElapsed>=interval){fallElapsed-=interval;if(!move(0,1)){fallElapsed=0;break;}}
    }
    if(!isLesson(mode)&&collides(board,{...piece,y:piece.y+1})){
      groundElapsed+=dt;if(groundElapsed>=450)lock();
    }else groundElapsed=0;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
