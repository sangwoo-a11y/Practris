import {analyzePlacements,recommendPlacements} from './placements.js?v=9';
self.onmessage=({data})=>{
  try{const result=analyzePlacements(data.snapshot,count=>self.postMessage({type:'progress',id:data.id,count}));recommendPlacements(data.snapshot,result);self.postMessage({type:'done',id:data.id,result});}
  catch{self.postMessage({type:'error',id:data.id});}
};
