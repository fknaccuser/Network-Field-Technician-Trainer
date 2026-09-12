import {webcrypto,randomUUID} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const b64=bytes=>Buffer.from(bytes).toString('base64url');
if(process.argv[2]==='setup'){
  if(await readFile('.owner/private.json').catch(()=>null))throw new Error('Owner key already exists. Preserve it; do not silently rotate deployed authorization keys.');
  const pair=await webcrypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
  await mkdir('.owner',{recursive:true});
  await writeFile('.owner/private.json',JSON.stringify(await webcrypto.subtle.exportKey('jwk',pair.privateKey)),{mode:0o600});
  const deployment=JSON.parse(await readFile('public/deployment.json','utf8'));deployment.prerequisiteIssuer=await webcrypto.subtle.exportKey('jwk',pair.publicKey);
  await writeFile('public/deployment.json',JSON.stringify(deployment,null,2));
  console.log('Owner signing key created in ignored .owner/private.json. Back it up privately. Deploy the public verification key with the next build.');
}else if(process.argv[2]==='authorize'){
  const subject=process.argv[3];if(!subject)throw new Error('Usage: npm run owner:authorize -- <learner-id>');
  const jwk=JSON.parse(await readFile('.owner/private.json','utf8'));const key=await webcrypto.subtle.importKey('jwk',jwk,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
  const payload=b64(JSON.stringify({id:randomUUID(),subject,purpose:'prerequisite-reassessment'}));
  const signature=await webcrypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,new TextEncoder().encode(payload));
  console.log(payload+'.'+b64(signature));
}else throw new Error('Choose setup or authorize.');
