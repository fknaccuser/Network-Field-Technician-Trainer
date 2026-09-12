import test from 'node:test';
import assert from 'node:assert/strict';
import {createMission,execute,serviceState,setClient,setPhysical,runTest,evidence,assessmentChecklist,FAULTS,prompt} from '../src/core/network.js';
import {careerCredit,prerequisiteScore} from '../src/core/scoring.js';
import {newClock,pauseClock,resumeClock,tick} from '../src/core/clock.js';
import {shareSeed,parseSeed} from '../src/core/random.js';
import {newStudy,checkItem,equivalent} from '../src/core/study.js';
import {QUESTIONS,LESSONS} from '../src/data/curriculum.js';

function repair(m){
  for(const c of ['enable','configure terminal','interface '+m.port,'switchport mode access','switchport access vlan '+m.vlan,'no shutdown','end','copy running-config startup-config'])execute(m,'access',c);
  for(const c of ['enable','configure terminal','ip route 0.0.0.0 0.0.0.0 203.0.113.1','end','copy running-config startup-config'])execute(m,'edge',c);
  setPhysical(m,'power',true);setPhysical(m,'cable',true);setClient(m,m.expected);
}
function verify(m){for(const t of ['internet','dns','web','confirm'])runTest(m,t);m.docs={cause:'Incorrect VLAN, administratively shut down interface, disconnected Ethernet cable, missing power supply, DNS server and gateway and route.',action:'Applied the documented configuration and restored required physical connections.',verify:'Verified IP reachability, DNS resolution, HTTPS, and customer confirmation after the final change.',evidence:[m.evidence.at(-1).id]};}
test('100 seeds across three difficulties create reproducible, solvable service incidents',()=>{
  const environments=new Set(),faultSets=new Set();
  for(let i=0;i<100;i++)for(const difficulty of [1,2,3]){const a=createMission('suite-'+i,difficulty),b=createMission('suite-'+i,difficulty);assert.deepEqual(a.faults,b.faults);assert.deepEqual(a.devices,b.devices);assert.equal(a.vlan,b.vlan);assert.equal(a.environment.name,b.environment.name);assert.equal(serviceState(a).web,false);environments.add(a.environment.name);faultSets.add(a.faults.join(','));repair(a);assert.equal(serviceState(a).web,true);assert.equal(serviceState(a).other,true);verify(a);assert.ok(assessmentChecklist(a).every(c=>c.ok));}
  assert.equal(environments.size,3);assert.ok(faultSets.size>25);
});
test('every supported root cause is independently repairable',()=>{for(const fault of Object.keys(FAULTS)){const m=createMission('single-'+fault,1,'guided',[fault]);assert.equal(serviceState(m).web,false);repair(m);assert.equal(serviceState(m).web,true);}});
test('configuration requires privilege and valid mode; incorrect VLAN values cannot mutate state',()=>{
  const m=createMission('modes',1,'guided',['dns']);const original=m.devices.access.interfaces[m.port].vlan;
  execute(m,'access','configure terminal');assert.equal(m.devices.access.mode,'user');execute(m,'access','switchport access vlan 20');assert.equal(m.devices.access.interfaces[m.port].vlan,original);
  for(const c of ['en','conf t','int '+m.port])execute(m,'access',c);
  assert.match(prompt(m,'access'),/config-if/);for(const v of ['0','4095','12.5','bad']){execute(m,'access','switchport access vlan '+v);assert.equal(m.devices.access.interfaces[m.port].vlan,original);}
  execute(m,'access','sw acc vl 44');assert.equal(m.devices.access.interfaces[m.port].vlan,44);
});
test('read-only career access can inspect but cannot configure or save',()=>{
  const m=createMission('auth',1,'career',['route']);execute(m,'edge','enable');assert.match(execute(m,'edge','show ip route'),/not set/);execute(m,'edge','configure terminal',{authorized:false});assert.equal(m.devices.edge.mode,'privileged');assert.equal(m.devices.edge.defaultRoute,null);
});
test('old verification cannot satisfy a later revision; unsaved device edits block completion',()=>{
  const m=createMission('evidence',1,'guided',['vlan']);repair(m);verify(m);assert.ok(assessmentChecklist(m).every(c=>c.ok));
  for(const c of ['configure terminal','interface '+m.port,'description Restored customer service','end'])execute(m,'access',c);
  assert.equal(assessmentChecklist(m).find(c=>c.id==='tests').ok,false);assert.equal(assessmentChecklist(m).find(c=>c.id==='save').ok,false);
  execute(m,'access','copy running-config startup-config');verify(m);assert.ok(assessmentChecklist(m).every(c=>c.ok));
});
test('causing an additional service outage permanently fails the scored attempt',()=>{
  const m=createMission('outage',1,'assessment',['dns']);for(const c of ['enable','conf t','int GigabitEthernet1/0/24','shutdown'])execute(m,'access',c);assert.equal(m.failed,true);assert.equal(m.status,'failed');execute(m,'access','no shutdown');assert.equal(m.failed,true);
});
test('physical power loss affects operational output and traffic',()=>{const m=createMission('power',1,'guided',['power']);assert.match(execute(m,'access','show interfaces status'),/notconnect/);assert.equal(serviceState(m).internet,false);setPhysical(m,'power',true);assert.equal(serviceState(m).internet,true);assert.doesNotMatch(execute(m,'access','show interfaces status'),/notconnect/);});
test('an unreachable DNS server prevents names, not a working IP path',()=>{const m=createMission('dns',1,'guided',['dns']);assert.equal(runTest(m,'internet').ok,true);assert.equal(runTest(m,'dns').ok,false);assert.equal(runTest(m,'web').ok,false);});
test('assistance is capped before the permanent repeat multiplier',()=>{
  const params={base:200,referenceOpens:20,built:10,submitted:10,solutions:5};assert.equal(careerCredit(params).total,100);
  assert.deepEqual([0,1,2,3,12].map(repeats=>careerCredit({...params,repeats}).total),[100,50,25,0,0]);assert.equal(careerCredit({...params,guided:true}).total,200);assert.equal(careerCredit({base:200,built:2,submitted:10}).total,188);
});
test('edited builder commands retain assisted provenance including errors and repeats',()=>{const m=createMission('builder');execute(m,'access','nonsense',{assisted:true});execute(m,'access','nonsense',{assisted:true});execute(m,'access','?');assert.deepEqual([m.help.built,m.help.submitted],[2,3]);});
test('prerequisite scoring uses 50/50 sections, 70% overall, with compensation',()=>{
  const items=[...Array.from({length:5},(_,i)=>({kind:'knowledge',correct:i<2})),...Array.from({length:5},()=>({kind:'practical',correct:true}))];assert.deepEqual(prerequisiteScore(items),{score:70,passed:true});items[0].correct=false;assert.equal(prerequisiteScore(items).passed,false);
});
test('assessment pauses use a cumulative five-minute allowance and preserve active time',()=>{
  const c=newClock(600,1000);pauseClock(c,61000);assert.equal(c.remaining,540000);resumeClock(c,181000);assert.equal(c.pauseUsed,120000);tick(c,211000);assert.equal(c.remaining,510000);pauseClock(c,211000);resumeClock(c,391000);assert.equal(c.ended,true);assert.equal(c.reason,'interrupted');
});
test('clock timeout counts active time and cannot become negative',()=>{const c=newClock(30,1000);tick(c,41000);assert.equal(c.remaining,0);assert.equal(c.reason,'timeout');});
test('shared challenges round-trip the environment version, seed, and difficulty',()=>{const m=createMission('CUSTOMER / A:21',3);const p=parseSeed(shareSeed(m));assert.equal(p.seed,m.seed);assert.equal(p.difficulty,3);assert.equal(p.version,m.version);assert.throws(()=>parseSeed('FIELD:missing:9:x'));});
test('fresh knowledge checks reject an exhausted bank and do not reuse exposed questions',()=>{
  const s=newStudy({seed:'study',assessment:true,count:10,exposures:QUESTIONS.slice(0,10).map(q=>q.id)});assert.ok(s.items.every(q=>!QUESTIONS.slice(0,10).some(p=>p.id===q.id)));assert.throws(()=>newStudy({seed:'study',assessment:true,count:10,exposures:QUESTIONS.map(q=>q.id)}));
});
test('all original questions have four complete option explanations and known skill mapping',()=>{
  assert.equal(LESSONS.length,30);assert.equal(QUESTIONS.length,60);assert.equal(new Set(QUESTIONS.map(q=>q.id)).size,QUESTIONS.length);
  for(const q of QUESTIONS){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.equal(q.explanations.length,4);assert.ok(q.explanations.every(s=>typeof s==='string'&&s.length>20));assert.ok(LESSONS.some(l=>l.id===q.skill));}
});
test('typed concepts accept declared equivalents while invalid command syntax is rejected',()=>{assert.equal(equivalent('  NDP ','Neighbor Discovery',['ndp']),true);assert.equal(equivalent('no   shutdown','no shutdown'),true);assert.equal(equivalent('shutdown no','no shutdown'),false);});
