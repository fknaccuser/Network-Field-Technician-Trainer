import {rng,pick,shuffle,GENERATOR_VERSION} from './random.js';

export const FAULTS={
  vlan:{label:'Incorrect service VLAN',layer:'Layer 2',skill:'vlans',hint:'Compare the customer port with the service order.',clue:'The access VLAN on the customer-facing switch port does not match the assigned service.',solution:m=>`On Access-SW: enable → configure terminal → interface ${m.port} → switchport access vlan ${m.vlan} → end → copy running-config startup-config.`},
  shutdown:{label:'Administratively disabled port',layer:'Layer 1',skill:'interfaces',hint:'Find out whether the link is down physically or administratively.',clue:'The customer-facing switch interface is administratively down.',solution:m=>`On Access-SW: enable → configure terminal → interface ${m.port} → no shutdown → end → copy running-config startup-config.`},
  cable:{label:'Disconnected Ethernet cable',layer:'Layer 1',skill:'cabling',hint:'Follow the physical path between the ONT and customer router.',clue:'The ONT Ethernet port has no connected cable.',solution:()=> 'Inspect the ONT. Select the Ethernet cable, the ONT GE1 port, then the router WAN port.'},
  power:{label:'ONT has no power',layer:'Layer 1',skill:'cabling',hint:'Check the equipment indicators before changing configuration.',clue:'None of the ONT indicators are illuminated.',solution:()=> 'Inspect the ONT power connection and connect the power supply.'},
  dns:{label:'Incorrect DNS server',layer:'Application',skill:'dns',hint:'Compare reaching an IP address with reaching a hostname.',clue:'IP connectivity works after any lower-layer faults are repaired; the configured DNS server is unreachable.',solution:m=>`In the workstation network settings, set DNS to ${m.expected.dns}. Verify name resolution and an HTTPS request.`},
  gateway:{label:'Incorrect client gateway',layer:'Layer 3',skill:'ipv4',hint:'Check the workstation addressing against the LAN plan.',clue:'The workstation sends off-subnet traffic to the wrong default gateway.',solution:m=>`Set the workstation default gateway to ${m.expected.gateway}, then test local and remote reachability.`},
  route:{label:'Missing upstream default route',layer:'Layer 3',skill:'routing',hint:'Trace the route and inspect the device where forwarding stops.',clue:'Edge-R1 has no default route to its upstream provider.',solution:()=> 'On Edge-R1: enable → configure terminal → ip route 0.0.0.0 0.0.0.0 203.0.113.1 → end → copy running-config startup-config.'},
};

const iosDevice=(name,kind,interfaces,defaultRoute=null)=>({name,kind,mode:'user',selected:null,interfaces,defaultRoute,saved:null,dirty:false});
export function createMission(seed,difficulty=1,mode='guided',forcedFaults=null) {
  if(typeof seed!=='string'||!seed.trim()||seed.length>180)throw new Error('Invalid seed.');
  if(![1,2,3].includes(Number(difficulty)))throw new Error('Unsupported difficulty.');
  const r=rng(`${GENERATOR_VERSION}:${seed}`), octet=pick(r,[18,24,32,48,64,72]), vlan=pick(r,[110,120,210,220,310]),port=`GigabitEthernet1/0/${3+Math.floor(r()*18)}`;
  const environment=pick(r,[{name:'Willow House',type:'Residential',person:'Morgan',device:'Windows-PC'},{name:'Juniper Design',type:'Small business',person:'Alex',device:'Linux-PC'},{name:'Eastbank Learning Center',type:'Campus annex',person:'Sam',device:'Windows-PC'}]);
  const expected={ip:`192.168.${octet}.24`,mask:'255.255.255.0',gateway:`192.168.${octet}.1`,dns:'198.51.100.53'};
  const m={id:`${seed}:${difficulty}:${mode}`,seed,version:GENERATOR_VERSION,difficulty:Number(difficulty),mode,environment,vlan,port,expected,
    title:'The internet stopped working',ticket:`INC-${String(1000+Math.floor(r()*8999))}`,createdAt:Date.now(),revision:0,status:'active',failed:false,
    physical:{power:true,cable:true,fiber:true},client:{...expected,platform:environment.device.startsWith('Linux')?'linux':'windows'},
    devices:{access:iosDevice('Access-SW','switch',{
      'GigabitEthernet1/0/1':{description:'UPLINK Edge-R1',admin:true,mode:'trunk',vlan:1,allowed:[vlan,900],ip:null},
      [port]:{description:`SERVICE ${environment.name}`,admin:true,mode:'access',vlan,allowed:[],ip:null},
      'GigabitEthernet1/0/24':{description:'OTHER CUSTOMER — protect service',admin:true,mode:'access',vlan:900,allowed:[],ip:null},
    }),edge:iosDevice('Edge-R1','router',{
      'GigabitEthernet0/0':{description:'UPSTREAM',admin:true,mode:'routed',ip:'203.0.113.2',mask:'255.255.255.252',vlan:0,allowed:[]},
      'GigabitEthernet0/1':{description:'ACCESS',admin:true,mode:'routed',ip:`10.${octet}.0.1`,mask:'255.255.255.0',vlan:0,allowed:[]},
    },'203.0.113.1')},
    events:[],evidence:[],verification:{},conversations:[],docs:{cause:'',action:'',verify:'',evidence:[]},
    help:{referenceOpens:0,submitted:0,built:0,nudges:0,clues:0,solutions:0},hintLevel:0,activeDevice:'access',terminal:{access:[],edge:[],client:[]},
  };
  for(const d of Object.values(m.devices))d.saved=configOf(d);
  // Fault categories are deterministically ordered per seed. Difficulty adds faults to this environment.
  const choices=shuffle(r,Object.keys(FAULTS));
  m.faults=forcedFaults??choices.slice(0,Number(difficulty));
  if(!m.faults.length||m.faults.some(f=>!FAULTS[f]))throw new Error('Unsupported fault.');
  for(const f of m.faults){
    if(f==='vlan')m.devices.access.interfaces[port].vlan=vlan+10;
    if(f==='shutdown')m.devices.access.interfaces[port].admin=false;
    if(f==='cable')m.physical.cable=false;
    if(f==='power')m.physical.power=false;
    if(f==='dns')m.client.dns='198.51.100.254';
    if(f==='gateway')m.client.gateway=`192.168.${octet}.254`;
    if(f==='route')m.devices.edge.defaultRoute=null;
  }
  for(const d of Object.values(m.devices))d.saved=configOf(d);
  event(m,'dispatch',`${environment.person}: “Our internet stopped working. Can you take a look?”`);
  return m;
}
export function configOf(d){return JSON.stringify({interfaces:d.interfaces,defaultRoute:d.defaultRoute});}
export function event(m,type,text,details={}) {
  const e={id:`e${m.events.length+1}`,at:Date.now(),revision:m.revision,type,text,...details};m.events.push(e);return e;
}
export function evidence(m,title,detail,kind='inspection') {
  const e={id:`f${m.evidence.length+1}`,at:Date.now(),revision:m.revision,title,detail,kind};m.evidence.push(e);event(m,'evidence',title,{evidenceId:e.id});return e;
}
export function pathState(m) {
  const a=m.devices.access,e=m.devices.edge;
  const p=a.interfaces[m.port],up=a.interfaces['GigabitEthernet1/0/1'];
  const stages=[
    {id:'client',name:'Workstation',ok:m.client.ip===m.expected.ip && m.client.mask===m.expected.mask,reason:'Workstation addressing does not match the LAN plan.'},
    {id:'gateway',name:'Customer router',ok:m.client.gateway===m.expected.gateway,reason:'The configured default gateway is not the customer router.'},
    {id:'ont',name:'ONT',ok:m.physical.power&&m.physical.cable&&m.physical.fiber,reason:!m.physical.power?'ONT has no power.':!m.physical.cable?'ONT-to-router Ethernet link is disconnected.':'Optical link is disconnected.'},
    {id:'access',name:'Access-SW',ok:p.admin&&p.vlan===m.vlan&&p.mode==='access'&&up.admin&&up.mode==='trunk'&&up.allowed.includes(m.vlan),reason:!p.admin?'Customer port is administratively down.':p.vlan!==m.vlan?'Customer traffic enters the wrong service VLAN.':'Access or uplink configuration cannot carry the service VLAN.'},
    {id:'edge',name:'Edge-R1',ok:e.interfaces['GigabitEthernet0/0'].admin&&e.interfaces['GigabitEthernet0/1'].admin&&e.defaultRoute==='203.0.113.1',reason:'The edge router cannot forward traffic to the upstream network.'},
    {id:'internet',name:'Internet test host',ok:true,reason:''},
  ];
  let reached=true;return stages.map(s=>{const value={...s,reached,passes:reached&&s.ok};reached=value.passes;return value;});
}
export function serviceState(m) {
  const internet=pathState(m).every(s=>s.ok), dns=internet&&m.client.dns===m.expected.dns;
  return {internet,dns,web:dns,other:m.devices.access.interfaces['GigabitEthernet1/0/24'].admin&&m.devices.access.interfaces['GigabitEthernet1/0/24'].vlan===900&&m.devices.access.interfaces['GigabitEthernet1/0/1'].admin&&m.devices.access.interfaces['GigabitEthernet1/0/1'].allowed.includes(900)&&m.devices.edge.interfaces['GigabitEthernet0/0'].admin&&m.devices.edge.interfaces['GigabitEthernet0/1'].admin};
}
function changed(m,before,label) {
  m.revision++;m.verification={};
  for(const d of Object.values(m.devices))d.dirty=configOf(d)!==d.saved;
  const after=serviceState(m),loss=(before.internet&&!after.internet)||(before.other&&!after.other);
  event(m,'change',label,{outage:loss});
  if(loss && m.mode==='assessment'){m.failed=true;m.status='failed';event(m,'assessment','Additional outage: a required service was lost.');}
}
export function setPhysical(m,key,value) {
  if(!['power','cable','fiber'].includes(key))throw new Error('Unsupported physical action.');
  if(m.physical[key]===value)return;
  const before=serviceState(m);m.physical[key]=!!value;changed(m,before,`${key}: ${value?'connected':'disconnected'}`);
  evidence(m,'Physical inspection',`Power ${m.physical.power?'on':'off'}; Ethernet ${m.physical.cable?'linked':'disconnected'}; optical link ${m.physical.fiber?'present':'absent'}.`);
}
export function validIP(value){return typeof value==='string'&&/^\d{1,3}(\.\d{1,3}){3}$/.test(value)&&value.split('.').every(n=>+n<=255);}
export function setClient(m,values) {
  for(const key of ['ip','mask','gateway','dns'])if(!validIP(values[key]))throw new Error(`Enter a valid IPv4 ${key}.`);
  if(['ip','mask','gateway','dns'].every(k=>m.client[k]===values[k]))return;
  const before=serviceState(m);for(const k of ['ip','mask','gateway','dns'])m.client[k]=values[k];changed(m,before,'Updated workstation IPv4 configuration.');
}
export function inspect(m,where) {
  const texts={
    ont:`ONT-240 • Power: ${m.physical.power?'green':'off'} • PON: ${m.physical.power&&m.physical.fiber?'solid green':'off'} • LOS: ${m.physical.power&&!m.physical.fiber?'red':'off'} • LAN: ${m.physical.power&&m.physical.cable?'green':'off'}`,
    client:`IPv4 ${m.client.ip}/${m.client.mask}\nGateway ${m.client.gateway}\nDNS ${m.client.dns}`,
    order:`Service VLAN ${m.vlan}; customer port ${m.port}; LAN ${m.expected.ip}/${m.expected.mask}; gateway ${m.expected.gateway}; DNS ${m.expected.dns}.`,
    optical:m.physical.power&&m.physical.fiber?'Received optical power: −18.2 dBm. Device reference range: −27 to −8 dBm. Optical link is within this model’s operating range.':'No active optical reading. Check power and the fiber connection before interpreting the result.',
  };
  const result=texts[where]??'This inspection is not implemented for this equipment.';evidence(m,where==='order'?'Service order':`${where} inspection`,result);return result;
}
export function runTest(m,test,target=null) {
  const service=serviceState(m);let ok=false,detail='';
  if(test==='gateway'){ok=m.client.ip===m.expected.ip&&m.client.mask===m.expected.mask;detail=ok?`Reply from ${m.expected.gateway}: bytes=32 time<1ms TTL=64`:'Request timed out.';}
  if(test==='internet'){ok=service.internet;detail=ok?'Reply from 198.51.100.10: bytes=32 time=12ms TTL=57':'Request timed out.';}
  if(test==='dns'){ok=service.dns;detail=ok?`Server: ${m.client.dns}\nName: status.northline.test\nAddress: 198.51.100.10`:`DNS request timed out. Server: ${m.client.dns}`;}
  if(test==='web'){ok=service.web;detail=ok?'HTTPS status.northline.test — HTTP 200 OK. Customer service test succeeded.':'HTTPS request failed. Check reachability and name resolution.';}
  if(test==='confirm'){ok=service.web;detail=ok?`${m.environment.person}: “The site loads now. I can get back to work. Thank you.”`:`${m.environment.person}: “It still isn’t loading for me.”`;}
  if(test==='trace'){ok=service.internet;const first=pathState(m).findIndex(s=>!s.ok);detail=service.internet?`1  ${m.expected.gateway}  1 ms\n2  10.${m.expected.ip.split('.')[2]}.0.1  4 ms\n3  203.0.113.1  8 ms\n4  198.51.100.10  12 ms`:`1  ${m.expected.gateway}  ${first<2?'* * *':'1 ms'}\n2  * * *\nTrace incomplete.`;}
  if(!['gateway','internet','dns','web','confirm','trace'].includes(test))throw new Error('Unsupported test.');
  m.verification[test]={ok,revision:m.revision};evidence(m,`${test} test`,detail,'test');return {ok,detail};
}
export function prompt(m,id) {if(id==='client')return m.client.platform==='linux'?'tech@workstation:~$':'C:\\Users\\Tech>';const d=m.devices[id];return `${d.name}${d.mode==='user'?'>':d.mode==='privileged'?'#':d.mode==='config'?'(config)#':'(config-if)#'}`;}

function matchTokens(input,pattern) {
  const words=input.split(/\s+/),want=pattern.split(' ');return words.length===want.length && words.every((w,i)=>want[i].startsWith(w)&&w.length>0);
}
function interfaceName(d,value) {const clean=value.replace(/\s/g,'').toLowerCase();const found=Object.keys(d.interfaces).filter(k=>k.toLowerCase()===clean||k.toLowerCase().replace('gigabitethernet','gi')===clean||k.toLowerCase().replace('gigabitethernet','g')===clean);return found.length===1?found[0]:null;}
function configText(d) {return [`hostname ${d.name}`,...Object.entries(d.interfaces).flatMap(([name,i])=>[`interface ${name}`,` description ${i.description}`,...(i.mode==='routed'?[` ip address ${i.ip} ${i.mask}`]:[` switchport mode ${i.mode}`,i.mode==='access'?` switchport access vlan ${i.vlan}`:` switchport trunk allowed vlan ${i.allowed.join(',')}`]),` ${i.admin?'no shutdown':'shutdown'}`,'!']),...(d.defaultRoute?[`ip route 0.0.0.0 0.0.0.0 ${d.defaultRoute}`]:[])].join('\n');}
function show(m,id,input) {
  const d=m.devices[id];
  const linkUp=(name,i)=>i.admin&&(id!=='access'||name!==m.port||m.physical.power&&m.physical.cable&&m.physical.fiber);
  if(matchTokens(input,'show running-config'))return configText(d);
  if(matchTokens(input,'show startup-config'))return configText({...d,...JSON.parse(d.saved)});
  if(matchTokens(input,'show interfaces status'))return `Port                    Name                   Status        Vlan\n${Object.entries(d.interfaces).map(([k,i])=>`${k.padEnd(23)} ${i.description.slice(0,21).padEnd(22)} ${(!i.admin?'disabled':linkUp(k,i)?'connected':'notconnect').padEnd(13)} ${i.mode==='trunk'?'trunk':i.vlan}`).join('\n')}`;
  if(matchTokens(input,'show ip interface brief'))return `Interface               IP-Address      OK? Method Status                Protocol\n${Object.entries(d.interfaces).map(([k,i])=>`${k.padEnd(23)} ${(i.ip??'unassigned').padEnd(15)} YES manual ${!i.admin?'administratively down down':linkUp(k,i)?'up                    up':'down                  down'}`).join('\n')}`;
  if(matchTokens(input,'show vlan brief')){if(d.kind!=='switch')return '% VLAN switching is not supported on this routed model.';const vlans=[...new Set([1,m.vlan,900,...Object.values(d.interfaces).map(i=>i.vlan)])].sort((a,b)=>a-b);return `VLAN Name                Status    Ports\n${vlans.map(v=>`${String(v).padEnd(5)} ${`VLAN${v}`.padEnd(19)} active    ${Object.entries(d.interfaces).filter(([,i])=>i.mode==='access'&&i.vlan===v).map(([k])=>k).join(', ')}`).join('\n')}`;}
  if(matchTokens(input,'show interfaces trunk'))return Object.entries(d.interfaces).filter(([,i])=>i.mode==='trunk').map(([n,i])=>`${n}  ${i.admin?'trunking':'down'}\nVlans allowed on trunk: ${i.allowed.join(',')}`).join('\n')||'No trunk interfaces.';
  if(matchTokens(input,'show ip route'))return `Codes: C - connected, S - static\n${Object.values(d.interfaces).filter(i=>i.ip&&i.admin).map(i=>`C ${i.ip.slice(0,i.ip.lastIndexOf('.'))}.0/${i.mask==='255.255.255.252'?'30':'24'} is directly connected`).join('\n')}\n${d.defaultRoute?`S* 0.0.0.0/0 [1/0] via ${d.defaultRoute}`:'Gateway of last resort is not set'}`;
  if(matchTokens(input,'show cdp neighbors'))return id==='access'?`Device ID     Local Intrfce         Capability  Platform   Port ID\nEdge-R1       Gig 1/0/1            R           ISR        Gig 0/1`:'Access-SW     Gig 0/1              S           Catalyst   Gig 1/0/1';
  if(matchTokens(input,'show mac address-table'))return `${m.vlan}   001c.7300.0024   DYNAMIC   ${m.port}\n900   001c.7300.0900   DYNAMIC   Gi1/0/24`;
  if(/^sh(?:ow)? int(?:erfaces)? /i.test(input)){
    const parts=input.split(' '),sw=parts.at(-1)==='switchport';const name=interfaceName(d,parts.slice(2,sw?-1:undefined).join(''));
    if(name){const i=d.interfaces[name];return `${name} is ${!i.admin?'administratively down':linkUp(name,i)?'up':'down'}, line protocol is ${linkUp(name,i)?'up':'down'}\nDescription: ${i.description}\n${sw?`Administrative Mode: ${i.mode}\nAccess Mode VLAN: ${i.vlan}\nTrunking VLANs Enabled: ${i.allowed.join(',')}`:'Full-duplex, 1000Mb/s\n0 input errors, 0 CRC, 0 collisions'}`;}
  }
  return null;
}
function help(d) {
  if(d.mode==='user')return 'enable  Enter privileged EXEC\nshow ip interface brief\nshow interfaces status\n?  Context-sensitive help';
  if(d.mode==='privileged')return 'configure terminal\nshow running-config | startup-config | vlan brief | interfaces status | interfaces trunk\nshow ip interface brief | ip route | cdp neighbors | mac address-table\ncopy running-config startup-config\ndisable';
  if(d.mode==='config')return `interface <name>\n${d.kind==='router'?'ip route 0.0.0.0 0.0.0.0 <next-hop>\nno ip route 0.0.0.0 0.0.0.0 <next-hop>\n':''}end\nexit`;
  return `description <text>\n${d.kind==='switch'?'switchport mode access | trunk\nswitchport access vlan <1-4094>\nswitchport trunk allowed vlan <list>\n':''}shutdown\nno shutdown\nexit\nend`;
}
function clientCommand(m,input) {
  const s=input.toLowerCase().trim();
  if(['?','help'].includes(s))return m.client.platform==='linux'?'ip addr; ip route; resolvectl status; ping <address>; traceroute <address>; nslookup <name>; curl https://status.northline.test':'ipconfig /all; ping <address>; tracert <address>; nslookup <name>; curl https://status.northline.test';
  if(['ipconfig','ipconfig /all','ip addr','ip a'].includes(s))return `Ethernet\nIPv4: ${m.client.ip}\nSubnet mask: ${m.client.mask}\nDefault gateway: ${m.client.gateway}\nDNS server: ${m.client.dns}`;
  if(s==='ip route'||s==='route print')return `default via ${m.client.gateway}\n192.168.${m.expected.ip.split('.')[2]}.0/24 dev eth0 src ${m.client.ip}`;
  if(s==='resolvectl status'||s==='cat /etc/resolv.conf')return `DNS server: ${m.client.dns}`;
  if(s.startsWith('ping ')){
    const target=s.split(/\s+/).at(-1);
    if(target===m.expected.gateway)return runTest(m,'gateway').detail;
    if(target==='198.51.100.10')return runTest(m,'internet').detail;
    if(target==='status.northline.test')return serviceState(m).dns?runTest(m,'internet').detail:'Could not resolve or reach the host.';
    if(target===m.client.ip)return `Reply from ${m.client.ip}: time<1ms`;
    return 'This simulated lab supports ping to the workstation, its documented gateway, 198.51.100.10, and status.northline.test. No real network request was made.';
  }
  if(s.startsWith('nslookup ')||s.startsWith('dig '))return s.split(' ').at(-1)==='status.northline.test'?runTest(m,'dns').detail:'This lab includes the status.northline.test DNS record only.';
  if(s.startsWith('tracert ')||s.startsWith('traceroute '))return /198\.51\.100\.10$/.test(s)?runTest(m,'trace').detail:'Use the supplied test host: 198.51.100.10.';
  if(s==='curl https://status.northline.test')return runTest(m,'web').detail;
  return 'Simulator limitation: this command is not implemented on this workstation. Type help for supported commands. Address changes are available in Workstation settings.';
}
export function execute(m,id,raw,{assisted=false,authorized=true,now=Date.now()}={}) {
  const input=raw.trim().replace(/\s+/g,' ');if(!input)return '';
  if(input.length>300)return 'Command too long (maximum 300 characters).';
  m.help.submitted++;if(assisted)m.help.built++;
  const p=prompt(m,id);let output='';
  if(id==='client') output=clientCommand(m,input);
  else {
    const d=m.devices[id],s=input.toLowerCase(),before=serviceState(m),old=configOf(d);
    if(s==='e')output='% Ambiguous command: e (enable, end, or exit).';
    else if(s==='?')output=help(d);
    else if(s.endsWith(' ?'))output=help(d);
    else if(matchTokens(s,'enable')){if(d.mode==='user')d.mode='privileged';}
    else if(matchTokens(s,'disable')){d.mode='user';d.selected=null;}
    else if(matchTokens(s,'end')){if(d.mode!=='user'){d.mode='privileged';d.selected=null;}}
    else if(matchTokens(s,'exit')){if(d.mode==='interface'){d.mode='config';d.selected=null;}else if(d.mode==='config')d.mode='privileged';else d.mode='user';}
    else if(matchTokens(s,'configure terminal')){if(d.mode!=='privileged')output='% This command requires privileged EXEC mode. Type enable first.';else if(!authorized)output='% Your career role requires an authorized colleague for this device.';else d.mode='config';}
    else if(matchTokens(s,'copy running-config startup-config')||s==='write memory'||s==='wr'){if(d.mode!=='privileged')output='% Return to privileged EXEC mode to save.';else if(!authorized)output='% An authorized colleague must save this device.';else{d.saved=configOf(d);d.dirty=false;output='Building configuration...\n[OK]';event(m,'save',`${d.name}: saved startup configuration.`);}}
    else if(/^sh(?:ow)?( |$)/.test(s)){
      if(['config','interface'].includes(d.mode))output='% Use end to return to EXEC, or use do show <command>.';
      else if(d.mode==='user'&&(matchTokens(s,'show running-config')||matchTokens(s,'show startup-config')))output='% Privileged EXEC required.';
      else output=show(m,id,s)??'Simulator limitation: this show command is not implemented. Type ? for supported alternatives.';
    }
    else if(s.startsWith('do ')&&['config','interface'].includes(d.mode))output=show(m,id,s.slice(3))??'Simulator limitation: supported show commands are listed by ?.';
    else if(['config','interface'].includes(d.mode)){
      if(!authorized)output='% Your role requires an authorized colleague for configuration.';
      else if(/^int(?:erface)? /.test(s)){const name=interfaceName(d,s.split(' ').slice(1).join(''));if(!name)output='% Interface not found. Use show ip interface brief.';else{d.mode='interface';d.selected=name;}}
      else if(/^ip route /.test(s)&&d.mode==='config'&&d.kind==='router'){
        const a=s.split(' ');if(a.length===5&&a[2]==='0.0.0.0'&&a[3]==='0.0.0.0'&&validIP(a[4]))d.defaultRoute=a[4];else output='Simulator limitation: this access lab supports a static default route only.';
      }else if(/^no ip route /.test(s)&&d.mode==='config'&&d.kind==='router'){
        const a=s.split(' ');if(a.length===6&&a[3]==='0.0.0.0'&&a[4]==='0.0.0.0'&&a[5]===d.defaultRoute)d.defaultRoute=null;else output='% No matching route.';
      }else if(d.mode==='interface'){
        const i=d.interfaces[d.selected];
        if(matchTokens(s,'shutdown'))i.admin=false;
        else if(matchTokens(s,'no shutdown'))i.admin=true;
        else if(/^desc(?:ription)? /.test(s))i.description=input.split(' ').slice(1).join(' ');
        else if(d.kind==='switch'&&/^(?:sw|switchport) (?:mo|mode) (access|trunk)$/.test(s))i.mode=s.split(' ').at(-1);
        else if(d.kind==='switch'&&/^(?:sw|switchport) (?:acc|access) (?:vl|vlan) /.test(s)){
          const token=s.split(' ').at(-1),v=Number(token);if(!/^\d+$/.test(token)||v<1||v>4094)output='% VLAN must be an integer from 1 to 4094.';else i.vlan=v;
        }else if(d.kind==='switch'&&s.startsWith('switchport trunk allowed vlan ')){
          const value=s.slice('switchport trunk allowed vlan '.length);const list=value.split(',').map(Number);
          if(list.every(v=>Number.isInteger(v)&&v>=1&&v<=4094))i.allowed=[...new Set(list)];else output='Simulator limitation: use a comma-separated list of VLAN IDs.';
        }else output='Simulator limitation or invalid syntax. Type ? for supported interface commands.';
      } else output='Simulator limitation or invalid syntax. Type ? for supported configuration commands.';
    }
    else output='% Command not available here. Type ? for supported commands in this mode.';
    if(configOf(d)!==old)changed(m,before,`${d.name}: ${input}`);
  }
  m.terminal[id].push({prompt:p,input,output,assisted,at:now});
  if(m.terminal[id].length>200)m.terminal[id].splice(0,20);
  event(m,'command',`${p}${input}`,{output,assisted,device:id});
  if(output&&!output.startsWith('%')&&/^(sh|ipconfig|ip |nslookup|ping|tracert|traceroute|curl|resolvectl)/i.test(input))evidence(m,`${id}: ${input}`,output,'command');
  return output;
}
export function getHint(m) {
  const unresolved=m.faults.find(f=>faultPresent(m,f))??m.faults[0],f=FAULTS[unresolved];
  const level=Math.min(2,m.hintLevel++),keys=['nudges','clues','solutions'];m.help[keys[level]]++;
  const text=level===0?f.hint:level===1?f.clue:f.solution(m);event(m,'guidance',text,{level});return text;
}
export function faultPresent(m,f) {
  return {vlan:m.devices.access.interfaces[m.port].vlan!==m.vlan,shutdown:!m.devices.access.interfaces[m.port].admin,cable:!m.physical.cable,power:!m.physical.power,dns:m.client.dns!==m.expected.dns,gateway:m.client.gateway!==m.expected.gateway,route:m.devices.edge.defaultRoute!=='203.0.113.1'}[f];
}
export function assessmentChecklist(m) {
  const v=k=>!!(m.verification[k]?.ok&&m.verification[k].revision===m.revision);
  const docs=m.docs;
  return [
    {id:'service',label:'Restore customer service and preserve other customers',ok:serviceState(m).web&&serviceState(m).other},
    {id:'save',label:'Save changed device configurations',ok:Object.values(m.devices).every(d=>!d.dirty)},
    {id:'tests',label:'Verify IP reachability, DNS, and HTTPS after the final change',ok:v('internet')&&v('dns')&&v('web')},
    {id:'customer',label:'Confirm service with the customer after the final change',ok:v('confirm')},
    {id:'cause',label:'Identify the underlying problem(s)',ok:m.faults.every(f=>new RegExp({vlan:'vlan',shutdown:'shut|admin|disabled|no shut',cable:'cable|ethernet|unplug|disconnect',power:'power|supply',dns:'dns|resolv|name server',gateway:'gateway|default gw',route:'route|routing'}[f],'i').test(docs.cause))},
    {id:'docs',label:'Document the change and verification, with supporting evidence',ok:docs.action.trim().split(/\s+/).length>=4&&docs.verify.trim().split(/\s+/).length>=4&&docs.evidence.some(id=>m.evidence.some(e=>e.id===id))},
    {id:'outage',label:'Avoid any additional outage in a scored assessment',ok:!m.failed||!!m.recovery},
  ];
}
export function expertInvestigation(m) {return ['Ask what stopped working, when it started, and which devices are affected.','Read the service order; confirm the expected physical path and addressing.','Check ONT power, optical status, and the Ethernet link.','Check workstation addressing and test local versus remote reachability.',...m.faults.map(f=>FAULTS[f].solution(m)),'Save configuration changes. Repeat IP, DNS, and application tests.','Ask the customer to verify their work, then document the cause, changes, and evidence.'];}
