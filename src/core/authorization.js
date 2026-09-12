const decode=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
export async function redeemAuthorization(code,profile,issuer) {
  if(!issuer)throw new Error('This deployment has no authorization issuer configured.');
  const [payload,signature,...extra]=code.trim().split('.');if(!payload||!signature||extra.length)throw new Error('Invalid authorization code.');
  const key=await crypto.subtle.importKey('jwk',issuer,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
  const verified=await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,decode(signature),new TextEncoder().encode(payload));
  if(!verified)throw new Error('Invalid authorization code.');
  const grant=JSON.parse(new TextDecoder().decode(decode(payload)));
  if(grant.subject!==profile.id||grant.purpose!=='prerequisite-reassessment'||typeof grant.id!=='string')throw new Error('This code was not issued for this learner.');
  if(profile.redeemed.includes(grant.id))throw new Error('This authorization has already been redeemed.');
  profile.redeemed.push(grant.id);profile.grant=grant;profile.gate='authorized';return grant;
}
