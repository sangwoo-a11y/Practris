import {emptyBoard,shapes,rotateMatrix,trimMatrix} from './game.js';
const target=(type,x,y,turns=0)=>({type,x,y,m:trimMatrix(rotateMatrix(shapes[type],turns))});
export const isLesson=mode=>['four','perfect','tspin'].includes(mode);
export function makeLesson(mode,round=0){
  const board=emptyBoard(),left=round%2===1;
  if(mode==='four'){
    const well=left?0:9,slot=left?1:7;
    for(let y=16;y<20;y++)for(let x=0;x<10;x++)if(x!==well&&x!==slot&&x!==slot+1)board[y][x]='J';
    return {board,title:`4줄 설계 · ${left?'왼쪽':'오른쪽'} 우물`,principle:'한 열을 끝까지 비우고, 나머지는 구멍 없이 같은 높이로 쌓으세요.',steps:[
      {target:target('O',slot,18),text:'O를 아래 빈 공간에 놓아 바닥을 채우세요.'},
      {target:target('O',slot,16),text:`O를 그 위에 놓아 4칸 높이를 맞추세요. ${well+1}열은 비워둡니다.`},
      {target:target('I',well,16,1),text:`I를 세로로 돌려 ${well+1}열 우물에 넣으세요. 4줄이 함께 지워집니다.`,clear:4},
    ]};
  }
  if(mode==='perfect'){
    // First two rounds teach a 2×4 gap; later rounds build an entire 2×10 rectangle.
    if(round>=4){
      const start=left?2:0,slot=left?0:8;
      const steps=[target('I',start,19),target('I',start+4,19),target('I',start,18),target('I',start+4,18),target('O',slot,18)];
      return {board,title:'퍼펙트 설계 · I + O 분할',principle:'2 × 10을 I 네 개와 O 한 개로 나눕니다. I로 두 줄을 평평하게 만들고, O용 2 × 2 공간을 끝까지 남기세요.',steps:steps.map((t,i)=>({target:t,text:i===4?'남겨둔 2 × 2 공간을 O로 채워 퍼펙트 클리어하세요.':`I를 가로로 ${t.x+1}–${t.x+4}열 ${t.y===19?'바닥':'두 번째 줄'}에 놓으세요.`,...(i===4?{clear:2,perfect:true}:{})}))};
    }
    const full=round>=2,start=left?0:6;
    if(!full)for(let y=18;y<20;y++)for(let x=0;x<10;x++)if(x<start||x>start+3)board[y][x]='S';
    const slots=full?(left?[8,6,4,2,0]:[0,2,4,6,8]):[start,start+2];
    return {board,title:full?'퍼펙트 설계 · 빈 보드':'퍼펙트 설계 · 2 × 4',principle:'총 칸 수를 10의 배수로 맞추고, 빈칸을 미노 모양으로 나눠 보세요. 이 과제는 O로 2 × 10 직사각형을 만듭니다.',steps:slots.map((x,i)=>({target:target('O',x,18),text:i===slots.length-1?'마지막 2 × 2를 O로 채워 모든 블록을 지우세요.':`O를 ${x+1}–${x+2}열 바닥에 놓으세요. 아래쪽에 빈칸을 남기지 않습니다.`,...(i===slots.length-1?{clear:2,perfect:true}:{})}))};
  }
  const hole=left?5:4;
  for(let y=18;y<20;y++)for(let x=0;x<10;x++)if(!(y===19?x===hole:x>=hole-1&&x<=hole+1))board[y][x]='T';
  return {board,title:'T 홈 설계',principle:'가로 3칸과 가운데 아래 1칸을 남겨 T가 들어갈 홈을 만드세요. 회전 배치 기초 과제이며 T스핀 판정은 아닙니다.',steps:[{target:target('T',hole-1,18,2),text:'A로 T를 180° 회전해 표시된 홈에 놓으세요.',clear:2}]};
}
