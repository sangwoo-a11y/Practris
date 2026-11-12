import {stampShape,clearRows,classifyTSpin,occupiedCells} from './game.js?v=14';
export function courseGoal(course){
  let targetBoard=structuredClone(course.board);for(const step of course.steps)targetBoard=clearRows(stampShape(targetBoard,step.target)).board;
  return {attacks:course.steps.filter(s=>s.spin).map(s=>s.spin),skim:course.id==='mid_skim',targetBoard};
}
export function advanceCourseGoal(goal,state,before,p,result){
  const next={attackIndex:state.attackIndex||0,skimRows:state.skimRows||0},spin=classifyTSpin(before,p,result.cleared);
  if(result.cleared&&!spin)next.skimRows+=result.cleared;
  if(spin===goal.attacks[next.attackIndex]&&(!goal.skim||next.skimRows>=2))next.attackIndex++;
  let complete=false;
  if(goal.attacks.length)complete=next.attackIndex===goal.attacks.length;
  else complete=result.board.every((row,y)=>row.every((v,x)=>!!v===!!goal.targetBoard[y][x]));
  return {state:next,complete,spin};
}
