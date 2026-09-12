export const GENERATOR_VERSION = 'access-1.0.0';
export function hash(text) {
  let h = 2166136261;
  for (const c of String(text)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function rng(seed) {
  let a = hash(seed);
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export const pick = (r, items) => items[Math.floor(r() * items.length)];
export function shuffle(r, items) { const a = [...items]; for (let i=a.length-1;i>0;i--) { const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
export function freshSeed() { return Array.from(crypto.getRandomValues(new Uint32Array(2)), n=>n.toString(36)).join('-').toUpperCase(); }
export const challengeKey = (mission) => `${mission.seed}@${mission.version}`;
export function shareSeed(mission) { return `FIELD:${mission.version}:${mission.difficulty}:${encodeURIComponent(mission.seed)}`; }
export function parseSeed(value) {
  const raw=value.trim(); if(!raw || raw.length>180) throw new Error('Enter a seed between 1 and 180 characters.');
  if(!raw.startsWith('FIELD:')) return {seed:raw,version:GENERATOR_VERSION,difficulty:1};
  const [,version,difficulty,encoded,...extra]=raw.split(':');
  if(!encoded || extra.length || ![1,2,3].includes(Number(difficulty))) throw new Error('That shared seed is incomplete.');
  return {seed:decodeURIComponent(encoded),version,difficulty:Number(difficulty)};
}
