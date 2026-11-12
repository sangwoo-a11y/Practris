import {analyzePlacements,recommendPlacements,recommendStackPlacements} from './placements.js?v=10';
self.onmessage=({data})=>{
  try{const result=analyzePlacements({...data.snapshot,continueAfterPerfect:data.mode==='stack63'},count=>self.postMessage({type:'progress',id:data.id,count}));if(data.mode==='stack63')recommendStackPlacements(data.snapshot,result);else recommendPlacements(data.snapshot,result);self.postMessage({type:'done',id:data.id,result});}
  catch{self.postMessage({type:'error',id:data.id});}
};
