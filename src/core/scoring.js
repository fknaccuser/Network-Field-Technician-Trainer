export function careerCredit({base, repeats=0, referenceOpens=0, submitted=0, built=0, nudges=0, clues=0, solutions=0, guided=false}) {
  const deductions = guided ? {reference:0,builder:0,guidance:0} : {
    reference: referenceOpens*.02,
    builder: submitted ? Math.min(1,built/submitted)*.30 : 0,
    guidance: nudges*.02+clues*.05+solutions*.10,
  };
  const deduction=Math.min(.5,Object.values(deductions).reduce((a,b)=>a+b,0));
  const multiplier=[1,.5,.25][repeats]??0;
  return {base,deductions,deduction,multiplier,total:Math.round(base*(1-deduction)*multiplier)};
}
export function prerequisiteScore(items) {
  const section = kind => { const a=items.filter(x=>x.kind===kind); return a.length ? a.reduce((s,x)=>s+(x.correct?1:0),0)/a.length : 0; };
  const score=100*(.5*section('knowledge')+.5*section('practical'));
  return {score,passed:score>=70};
}
export const assessmentScore = items => items.length ? Math.round(100*items.filter(x=>x.correct).length/items.length) : 0;
export function masteryStatus(record,intervalDays,now=Date.now()) {
  if(!record?.knowledgeAt || !record?.practicalAt) return 'developing';
  const refreshed=Math.min(record.knowledgeAt,record.practicalAt);
  return now-refreshed>=intervalDays*86400000 ? 'reassessment due':'current';
}
