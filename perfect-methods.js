import {emptyBoard,bagQueue,randomBags,stampShape,clearRows} from './game.js?v=14';
import {perfectMethodData} from './perfect-method-data.js?v=14';
export const perfectMethods={
  pco_standard:{name:'PCO · 기본형',description:'첫 bag 7개로 4줄 공간을 준비하고 다음 bag의 3미노로 비웁니다.',benefit:'왼쪽 사각형과 오른쪽 계단을 만들고 중앙의 남은 공간을 읽습니다.',setupCount:7},
  pco_hold_i:{name:'PCO · I 보류',description:'I를 남겨두고 6미노로 토대를 만든 뒤 I와 다음 bag의 3미노로 마무리합니다.',benefit:'I를 언제 보류하고 어떤 순서로 남은 공간에 사용하는지 익힙니다.',setupCount:6},
  mko_hold_t:{name:'MKO · T 보류 PC',description:'MKO 토대에서 T를 남겨두고 4줄 PC로 연결하는 분기를 연습합니다.',benefit:'MKO의 T-spin 전개와 구분해, 보류한 T와 다음 bag으로 공간을 채우는 PC 분기를 익힙니다.',setupCount:6},
};
export function isPerfectMethod(id){return Object.hasOwn(perfectMethods,id);}
export function makePerfectPractice(id,round=0,{stage='build',random=Math.random,seed=1,liveQueue=null}={}){
  if(!isPerfectMethod(id))throw Error('Unknown perfect-clear method');
  const variants=perfectMethodData[id],source=variants[(round+(seed>>>0)%variants.length)%variants.length],fullSteps=structuredClone(source.steps),fullQueue=bagQueue(fullSteps.map(s=>s.target.type),()=>.5);
  const finishOnly=stage==='finish',skip=finishOnly?source.setupCount:0;let board=emptyBoard();
  for(const step of fullSteps.slice(0,skip))board=clearRows(stampShape(board,step.target)).board;
  const steps=fullSteps.slice(skip),method=perfectMethods[id];
  return {board,steps,queue:liveQueue?[...liveQueue]:randomBags(4,random),exampleQueue:fullQueue.slice(skip),bagOffset:0,randomBag:true,setupRemaining:finishOnly?0:source.setupCount,kind:null,title:`${method.name} · ${finishOnly?'마무리':'처음부터'}`,methodId:id,methodStage:finishOnly?'finish':'build',methodName:method.name,methodDescription:method.description,variantName:source.name,variantId:source.id,id:JSON.stringify([id,source.id,finishOnly])};
}
