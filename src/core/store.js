const DB='the-field-v1';
let db;
export async function openStore() {
  db=await new Promise((resolve,reject)=>{ const request=indexedDB.open(DB,1);request.onupgradeneeded=()=>request.result.createObjectStore('state');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error); });
}
export async function readState() { return new Promise((resolve,reject)=>{const r=db.transaction('state').objectStore('state').get('profile');r.onsuccess=()=>resolve(r.result??null);r.onerror=()=>reject(r.error);}); }
export async function writeState(value) {
  return new Promise((resolve,reject)=>{const tx=db.transaction('state','readwrite');tx.objectStore('state').put(structuredClone(value),'profile');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error??new Error('Saving was interrupted.'));});
}
export function newProfile(name,goal) {
  return {schema:1,id:crypto.randomUUID(),name,goal,createdAt:Date.now(),gate:'required',grant:null,redeemed:[],
    xp:0,activity:[],history:[],skills:{},exposures:[],repeats:{},bookmarks:[],notes:[],cards:[],
    settings:{skipIntro:false,theme:'cyan',textSize:'normal',comfortable:true,mentor:'contextual',review:true},
    career:{chapter:0,avatar:{color:'blue',hair:'short'},isp:'Northline Fiber'},activeMission:null,session:null,plan:null};
}
export function validateBackup(data) {
  if(!data || data.schema!==1 || typeof data.id!=='string' || typeof data.name!=='string' || !Array.isArray(data.history) || !data.settings || !data.skills || !Array.isArray(data.exposures) || !Array.isArray(data.cards) || !Array.isArray(data.notes) || !Array.isArray(data.bookmarks)) throw new Error('This file is not a supported The Field backup.');
  const fail=()=>{throw new Error('This progress file contains invalid state. Nothing has been replaced.');};
  const safeID=s=>typeof s==='string'&&/^[a-zA-Z0-9:_@./% -]{1,240}$/.test(s);
  if(!safeID(data.id)||!Number.isFinite(data.xp)||data.xp<0||!Array.isArray(data.activity)||!data.career?.avatar||!['required','authorized','locked','passed'].includes(data.gate))fail();
  if(data.cards.some(c=>!safeID(c.id)||typeof c.front!=='string'||typeof c.back!=='string'))fail();
  if(data.session){const s=data.session;if(!['questions','flashcards','blank','wordbank'].includes(s.mode)||!Array.isArray(s.items)||!Number.isInteger(s.index)||s.index<0||s.index>=s.items.length)fail();
    for(const q of s.items)if(!Array.isArray(q.order)||q.order.some(n=>!Number.isInteger(n)||n<0||n>3)||!q.lesson||!Array.isArray(q.bank)||q.bank.some(b=>!Number.isInteger(b.id)||typeof b.text!=='string'))fail();}
  if(data.activeMission){const m=data.activeMission,ip=s=>typeof s==='string'&&/^\d{1,3}(\.\d{1,3}){3}$/.test(s)&&s.split('.').every(n=>+n<=255);
    if(!/^GigabitEthernet\d+\/\d+\/\d+$/.test(m.port)||!Number.isInteger(m.vlan)||m.vlan<1||m.vlan>4094||![1,2,3].includes(m.difficulty)||!Array.isArray(m.events)||!Array.isArray(m.evidence)||!m.docs||!m.devices?.access?.interfaces||!m.devices?.edge?.interfaces||!m.terminal||!m.help)fail();
    if(['ip','mask','gateway','dns'].some(k=>!ip(m.expected?.[k])||!ip(m.client?.[k])))fail();
    if(m.evidence.some(e=>!/^f\d+$/.test(e.id))||!Array.isArray(m.docs.evidence))fail();
    if(m.credit&&['base','deduction','multiplier','total'].some(k=>!Number.isFinite(m.credit[k])))fail();
  }
  return data;
}
