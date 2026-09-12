export function newClock(seconds, now=Date.now()) { return {remaining:seconds*1000,last:now,pausedAt:null,pauseUsed:0,ended:false,reason:null}; }
export function tick(clock,now=Date.now()) {
  if(clock.ended) return clock;
  if(clock.pausedAt!==null) {
    if(clock.pauseUsed+Math.max(0,now-clock.pausedAt)>=300000) {clock.ended=true;clock.reason='interrupted';}
  } else {
    clock.remaining=Math.max(0,clock.remaining-Math.max(0,now-clock.last));
    if(!clock.remaining){clock.ended=true;clock.reason='timeout';}
  }
  clock.last=now;return clock;
}
export function pauseClock(clock,now=Date.now()) { tick(clock,now);if(!clock.ended && clock.pausedAt===null) clock.pausedAt=now;return clock; }
export function resumeClock(clock,now=Date.now()) {
  tick(clock,now);
  if(!clock.ended && clock.pausedAt!==null){clock.pauseUsed+=Math.max(0,now-clock.pausedAt);clock.pausedAt=null;clock.last=now;}
  return clock;
}
export function formatTime(ms) { const seconds=Math.max(0,Math.ceil(ms/1000));return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`; }
