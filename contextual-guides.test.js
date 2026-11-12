import test from 'node:test';
import assert from 'node:assert/strict';
import {contextGuideHTML} from './guides.js';
import {makeCourse,courseInfo} from './courses.js';
import {perfectMethods} from './perfect-methods.js';
test('current guides describe every mode and each selected build',()=>{
  for(const [mode,title] of [['free','자유 연습'],['tspin','혼합'],['stack63','6–3'],['editor','빌드 에디터']])assert.ok(contextGuideHTML({mode}).includes(title));
  for(const id of Object.keys(courseInfo)){
    const course=makeCourse(id),html=contextGuideHTML({mode:'build',course,style:'bag',index:1,current:'T',hold:'I'});
    assert.ok(html.includes(course.name));assert.ok(html.includes(course.description));assert.ok(html.includes(course.benefit));assert.match(html,/bag 판단/);assert.match(html,/되돌리지 않습니다/);
  }
  for(const method of Object.values(perfectMethods)){const html=contextGuideHTML({mode:'perfect',method,stage:'finish',onPlan:true});assert.ok(html.includes(method.name));assert.match(html,/마무리만 연습/);assert.match(html,/선택한 방식의 현재 단계/);assert.match(contextGuideHTML({mode:'perfect',method,onPlan:false}),/공통 PC 경로/);}
});
