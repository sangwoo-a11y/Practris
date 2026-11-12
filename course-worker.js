import {makeCourse} from './courses.js?v=13';
import {designBagCourse} from './course-planner.js?v=13';
self.onmessage=({data})=>{try{const course=designBagCourse(makeCourse(data.courseId,data.variantId),{seed:data.seed,round:data.round});self.postMessage({id:data.id,course});}catch{self.postMessage({id:data.id,error:'bag 과제를 만들지 못했습니다. 다시 시도하세요.'});}};
