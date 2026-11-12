import {shapes,colors,emptyBoard,shuffledBag,collides,clearRows,validBoard,rotateMatrix,trimMatrix,occupiedCells,samePlacement,stampShape,rotatedPiece,isTSpin,classifyTSpin} from './game.js?v=13';
import {defaults,normalizeHandling,HorizontalRepeat,fallInterval,actionKey} from './handling.js?v=13';
import {isLesson,makeLesson} from './lessons.js?v=13';
import {guideHTML,contextGuideHTML,exampleState,boardDiagram} from './guides.js?v=13';
import {enumeratePlacements,spawnPiece} from './placements.js?v=13';
import {makeCourse,courseInfo,courseInstruction,listCourseVariants} from './courses.js?v=13';
import {planBagCourse} from './course-planner.js?v=13';
import {courseGoal,advanceCourseGoal} from './course-goals.js?v=13';
import {perfectMethods,isPerfectMethod} from './perfect-methods.js?v=13';
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
// Decorative mosaics use the same palette as the playable board.
function artGrid(el,w,h,type){const cells=Array(w*h).fill('');if(type==='hero'){const rows=['..........','..........','....TTT...','.....T....','..........','..........','..........','..........','LL....SS..','L...TSSOO.','L..TTTJOO.','ZZ..T.JJJ.','.ZZIIII...','SS.LLL.ZZ.','JSSOOLZZT.','JJJOOLTTT.'];rows.forEach((r,y)=>[...r].forEach((v,x)=>{if(v!=='.')cells[y*w+x]=v}))}else{const patterns={free:['........','........','...T....','..TTT...','........','SS..L...','.SS.L...','IIII.LL.'],skill:['........','...T....','..TTT...','........','JJ...ZZ.','.J...Z..','JJJ.JJJ.','IIIIIIII'],build:['........','...OO...','...OO...','........','L..T....','L.TTTSS.','LL..SS..','IIII....']};patterns[type].forEach((r,y)=>[...r].forEach((v,x)=>{if(v!=='.')cells[y*w+x]=v}))}el.style.setProperty('--cols',w);el.innerHTML=cells.map(t=>`<i${t?` style="--block:${colors[t]}" class="filled"`:''}></i>`).join('')}
artGrid($('#hero-grid'),10,16,'hero');$$('[data-art]').forEach(el=>artGrid(el,8,8,el.dataset.art));
let mode='free',board=emptyBoard(),piece,queue=[],hold=null,canHold=true,drawn=0;
let usedLayouts=new Set(),pcHistory=[],pcPlaced=0,pcPatternStep=0,pcPatternOn=true,pcPatternShown=false;
let courseDeck=[],courseDeckId='',courseTarget=null,courseGoalState={attackIndex:0,skimRows:0},courseOffPlan=false;
let activeVariantId=null,courseTimer=null,courseWorker=null,courseJob=0,coursePending=false,courseCompleted=0,courseRound=0,courseSeed=1;
let activeCourseId='tki',course=null,courseIndex=0,courseDone=false,courseHistory=[],courseShown=true,courseMistakes=0;
let bookResume=false,bookTopic='basics',bookExample=null,exampleIndex=0;
let running=false,paused=false,over=false,lines=0,pieces=0,seconds=0,noticeTimer;
let lesson=null,lessonStep=0,round=0,completed=0,showHint=true,sessionSeed=Date.now()>>>0;
let brushMode='shape',painting=false;
let paintColor='T',editorMatrix=trimMatrix(shapes.T),pointer=null;
let groups=emptyBoard().map(r=>r.map(()=>0)),groupId=1,history=[];
let handling={...defaults},softDrop=false,fallElapsed=0,groundElapsed=0,sessionElapsed=0;
const horizontal=new HorizontalRepeat();
const analysis=$('#pc-analysis'),book=$('#guidebook'),dialog=$('#practice'),canvas=$('#board'),ctx=canvas.getContext('2d');
try{handling=normalizeHandling(JSON.parse(localStorage.getItem('practris-handling'))||defaults);}catch{}
function releaseInputs(){horizontal.clear();softDrop=false;fallElapsed=0;}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('#toast').classList.remove('show'),2200);}
function mini(type,matrix=shapes[type]){
  const m=trimMatrix(matrix),w=m[0].length*17,h=m.length*17;
  return `<svg viewBox="0 0 ${w} ${h}" aria-label="${type} 미노">${m.flatMap((r,y)=>r.map((v,x)=>v?`<rect x="${x*17+1}" y="${y*17+1}" width="15" height="15" fill="${colors[type]}"/>`:'')).join('')}</svg>`;
}
function side(){
  $('#hold').innerHTML=hold?mini(hold):'—';$('#next').innerHTML=queue.slice(0,5).map(t=>mini(t)).join('');$('#bag-label').textContent=`7-BAG · ${Math.max(1,Math.ceil(drawn/7))}`;
  $('#lines').textContent=lines;$('#pieces').textContent=pieces;
  $('#time').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
}
function adaptivePractice(){return mode==='perfect'||mode==='stack63';}
function refill(){while(queue.length<7)queue.push(...shuffledBag());}
function spawn(t){
  refill();const type=t||queue.shift();if(!type)return;if(!t)drawn++;
  piece={type,m:shapes[type].map(r=>[...r]),x:3,y:0,rot:0,lastRotation:false};refill();fallElapsed=0;groundElapsed=0;
  horizontal.cut(performance.now(),handling);
  if(collides(board,piece)){running=false;over=true;releaseInputs();overlay('GAME OVER','다시 시작');}
  side();if(adaptivePractice()&&$('#pc-auto').checked)requestPCAnalysis(false);
}
function overlay(title,button){$('#board-overlay').hidden=false;$('#overlay-title').textContent=title;$('#start').textContent=button;}
function updateGuide(message=''){
  if(!lesson)return;
  $('#challenge-name').textContent=lesson.title;$('#progress').textContent=adaptivePractice()?`${pcPlaced}개 배치 · ${mode==='stack63'?'4줄 클리어':'완료'} ${completed}`:`${lessonStep+1}/${lesson.steps.length} · 완료 ${completed}`;
  if(adaptivePractice()){ $('#pc-undo').disabled=pcHistory.length===0;$('#pc-hint').disabled=over;$('#pc-mode-label').textContent=$('#pc-auto').checked?(pcPlaced===0?'첫 미노 · 자동 추천':'현재 보드 · 자동 추천'):'현재 보드 · 후보 보기'; }
  updatePCMethod();
  if(message&&message!=='좋아요. 다음 배치를 이어가세요.')toast(message);
}

function loadLesson(){
  clearPCAnalysis();
  if(mode==='stack63')lesson={id:'stack63-free',title:'6–3 STACKING',board:emptyBoard(),queue:[]};
  else for(let attempt=0;attempt<64;attempt++){lesson=makeLesson(mode,round,{kind:'mixed',seed:sessionSeed,attempt,method:$('#pc-method').value,stage:$('#pc-stage').value});if(!usedLayouts.has(lesson.id))break;}
  usedLayouts.add(lesson.id);drawn=lesson.bagOffset||0;pcPatternStep=0;pcPatternOn=true;pcPatternShown=false;lessonStep=0;pcHistory=[];pcPlaced=0;showHint=!adaptivePractice();board=lesson.board;queue=[...lesson.queue];
  hold=null;canHold=true;over=false;spawn();updateGuide();draw();
}
function reset(){
  cancelCourseWork();clearPCAnalysis();usedLayouts=new Set();releaseInputs();running=false;paused=false;over=false;lines=0;pieces=0;seconds=0;sessionElapsed=0;round=0;completed=0;drawn=0;
  board=emptyBoard();queue=[];hold=null;canHold=true;history=[];groups=emptyBoard().map(r=>r.map(()=>0));groupId=1;pointer=null;lesson=null;
  if(mode==='build'){
    if(!activeVariantId){prepareCourseDeck(activeCourseId);activeVariantId=courseDeck.shift();}
    course=makeCourse(activeCourseId,activeVariantId);activeVariantId=course.variantId;
    if($('#course-style').value==='bag'){planCurrentCourse();return;}
    beginCourse(course);return;
  }
  if(isLesson(mode))loadLesson();else spawn();
  overlay('READY','시작 ▶');$('#board-overlay').hidden=mode==='editor';draw();
}
function courseDoneOrInactive(){return mode==='build'&&courseDone;}
function configure(m){
  clearPCAnalysis();mode=m;if(m!=='build'&&location.hash.startsWith('#learn'))window.history.replaceState(null,'','#home');sessionSeed=crypto.getRandomValues(new Uint32Array(1))[0];usedLayouts=new Set();showHint=!adaptivePractice();const editor=m==='editor',skill=isLesson(m);
  $('#practice-title').textContent=m==='build'?'직접 쌓는 빌드 학습':editor?'빌드 에디터':skill?'스킬 연습':'자유 연습';
  $('#board-label').textContent=m==='build'?'BUILD LESSON':editor?'BUILD EDITOR':skill?'GUIDED PRACTICE':'FREE PLAY';
  $$('[data-switch]').forEach(b=>b.classList.toggle('active',b.dataset.switch===(skill?'tspin':m)));
  $('.course-picker').hidden=m!=='build';$('#build-coach').hidden=m!=='build';$('.practice-body').classList.toggle('learning',m==='build');if(m==='build')$('#build-course').value=activeCourseId;
  $('.perfect-picker').hidden=m!=='perfect';$('.practice-body').classList.toggle('perfect-mode',m==='perfect');$('#pc-stage').disabled=!isPerfectMethod($('#pc-method').value);$('#pc-method-tools').hidden=m!=='perfect'||!isPerfectMethod($('#pc-method').value);$('.lesson-picker').hidden=!skill;if(skill)$('#lesson').value=m;
  $('#challenge-status').hidden=!skill;$('#editor-tools').hidden=!editor;$('#keyboard-help').hidden=editor;
  $('#pc-tools').hidden=!adaptivePractice();$('#pc-example').hidden=m!=='perfect';$('#stack-combos').hidden=m!=='stack63';$('#right-combo').hidden=m!=='stack63';$('#analysis-title').textContent=m==='stack63'?'6–3 배치 후보':'다음 배치 경우';$('.analysis-scope').textContent=m==='stack63'?'현재 보드와 홀드, 다음 한 수를 비교합니다. 7열 우물·빈칸·양쪽 높이 균형을 기준으로 추천합니다.':'보이는 NEXT 5개와 홀드로 추천을 갱신합니다. PC 경로가 확인되지 않으면 빈칸·높이 기준으로 추천합니다.';$('#next-challenge').hidden=!skill;$('#pause').hidden=editor;$('.touch-controls').hidden=editor;
  reset();if(skill)start();
}
function open(m){applyHandling();configure(m);if(!dialog.open){dialog.showModal();document.body.style.overflow='hidden';}canvas.focus({preventScroll:true});}
function close(){cancelCourseWork();if(mode==='build'&&location.hash.startsWith('#learn'))window.history.replaceState(null,'','#home');clearPCAnalysis();running=false;releaseInputs();dialog.close();document.body.style.overflow='';}
$$('[data-open]').forEach(b=>b.onclick=()=>open(b.dataset.open));
$$('[data-switch]').forEach(b=>b.onclick=()=>{configure(b.dataset.switch);canvas.focus({preventScroll:true});});
$('.close-button').onclick=close;$('#back-home').onclick=close;
dialog.addEventListener('cancel',e=>{e.preventDefault();close();});$('#lesson').onchange=e=>{configure(e.target.value);canvas.focus({preventScroll:true});};
$('#pc-method').onchange=$('#pc-stage').onchange=()=>{configure('perfect');canvas.focus({preventScroll:true});};
function start(){if(coursePending)return;if(mode==='build'&&!piece&&!courseDone){reset();return;}if(mode==='build'&&courseDone){reset();return;}if(over)reset();running=true;paused=false;groundElapsed=0;$('#board-overlay').hidden=true;canvas.focus({preventScroll:true});draw();}
function pause(){if(mode==='editor'||!running||over)return;paused=!paused;releaseInputs();if(paused)overlay('PAUSED','계속 ▶');else start();}
function move(dx,dy){const p={...piece,x:piece.x+dx,y:piece.y+dy,lastRotation:false};if(collides(board,p))return false;piece=p;groundElapsed=0;draw();return true;}
function rotate(turns){
  if(mode==='editor'){
    if(paintColor==='erase'||brushMode==='cell')return;editorMatrix=trimMatrix(rotateMatrix(editorMatrix,turns));editorPreview();draw();return;
  }
  const p=rotatedPiece(board,piece,turns);if(p){piece=p;groundElapsed=0;horizontal.cut(performance.now(),handling);draw();}
}
function cancelCourseWork(){$('#start').disabled=false;clearTimeout(courseTimer);courseTimer=null;courseWorker?.terminate();courseWorker=null;courseJob++;coursePending=false;}
function beginCourse(next){
  course=next;courseTarget=courseGoal(course);courseGoalState={attackIndex:0,skimRows:0};courseOffPlan=false;$('#course-hint').disabled=false;coursePending=false;courseIndex=0;courseDone=false;courseHistory=[];courseMistakes=0;courseShown=!course.bagPractice;
  board=structuredClone(course.board);queue=[...course.queue];drawn=course.bagOffset||0;hold=null;canHold=true;over=false;paused=false;
  lines=0;pieces=0;running=true;spawn();$('#board-overlay').hidden=true;updateCourse();draw();canvas.focus({preventScroll:true});
}
function planCurrentCourse(){
  coursePending=true;courseDone=false;courseIndex=0;courseShown=false;running=false;piece=null;board=structuredClone(course.board);draw();overlay('BAG 준비 중','계산 중…');$('#start').disabled=true;
  $('#course-hint').disabled=true;$('#course-route').hidden=true;$('#course-next').hidden=true;$('#course-again').hidden=true;$('#course-scope').textContent=`${course.name} · BAG 준비`;$('#course-feedback').textContent='현재 형태가 가능한 bag 과제를 준비합니다.';$('#course-undo').disabled=true;
  const id=++courseJob;courseWorker=new Worker(new URL('./course-worker.js?v=13',import.meta.url),{type:'module'});
  function failed(){if(id!==courseJob)return;coursePending=false;courseWorker?.terminate();courseWorker=null;$('#start').disabled=false;overlay('다시 준비','다시 시도');$('#course-feedback').textContent='과제를 준비하지 못했습니다. 다시 시작을 눌러주세요.';}
  courseWorker.onmessage=({data})=>{if(data.id!==courseJob||mode!=='build')return;courseWorker?.terminate();courseWorker=null;$('#start').disabled=false;if(data.error){failed();return;}beginCourse(data.course);};
  courseWorker.onerror=failed;courseWorker.postMessage({id,courseId:activeCourseId,variantId:activeVariantId,seed:courseSeed,round:courseRound});
}
function scheduleCourseNext(){
  clearTimeout(courseTimer);if(!courseDone||!$('#course-chain').checked)return;
  courseTimer=setTimeout(()=>{if(mode!=='build'||!courseDone||!dialog.open)return;if(book.open||document.hidden){scheduleCourseNext();return;}advanceCourse();},1800);
}
function advanceCourse(){
  const category=courseInfo[activeCourseId].category||'opener',ids=Object.keys(courseInfo).filter(id=>(courseInfo[id].category||'opener')===category);
  const nextId=courseDeck.length?activeCourseId:ids[(ids.indexOf(activeCourseId)+1)%ids.length];courseRound++;openBuild(nextId,null,true);
}
function courseGoalText(){if(courseTarget?.perfect)return '목표: 보드를 완전히 비우기';if(courseTarget?.rightWell)return '목표: 7열 I로 4줄 클리어';if(courseTarget?.attacks.length)return '다음 목표: '+courseTarget.attacks.slice(courseGoalState.attackIndex).map(s=>'T-spin '+s.toUpperCase()).join(' → ');return '목표: 선택한 토대 완성';}
function updateCourse(message=''){
  const instruction=courseOffPlan&&!courseDone?{title:'현재 지형에서 목표를 이어가세요.',why:courseGoalText()+' · 한 수 전으로 선택한 형태를 다시 설계할 수도 있습니다.'}:course.bagPractice&&!courseShown&&!courseDone?{title:'NEXT와 홀드로 배치 순서를 정하세요.',why:'현재 미노부터 쓸지, 홀드 미노를 먼저 쓸지 생각해 보세요. 목표 표시로 한 수씩 확인할 수 있습니다.'}:courseInstruction(course,courseIndex);
  $('#course-scope').textContent=`${course.name} · ${course.scope}`;
  $('#course-progress').textContent=courseOffPlan?`${courseDone?'완료 · ':''}${pieces}개 배치 · ${courseGoalText()}`:`${courseIndex} / ${course.steps.length}`;
  $('#course-bar').max=course.steps.length;$('#course-bar').value=courseIndex;
  $('#course-phase').textContent=courseDone?'COMPLETE':course.steps[courseIndex].phase;
  $('#course-step-title').textContent=instruction.title;$('#course-why').textContent=instruction.why;
  $('#course-description').textContent=course.description;$('#course-benefit').textContent=course.benefit;
  $('#course-feedback').textContent=message;$('#course-session').textContent=`완료 ${courseCompleted} · 과제 ${courseRound+1}`;$('#course-bag-note').textContent=course.bagPractice?`${course.bagNote} · 현재 ${piece?.type||'완료'} · 홀드 ${hold||'—'}${!courseDone&&!courseOffPlan&&piece?.type!==course.steps[courseIndex]?.target.type?' · C/SHIFT로 '+course.steps[courseIndex].target.type+' 먼저 사용':''}`:'';
  $('#course-route').hidden=courseDone||courseOffPlan||(course.bagPractice&&!courseShown);
  if(!courseDone&&!courseOffPlan){const step=course.steps[courseIndex],moves=step.moves||enumeratePlacements(board,spawnPiece(step.target.type)).find(o=>samePlacement(o.p,step.target))?.moves||[];
    const route=[];for(const move of moves){if(route.at(-1)?.move===move)route.at(-1).count++;else route.push({move,count:1});}
    const keys={left:'←',right:'→',down:'↓',cw:'X',ccw:'Z',flip:'A'};
    $('#course-moves').textContent=(piece.type!==step.target.type?`홀드로 ${step.target.type} 선택 → `:'')+route.map(s=>keys[s.move]+(s.count>1?` ×${s.count}`:'')).join(' → ')+' → SPACE';
  }
  $('#course-undo').disabled=!courseHistory.length;$('#course-hint').hidden=courseDone||courseOffPlan;
  $('#course-hint').textContent=`목표 표시 ${courseShown?'ON':'OFF'}`;$('#course-hint').setAttribute('aria-pressed',String(courseShown));
  $('#course-again').hidden=!courseDone;$('#course-next').hidden=!courseDone;
}
function lockCourse(){
  if(coursePending||courseDone)return;
  const prior={board:board.map(r=>[...r]),queue:[...queue],hold,drawn,type:piece.type,lines,pieces,index:courseIndex,completed:courseCompleted,steps:structuredClone(course.steps),offPlan:courseOffPlan,goalState:{...courseGoalState}};
  if(course.bagPractice&&!courseOffPlan&&!samePlacement(piece,course.steps[courseIndex].target)){
    const remaining=course.steps.slice(courseIndex),phase=remaining[0].phase;
    const match=remaining.findIndex(s=>s.phase===phase&&s.target.type===piece.type&&samePlacement(s.target,piece));
    if(match>=0){const chosen=remaining[match],placed=stampShape(board,piece),result=placed&&clearRows(placed);
      if(result&&result.cleared===chosen.clear&&(!chosen.spin||classifyTSpin(board,piece,result.cleared)===chosen.spin)){
        const tail=remaining.filter((_,i)=>i!==match),planned=tail.length?planBagCourse({...course,board:result.board,steps:tail},queue,{initialHold:hold}):{steps:[]};
        if(planned)course.steps=[...course.steps.slice(0,courseIndex),chosen,...planned.steps];
      }
    }
  }
  const step=course.steps[courseIndex],placed=stampShape(board,piece),result=placed&&clearRows(placed);
  const matches=!courseOffPlan&&step&&piece.type===step.target.type&&samePlacement(piece,step.target)&&result&&result.cleared===step.clear&&(!step.spin||classifyTSpin(board,piece,result.cleared)===step.spin);
  if(!result){retryStep('보드를 벗어난 배치입니다.');return;}
  if(!course.bagPractice&&!matches){
    courseMistakes++;releaseInputs();spawn(piece.type);updateCourse(step.spin?'표시된 홈에 회전으로 진입해 확정하세요.':`목표 ${step.target.type}를 표시된 위치에 놓으세요.${piece.type!==step.target.type?' C/SHIFT로 홀드하세요.':''}`);draw();return;
  }
  const goal=advanceCourseGoal(courseTarget,courseGoalState,board,piece,result);courseGoalState=goal.state;
  const firstDeviation=course.bagPractice&&!matches&&!courseOffPlan;if(course.bagPractice&&!matches){courseOffPlan=true;courseShown=false;}
  courseHistory.push(prior);board=result.board;lines+=result.cleared;pieces++;if(matches)courseIndex++;canHold=true;releaseInputs();
  const complete=course.bagPractice?goal.complete:courseIndex===course.steps.length;
  if(complete){courseDone=true;courseIndex=course.steps.length;running=false;piece=null;courseCompleted++;scheduleCourseNext();}else spawn();
  updateCourse(firstDeviation?'배치를 유지했습니다. 선택한 형태와 다르므로 현재 지형의 목표를 이어가거나 한 수 전으로 돌아가세요.':goal.spin?`T-SPIN ${goal.spin.toUpperCase()}`:'');side();draw();
}
function retryStep(message){
  releaseInputs();piece={type:piece.type,m:shapes[piece.type].map(r=>[...r]),x:3,y:0,rot:0,lastRotation:false};
  fallElapsed=0;groundElapsed=0;updateGuide(message);draw();
}
function updatePCMethod(){
  const selected=mode==='perfect'&&lesson?.methodId;$('#pc-method-tools').hidden=!selected;if(!selected)return;
  const target=lesson.steps[pcPatternStep]?.target;
  $('#pc-method-status').textContent=pcPatternOn?`${lesson.methodName} · ${pcPatternStep}/${lesson.steps.length} · ${lesson.variantName}${target?' · 다음 형태 '+target.type:''}`:`${lesson.methodName} 형태에서 벗어남 · 현재 보드로 PC 추천을 이어갑니다.`;
  $('#pc-method-hint').disabled=!pcPatternOn||!target||over;$('#pc-method-hint').textContent=`방식 한 수 힌트 ${pcPatternShown?'ON':'OFF'}`;$('#pc-method-hint').setAttribute('aria-pressed',String(pcPatternShown));
}
function advancePCPattern(placed,result){
  if(!lesson?.methodId||!pcPatternOn)return;
  const step=lesson.steps[pcPatternStep];
  if(step&&placed.type===step.target.type&&samePlacement(placed,step.target)&&result.cleared===step.clear){pcPatternStep++;return;}
  const remaining=lesson.steps.slice(pcPatternStep),match=remaining.findIndex(s=>s.phase===remaining[0]?.phase&&s.target.type===placed.type&&samePlacement(s.target,placed)&&result.cleared===s.clear);
  if(match>=0){const tail=remaining.filter((_,i)=>i!==match),planned=tail.length?planBagCourse({...lesson,board:result.board,steps:tail},queue,{initialHold:hold}):{steps:[]};if(planned){lesson.steps=[...lesson.steps.slice(0,pcPatternStep),remaining[match],...planned.steps];pcPatternStep++;return;}}
  pcPatternOn=false;pcPatternShown=false;
}
function lock(){
  if(mode==='build'){lockCourse();return;}
  if(mode==='tspin'&&(piece.type!==lesson.steps[lessonStep].target.type||!samePlacement(piece,lesson.steps[lessonStep].target)||(lesson.steps[lessonStep].tspin&&classifyTSpin(board,piece,lesson.steps[lessonStep].clear)!==lesson.steps[lessonStep].spin))){
    retryStep(lesson.steps[lessonStep].tspin?'회전으로 진입하세요. ↓ → 회전 → ↓ → 회전 → SPACE.':'배치가 달라요. 밝은 목표 모양에 맞춰 다시 놓으세요.');return;
  }
  const undoState=adaptivePractice()?{board:board.map(r=>[...r]),type:piece.type,queue:[...queue],hold,drawn,lines,pieces,pcPlaced,lessonStep,completed,round,pcPatternStep,pcPatternOn,pcPatternShown,methodSteps:lesson?.methodId?structuredClone(lesson.steps):null}:null;

  const placed=stampShape(board,piece);if(!placed){running=false;over=true;releaseInputs();overlay('GAME OVER','다시 시작');return;}
  const result=clearRows(placed),spin=classifyTSpin(board,piece,result.cleared);if(mode==='perfect')advancePCPattern(piece,result);board=result.board;lines+=result.cleared;pieces++;canHold=true;
  if(adaptivePractice()){
    pcHistory.push(undoState);pcPlaced++;showHint=false;
    if(mode==='perfect'&&result.cleared&&board.every(row=>row.every(v=>v===null))){completed++;round++;toast('PERFECT CLEAR');loadLesson();}
    else{if(mode==='stack63'&&result.cleared===4){completed++;toast('6–3 · 4줄 클리어');}spawn();updateGuide();}
  }else if(isLesson(mode)){
    lessonStep++;
    if(lessonStep===lesson.steps.length){completed++;round++;toast(lesson.kind?`T-SPIN ${lesson.kind.toUpperCase()}`:`완료 ${completed}`);loadLesson();}
    else{spawn();updateGuide('좋아요. 다음 배치를 이어가세요.');}
  }else{if(result.cleared)toast(spin&&spin!=='mini'?`T-SPIN ${spin.toUpperCase()}`:board.every(r=>r.every(t=>!t))?'PERFECT CLEAR':`${result.cleared}줄 클리어`);spawn();}
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
  if(mode==='perfect'&&lesson?.methodId&&pcPatternOn&&pcPatternShown){const target=lesson.steps[pcPatternStep]?.target;if(target){for(const [x,y] of occupiedCells(target))block(x,y,target.type,.2);outline(target,'#86cfff');}}
  if(adaptivePractice()&&recommendedPlacement&&$('#pc-auto').checked){outline(recommendedPlacement,'#ffd77b');}
  if(mode==='build'&&course&&!courseDone&&!courseOffPlan&&courseShown){const target=course.steps[courseIndex].target;for(const [x,y] of occupiedCells(target))block(x,y,target.type,.25);outline(target,'#d5ff70');}
  if(lesson&&showHint&&!adaptivePractice()){
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
  if(mode==='build'&&coursePending)return;
  if(mode==='build'&&courseDone){if(k==='r')reset();if(k==='Enter')advanceCourse();return;}
  if(k==='Escape'){pause();return;}
  if(k==='r'){reset();return;}
  if(mode==='editor'){
    if(k==='b'){setBrushMode(brushMode==='cell'?'shape':'cell');return;}
    if(['ArrowUp','x','z','q','a'].includes(k))rotate(k==='a'?2:['z','q'].includes(k)?-1:1);return;
  }
  if(k==='Enter'){start();return;}
  if(!running||paused||over)return;
  if(k==='ArrowLeft')move(-1,0);if(k==='ArrowRight')move(1,0);
  if(k==='ArrowDown')move(0,1);
  if(k==='ArrowUp'||k==='x')rotate(1);if(k==='z')rotate(-1);if(k==='a')rotate(2);
  if(k===' '){while(move(0,1)){}lock();}
  if((k==='c'||k==='Shift')&&canHold){
    const prior=hold;hold=piece.type;spawn(prior||undefined);canHold=isLesson(mode)||mode==='build';if(mode==='build')updateCourse();draw();
  }
}
function active(){return !courseDoneOrInactive()&&dialog.open&&!book.open&&!analysis.open&&running&&!paused&&!over&&mode!=='editor';}
const blockedKeys=['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' ','Escape','Shift'];
document.addEventListener('keydown',e=>{
  if(coursePending||book.open||analysis.open||!dialog.open||(e.target instanceof Element&&e.target.matches('select,input,textarea'))||e.ctrlKey||e.metaKey||e.altKey)return;
  const k=actionKey(e);
  if(blockedKeys.includes(k))e.preventDefault();
  if(e.repeat)return;
  if(e.target.tagName==='BUTTON'&&k==='Enter')return;
  if(!running&&!over&&!courseDoneOrInactive()&&mode!=='editor'&&['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' ','a','c','x','z','Shift'].includes(k))start();
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
$('#next-challenge').onclick=()=>{releaseInputs();round++;loadLesson();start();};
$('#start').onclick=start;$('#pause').onclick=pause;$('#reset').onclick=reset;
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
    if((!isLesson(mode)&&mode!=='build')||softDrop){
      const interval=fallInterval(handling,softDrop);fallElapsed+=dt;
      if(interval===0){while(move(0,1)){}fallElapsed=0;}
      else while(fallElapsed>=interval){fallElapsed-=interval;if(!move(0,1)){fallElapsed=0;break;}}
    }
    if(!isLesson(mode)&&mode!=='build'&&collides(board,{...piece,y:piece.y+1})){
      groundElapsed+=dt;if(groundElapsed>=450)lock();
    }else groundElapsed=0;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);


// Optional perfect-clear help does not constrain the player's placements.
$('#pc-hint').onclick=openAnalysis;
$('#pc-undo').onclick=()=>{
  const prior=pcHistory.pop();if(!prior)return;
  board=prior.board;queue=prior.queue;hold=prior.hold;drawn=prior.drawn;lines=prior.lines;pieces=prior.pieces;pcPlaced=prior.pcPlaced;lessonStep=prior.lessonStep;completed=prior.completed;round=prior.round;pcPatternStep=prior.pcPatternStep;pcPatternOn=prior.pcPatternOn;pcPatternShown=prior.pcPatternShown;if(prior.methodSteps)lesson.steps=prior.methodSteps;
  piece={type:prior.type,m:shapes[prior.type].map(r=>[...r]),x:3,y:0,rot:0,lastRotation:false};
  canHold=true;over=false;running=true;paused=false;showHint=false;groundElapsed=0;releaseInputs();$('#board-overlay').hidden=true;side();updateGuide();if($('#pc-auto').checked)requestPCAnalysis(false);else clearPCAnalysis();draw();canvas.focus({preventScroll:true});
};
function renderExample(){
  if(!bookExample)return;const state=exampleState(bookExample,exampleIndex);
  $('#example-board').innerHTML=boardDiagram(state.board,state.target);
  $('#example-step').textContent=`${exampleIndex} / ${bookExample.steps.length}`;
  $('#example-caption').textContent=state.target?`${exampleIndex+1}번째 · ${state.target.type}를 표시된 공간에 배치`:'보드의 모든 블록을 비웠습니다.';
  $('#example-prev').disabled=exampleIndex===0;$('#example-next').disabled=exampleIndex===bookExample.steps.length;
}
function setBookTopic(topic){
  bookTopic=topic;$('#guide-content').innerHTML=topic==='current'?contextGuideHTML(currentGuideContext()):guideHTML(topic);
  $$('[data-guide-topic]').forEach(button=>{const selected=button.dataset.guideTopic===topic;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));});
  const contextualPerfect=topic==='current'&&dialog.open&&(mode==='perfect'||mode==='build'&&(courseTarget?.perfect));
  $('#book-example').hidden=topic!=='perfect'&&!contextualPerfect;
  if(topic==='perfect'||contextualPerfect){bookExample=mode==='build'&&contextualPerfect?course:mode==='perfect'&&lesson?lesson:makeLesson('perfect',0,{seed:42});exampleIndex=0;renderExample();}
}
function currentGuideContext(){return {mode:dialog.open?mode:'home',course,style:$('#course-style').value,index:courseIndex,pending:coursePending,offPlan:courseOffPlan,current:piece?.type,hold,method:perfectMethods[$('#pc-method').value],stage:$('#pc-stage').value,lesson,onPlan:pcPatternOn,brush:brushMode,paint:paintColor};}
function openBook(topic='current',example=false){

  bookResume=active();releaseInputs();if(bookResume)paused=true;
  setBookTopic(topic);book.showModal();book.scrollTop=0;if(!dialog.open)document.body.style.overflow='hidden';
  if(example)$('#book-example').scrollIntoView({block:'start'});
}
function closeBook(){book.close();if(!dialog.open)document.body.style.overflow='';if(bookResume&&dialog.open&&running&&!over){paused=false;canvas.focus({preventScroll:true});}bookResume=false;}
$$('[data-guide]').forEach(button=>button.onclick=()=>openBook(button.dataset.guide));
$$('[data-guide-topic]').forEach(button=>button.onclick=()=>setBookTopic(button.dataset.guideTopic));
$('#book-close').onclick=closeBook;book.addEventListener('cancel',event=>{event.preventDefault();closeBook();});
$('#example-prev').onclick=()=>{if(exampleIndex>0){exampleIndex--;renderExample();}};
$('#example-next').onclick=()=>{if(exampleIndex<bookExample.steps.length){exampleIndex++;renderExample();}};
$('#pc-method-hint').onclick=()=>{if(!lesson?.methodId||!pcPatternOn)return;pcPatternShown=!pcPatternShown;updatePCMethod();draw();canvas.focus({preventScroll:true});};
$('#pc-method-learn').onclick=()=>{const method=perfectMethods[$('#pc-method').value];if(method)openBuild(method.courseId);};
$('#pc-example').onclick=()=>openBook('current',true);

// Every placement reanalyzes the live board and visible queue; the gallery is optional.
let analysisWorker=null,analysisId=0,analysisResume=false,analysisResult=null,analysisSnapshot=null;
let recommendedPlacement=null,analysisKey='',analysisPlanIndex=0;
let analysisFilter='all',analysisPage=0,analysisSelected=0,analysisNextIndex=0;
const candidatePageSize=8;
function previewRow(board,p=null){const filled=board.findIndex(row=>row.some(Boolean));const targetTop=p?Math.min(...occupiedCells(p).map(([,y])=>y)):19;return Math.max(0,Math.min(12,filled<0?19:filled,targetTop)-1);}
function analysisChoices(){return (analysisResult?.options||[]).filter(option=>analysisFilter==='all'||option.source===analysisFilter);}
function renderAnalysis(){
  const options=analysisChoices(),pages=Math.max(1,Math.ceil(options.length/candidatePageSize));analysisPage=Math.min(analysisPage,pages-1);
  $('#analysis-options').innerHTML=options.slice(analysisPage*candidatePageSize,(analysisPage+1)*candidatePageSize).map(option=>`<button class="candidate-card ${option.id===analysisSelected?'active':''}" data-choice="${option.id}" aria-pressed="${option.id===analysisSelected}"><span>${option.id===analysisResult.recommendation?.id?'★ 추천 · ':''}${option.source==='hold'?'홀드':'현재'} ${option.type} · 후보 ${option.id+1}</span>${boardDiagram(analysisSnapshot.board,option.p,previewRow(analysisSnapshot.board,option.p))}<small>${mode==='stack63'?`우물 ${option.stackQuality.wellBlocks}칸 · 빈칸 ${option.stackQuality.holes} · 다음 ${option.nextCount}곳`:option.solution?`PC 경로 ${option.solution.length}수`: `다음 ${option.nextType||'—'} · ${option.nextCount}곳`}</small></button>`).join('')||'<p class="no-candidates">이 조건에서 놓을 수 있는 위치가 없습니다.</p>';
  $('#analysis-page').textContent=`${analysisPage+1} / ${pages}`;$('#analysis-prev').disabled=analysisPage===0;$('#analysis-next').disabled=analysisPage===pages-1;
  $$('[data-choice]').forEach(button=>button.onclick=()=>{analysisSelected=Number(button.dataset.choice);analysisNextIndex=0;analysisPlanIndex=0;renderAnalysis();});
  const option=analysisResult?.options.find(item=>item.id===analysisSelected);
  if(!option){$('#analysis-detail').innerHTML='';return;}
  analysisNextIndex=Math.max(0,Math.min(analysisNextIndex,option.next.length-1));const next=option.next[analysisNextIndex];
  const route=[];for(const move of option.moves){const last=route.at(-1);if(last&&last.move===move)last.count++;else route.push({move,count:1});}
  const symbols={left:'←',right:'→',down:'↓',cw:'X',ccw:'Z',flip:'A'};
  const moves=route.map(step=>`${symbols[step.move]}${step.count>1?'×'+step.count:''}`).join(' ');
  $('#analysis-detail').innerHTML=`<h3>후보 ${option.id+1} · ${option.source==='hold'?'홀드 후 ':''}${option.type}</h3><p class="analysis-metrics">${option.cleared}줄 클리어${option.perfect?' · PERFECT CLEAR':''}</p><div class="analysis-preview-grid"><figure>${boardDiagram(analysisSnapshot.board,option.p,previewRow(analysisSnapshot.board,option.p))}<figcaption>이번 ${option.type} 배치</figcaption></figure><figure>${boardDiagram(option.after,next?.p||null,previewRow(option.after,next?.p))}<figcaption>${option.perfect&&mode!=='stack63'?'PC 완성':`다음 ${option.nextType||'—'} · ${option.nextCount}곳`}</figcaption></figure></div><div class="next-choice-controls"><button id="next-choice-prev" ${analysisNextIndex<=0?'disabled':''}>←</button><span>${next?`${analysisNextIndex+1} / ${option.nextCount}`:'0 / 0'}</span><button id="next-choice-next" ${analysisNextIndex>=option.next.length-1?'disabled':''}>→</button></div>${mode!=='stack63'&&option.nextPerfect?`<p class="next-pc">그다음 한 수에서 PC 완성: ${option.nextPerfect}곳</p>`:''}<details class="analysis-route"><summary>이번 후보의 조작 경로</summary><p>${option.source==='hold'?'C → ':''}${moves} → SPACE</p></details>`;
  if(mode==='stack63')$('#analysis-detail').insertAdjacentHTML('beforeend',`<p class="stack-metrics">7열 점유 ${option.stackQuality.wellBlocks}칸 · 내부 빈칸 ${option.stackQuality.holes}개 · 좌우 평균 높이 차 ${option.stackQuality.balance.toFixed(1)}</p>`);
  if(mode==='stack63')$('#analysis-detail').insertAdjacentHTML('beforeend',`<p class="stack-metrics">${comboText(option.rightCombo)}</p><p class="analysis-scope">3열 안의 공간을 채우는 조합 후보입니다. 사이의 미노를 왼쪽에 놓을 수 있는지 함께 판단하세요.</p>`);
  if(option.solution){
    analysisPlanIndex=Math.min(analysisPlanIndex,option.solution.length-1);
    const step=option.solution[analysisPlanIndex],before=analysisPlanIndex?option.solution[analysisPlanIndex-1].after:analysisSnapshot.board;
    $('#analysis-detail').insertAdjacentHTML('beforeend',`<section class="confirmed-route"><h4>확인된 PC 경로 · ${analysisPlanIndex+1} / ${option.solution.length}</h4>${boardDiagram(before,step.p,previewRow(before,step.p))}<p>${step.useHold?'홀드 후 ':''}${step.p.type} · ${step.cleared}줄 클리어</p><div class="next-choice-controls"><button id="plan-prev" ${analysisPlanIndex===0?'disabled':''}>←</button><button id="plan-next" ${analysisPlanIndex===option.solution.length-1?'disabled':''}>→</button></div></section>`);
    $('#plan-prev').onclick=()=>{analysisPlanIndex--;renderAnalysis();};$('#plan-next').onclick=()=>{analysisPlanIndex++;renderAnalysis();};
  }
  $('#next-choice-prev').onclick=()=>{if(analysisNextIndex>0){analysisNextIndex--;renderAnalysis();}};
  $('#next-choice-next').onclick=()=>{if(analysisNextIndex<option.next.length-1){analysisNextIndex++;renderAnalysis();}};
}
function renderAnalysisFilters(){
  const options=analysisResult.options,holdChoice=options.find(option=>option.source==='hold');
  const filters=[['all',`전체 ${options.length}`],['current',`현재 ${analysisSnapshot.current.type} · ${analysisResult.counts.current||0}`]];
  if(analysisResult.counts.hold!==undefined)filters.push(['hold',`홀드 ${holdChoice?.type||analysisSnapshot.hold||analysisSnapshot.queue[0]} · ${analysisResult.counts.hold}`]);
  $('#analysis-filters').innerHTML=filters.map(([value,label])=>`<button data-analysis-filter="${value}" class="${analysisFilter===value?'active':''}" aria-pressed="${analysisFilter===value}">${label}</button>`).join('');
  $$('[data-analysis-filter]').forEach(button=>button.onclick=()=>{analysisFilter=button.dataset.analysisFilter;analysisPage=0;analysisSelected=analysisChoices()[0]?.id??-1;analysisNextIndex=0;renderAnalysisFilters();renderAnalysis();});
}
function clearPCAnalysis(){
  analysisId++;analysisWorker?.terminate();analysisWorker=null;analysisResult=null;analysisSnapshot=null;analysisKey='';recommendedPlacement=null;
  $('#right-combo').textContent='';$('#pc-recommendation').textContent='';$('#pc-hint').textContent='다음 배치 경우';
}
function methodSnapshot(){
  if(mode!=='perfect'||!lesson?.methodId)return null;const remaining=lesson.steps.slice(pcPatternStep),targets=[];
  for(const step of remaining){if(step.phase!==remaining[0]?.phase)break;targets.push({target:step.target,clear:step.clear});if(step.clear)break;}
  return {id:lesson.methodId,name:lesson.methodName,onPlan:pcPatternOn,expected:remaining[0]?{target:remaining[0].target,clear:remaining[0].clear}:null,targets};
}
function snapshotKey(snapshot){return JSON.stringify([mode,snapshot.board,snapshot.current.type,snapshot.current.x,snapshot.current.y,snapshot.current.rot,snapshot.queue.slice(0,5),snapshot.hold,snapshot.canHold,snapshot.method]);}
function recommendationText(){
  const r=analysisResult?.recommendation;if(!r)return '놓을 수 있는 후보가 없습니다.';
  if(mode==='stack63')return r.reason==='tetris'?'4줄 클리어 추천':'6–3 추천 · 우물·높이 균형·3열 조합';
  const context=analysisResult.context,prefix=context?.status==='off-plan'?'형태 이탈 · 공통 PC 추천 · ':context?.status==='unavailable'?'선택 형태 후보 없음 · 공통 PC 추천 · ':'';
  if(r.reason==='method'||r.reason==='method-pc')return `${context.methodName} 형태 기준${r.reason==='method-pc'?' · PC 경로 '+r.steps+'수':' · PC 경로 미확인'}`;
  return prefix+(r.reason==='pc'?`PC 경로 확인 · ${r.steps}수`:'빈칸·높이 기준 추천 · PC 경로 미확인');
}
function comboText(combo){if(!combo)return '';if(combo.status==='available')return `우측 3열 조합 후보: ${combo.types.join(' → ')} · NEXT·홀드에 있음`;if(combo.status==='waiting')return `우측 3열에 필요한 조합: ${combo.types.join(' → ')} · 아직 보이지 않는 미노 필요`;if(combo.status==='blocked')return '우측 3열: 내부 빈칸·진입로 정리가 필요합니다.';return '우측 3열: 현재 표면을 먼저 정리하세요.';}
function showAnalysisResult(){
  const option=analysisResult.options.find(o=>o.id===analysisResult.recommendation?.id);
  recommendedPlacement=option?.p||null;
  $('#pc-recommendation').textContent=`${analysisResult.options.length}개 후보 · ${option?.source==='hold'?'홀드 ':''}${option?.type||''} 추천. ${recommendationText()}`;
  $('#right-combo').textContent=mode==='stack63'&&option?comboText(option.rightCombo):'';
  $('#pc-hint').textContent=`배치 후보 ${analysisResult.options.length}개 보기`;
  $('#analysis-status').textContent=`현재 보드에서 ${analysisResult.options.length}개 배치 후보`;
  $('#analysis-recommendation').textContent=recommendationText();
  if(analysis.open){renderAnalysisFilters();renderAnalysis();}draw();
}
function requestPCAnalysis(show=false){
  if(!adaptivePractice()||over||!piece)return;
  if(show&&!analysis.open){analysisResume=active();releaseInputs();if(analysisResume)paused=true;analysis.showModal();analysis.scrollTop=0;}
  const snapshot={board:board.map(row=>[...row]),current:structuredClone(piece),queue:queue.slice(0,5),hold,canHold,method:methodSnapshot()},key=snapshotKey(snapshot);
  if(key===analysisKey&&analysisResult){showAnalysisResult();return;}
  if(key===analysisKey&&analysisWorker)return;
  clearPCAnalysis();analysisSnapshot=snapshot;analysisKey=key;analysisFilter='all';analysisPage=0;analysisNextIndex=0;analysisPlanIndex=0;
  const id=++analysisId;$('#pc-recommendation').textContent='현재 배치에서 다음 수 분석 중…';
  $('#analysis-status').textContent='현재 보드를 분석 중입니다.';$('#analysis-options').innerHTML='';$('#analysis-detail').innerHTML='';$('#analysis-filters').innerHTML='';$('#analysis-recommendation').textContent='';$('#analysis-page').textContent='';$('#analysis-prev').disabled=true;$('#analysis-next').disabled=true;
  analysisWorker=new Worker(new URL('./placement-worker.js?v=13',import.meta.url),{type:'module'});
  analysisWorker.onmessage=({data})=>{
    if(data.id!==analysisId)return;
    if(data.type==='progress')$('#analysis-status').textContent=`현재 보드 분석 중 · ${data.count}개 후보 확인`;
    if(data.type==='error'){$('#analysis-status').textContent=$('#pc-recommendation').textContent='분석에 실패했습니다. 후보 보기를 눌러 다시 시도하세요.';analysisWorker?.terminate();analysisWorker=null;}
    if(data.type==='done'){analysisResult=data.result;analysisSelected=analysisResult.options[0]?.id??-1;analysisWorker?.terminate();analysisWorker=null;showAnalysisResult();}
  };
  analysisWorker.onerror=()=>{if(id!==analysisId)return;$('#analysis-status').textContent=$('#pc-recommendation').textContent='분석에 실패했습니다. 다시 시도하세요.';analysisWorker?.terminate();analysisWorker=null;};
  analysisWorker.postMessage({id,snapshot,mode});draw();
}
function openAnalysis(){requestPCAnalysis(true);}
function closeAnalysis(){analysis.close();if(analysisResume&&dialog.open&&running&&!over){paused=false;canvas.focus({preventScroll:true});}analysisResume=false;}
$('#pc-auto').onchange=()=>{if($('#pc-auto').checked)requestPCAnalysis(false);else{clearPCAnalysis();draw();}updateGuide();canvas.focus({preventScroll:true});};
$('#analysis-close').onclick=closeAnalysis;analysis.addEventListener('cancel',event=>{event.preventDefault();closeAnalysis();});
$('#analysis-prev').onclick=()=>{if(analysisPage>0){analysisPage--;analysisSelected=analysisChoices()[analysisPage*candidatePageSize]?.id??-1;analysisNextIndex=0;renderAnalysis();}};
$('#analysis-next').onclick=()=>{if((analysisPage+1)*candidatePageSize<analysisChoices().length){analysisPage++;analysisSelected=analysisChoices()[analysisPage*candidatePageSize]?.id??-1;analysisNextIndex=0;renderAnalysis();}};


// Famous builds are played on the same board from the first placement to the attack.
function renderBuildList(){const category=courseInfo[activeCourseId].category||'opener';$('#course-category').value=category;$('#build-course').innerHTML=Object.entries(courseInfo).filter(([,info])=>(info.category||'opener')===category).map(([id,info])=>`<option value="${id}">${info.name}</option>`).join('');$('#build-course').value=activeCourseId;}
function prepareCourseDeck(id){
  if(courseDeckId===id&&courseDeck.length)return;
  courseDeckId=id;courseDeck=listCourseVariants(id).map(v=>v.id);
  let state=(courseSeed^Math.imul(courseRound+1,2654435761))>>>0;
  for(let i=courseDeck.length-1;i>0;i--){state^=state<<13;state^=state>>>17;state^=state<<5;const j=(state>>>0)%(i+1);[courseDeck[i],courseDeck[j]]=[courseDeck[j],courseDeck[i]];}
  if(courseDeck[0]===activeVariantId&&courseDeck.length>1)[courseDeck[0],courseDeck[1]]=[courseDeck[1],courseDeck[0]];
}
function openBuild(id='tki',variantId=null,keepSession=false){
  if(!keepSession){courseCompleted=0;courseRound=0;courseSeed=crypto.getRandomValues(new Uint32Array(1))[0];courseDeck=[];courseDeckId='';}
  activeCourseId=courseInfo[id]?id:'tki';prepareCourseDeck(activeCourseId);activeVariantId=variantId||courseDeck.shift();courseDeck=courseDeck.filter(v=>v!==activeVariantId);renderBuildList();open('build');window.history.replaceState(null,'',`#learn/${activeCourseId}/${activeVariantId}`);
}
$$('[data-view="learn"]').forEach(button=>button.onclick=()=>openBuild(activeCourseId));
$('#course-category').onchange=e=>openBuild(Object.keys(courseInfo).find(id=>(courseInfo[id].category||'opener')===e.target.value));
$('#course-style').onchange=()=>{courseRound++;openBuild(activeCourseId,activeVariantId,true);};
$('#course-chain').onchange=()=>{if($('#course-chain').checked)scheduleCourseNext();else clearTimeout(courseTimer);};
$('#stack-combos').onclick=()=>openBuild('right3');
$('#build-course').onchange=e=>openBuild(e.target.value);
$('#course-other').onclick=advanceCourse;
$('#course-hint').onclick=()=>{courseShown=!courseShown;updateCourse();draw();canvas.focus({preventScroll:true});};
$('#course-undo').onclick=()=>{
  const prior=courseHistory.pop();if(!prior)return;clearTimeout(courseTimer);courseCompleted=prior.completed;course.steps=prior.steps;courseOffPlan=prior.offPlan;courseGoalState=prior.goalState;
  board=prior.board;queue=prior.queue;hold=prior.hold;drawn=prior.drawn;lines=prior.lines;pieces=prior.pieces;courseIndex=prior.index;
  courseDone=false;canHold=true;over=false;paused=false;running=true;releaseInputs();spawn(prior.type);$('#board-overlay').hidden=true;updateCourse();draw();canvas.focus({preventScroll:true});
};
$('#course-again').onclick=()=>{reset();canvas.focus({preventScroll:true});};
$('#course-next').onclick=advanceCourse;
function syncBuildRoute(){if(location.hash.startsWith('#learn'))openBuild(location.hash.split('/')[1],location.hash.split('/')[2]);else if(dialog.open&&mode==='build')close();}
renderBuildList();window.addEventListener('hashchange',syncBuildRoute);syncBuildRoute();
