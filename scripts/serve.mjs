import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.argv[2]??'.'),port=Number(process.env.PORT??4173);
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
http.createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://localhost'),p=decodeURIComponent(url.pathname);let file=path.resolve(root,'.'+p);
  if(!file.startsWith(root+path.sep)&&file!==root)throw Error('Outside root');
  if(p.includes('/.'))throw Error('Private path');
  if((await stat(file).catch(()=>null))?.isDirectory())file=path.join(file,'index.html');
  let bytes=await readFile(file).catch(()=>null);
  if(!bytes&&root===process.cwd()){file=path.join(root,'public',p);bytes=await readFile(file).catch(()=>null);}
  if(!bytes){res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]??'application/octet-stream','Cache-Control':'no-cache'});res.end(bytes);
}catch{res.writeHead(400);res.end('Invalid request');}}).listen(port,'0.0.0.0',()=>console.log(`The Field: http://localhost:${port}`));
