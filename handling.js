export const defaults={arr:16,das:133,dcd:0,sdf:20};
export function normalizeHandling(value={}){
  if(!value||typeof value!=='object')value={};
  const num=(key,max)=>Number.isFinite(Number(value[key]))?Math.max(0,Math.min(max,Number(value[key]))):defaults[key];
  return {arr:num('arr',100),das:num('das',500),dcd:num('dcd',200),sdf:value.sdf==='instant'?'instant':Math.max(1,num('sdf',100))};
}
// Repeat timing uses elapsed time, never the operating system's key repeat.
export class HorizontalRepeat{
  constructor(){this.clear();}
  clear(){this.keys=[];this.next=Infinity;this.blockedUntil=0;}
  down(direction,now,settings){
    if(this.keys.includes(direction))return 0;
    this.keys.push(direction);this.next=now+settings.das;
    return now>=this.blockedUntil?direction:0;
  }
  up(direction,now,settings){
    const active=this.keys.at(-1)===direction;
    this.keys=this.keys.filter(key=>key!==direction);
    if(active){this.next=this.keys.length?now+settings.das:Infinity;return now>=this.blockedUntil?(this.keys.at(-1)||0):0;}
    return 0;
  }
  cut(now,settings){this.blockedUntil=now+settings.dcd;}
  tick(now,settings){
    const direction=this.keys.at(-1)||0;
    if(!direction||now<this.next||now<this.blockedUntil)return {direction:0,steps:0};
    if(settings.arr===0){this.next=now;return {direction,steps:10};}
    const due=Math.max(this.next,this.blockedUntil);
    const steps=Math.min(10,1+Math.floor((now-due)/settings.arr));
    this.next=due+steps*settings.arr;
    return {direction,steps};
  }
}
export function fallInterval(settings,softDrop){return softDrop?(settings.sdf==='instant'?0:900/settings.sdf):900;}

// Physical key codes keep controls working while Korean IME is selected.
export function actionKey(event){
  const fixed={ArrowLeft:'ArrowLeft',ArrowRight:'ArrowRight',ArrowUp:'ArrowUp',ArrowDown:'ArrowDown',Space:' ',Enter:'Enter',Escape:'Escape',ShiftLeft:'Shift',ShiftRight:'Shift'};
  if(fixed[event.code])return fixed[event.code];
  if(/^Key[A-Z]$/.test(event.code))return event.code.slice(3).toLowerCase();
  return event.key?.length===1?event.key.toLowerCase():event.key;
}
