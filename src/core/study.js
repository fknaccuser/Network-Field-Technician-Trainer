import {QUESTIONS,LESSONS} from '../data/curriculum.js';
import {rng,shuffle} from './random.js';
import {newClock} from './clock.js';
export function equivalent(input,answer,aliases=[]) {
  const normalize=s=>String(s).trim().toLowerCase().replace(/[.!?]$/,'').replace(/\s+/g,' ');
  return [answer,...aliases].some(v=>normalize(input)===normalize(v));
}
export function newStudy({domain='all',skill=null,mode='questions',count=10,feedback='immediate',seed,assessment=false,exposures=[]}) {
  const random=rng(seed),rawPool=QUESTIONS.filter(q=>(domain==='all'||q.domain===domain)&&(!skill||q.skill===skill));
  const pool=mode==='questions'?rawPool:rawPool.filter((q,i)=>rawPool.findIndex(p=>p.skill===q.skill)===i);
  const unseen=pool.filter(q=>!exposures.includes(q.id));
  if(assessment&&unseen.length<count)throw new Error(`Only ${unseen.length} unseen questions remain in this selection. Use ordinary practice; a fresh assessment needs ${count}.`);
  const selected=shuffle(random,assessment?unseen:pool).slice(0,count);
  if(!selected.length)throw new Error('No questions are available in this selection.');
  const items=selected.map(q=>{const order=shuffle(random,[0,1,2,3]);return {...q,order,response:null,correct:null,flag:false,checked:false,lesson:LESSONS.find(l=>l.id===q.skill),pieces:[],bank:[]};});
  for(const item of items){const words=item.lesson.answer.split(' ');item.bank=shuffle(random,words.map((text,i)=>({id:i,text})));}
  return {id:seed,domain,skill,mode,feedback:assessment?'end':feedback,assessment,items,index:0,status:'active',createdAt:Date.now(),clock:assessment?newClock(items.length*75):null};
}
export function checkItem(item,mode) {
  const correct=mode==='questions'?item.response===0:mode==='flashcards'&&typeof item.response==='boolean'?item.response:equivalent(item.response??'',item.lesson.answer,item.lesson.aliases);
  item.correct=correct;item.checked=true;return correct;
}
export function finishStudy(session) {for(const item of session.items)if(!item.checked)checkItem(item,session.mode);session.status='complete';session.endedAt=Date.now();return session.items.filter(i=>i.correct).length;}

export const PREREQUISITE_TASKS=[
  {id:'privilege',title:'Enter privileged EXEC on Access-SW.',device:'access',pass:m=>m.devices.access.mode==='privileged'},
  {id:'inspect',title:'Use the switch CLI to inspect interface state.',device:'access',pass:m=>m.events.some(e=>e.device==='access'&&/^.*(?:sh(?:ow)? (?:ip int|int))/i.test(e.text))},
  {id:'port',title:'The assigned customer port is administratively disabled. Enable that port.',device:'access',pass:m=>m.devices.access.interfaces[m.port].admin},
  {id:'workstation',title:'Use the workstation terminal to inspect its IP addressing.',device:'client',pass:m=>m.events.some(e=>e.device==='client'&&/ipconfig|ip addr|ip a$/.test(e.text))},
  {id:'power',title:'The customer ONT has no power. Inspect it and restore its power connection.',device:'physical',pass:m=>m.physical.power&&m.evidence.some(e=>e.title==='ont inspection')},
];
