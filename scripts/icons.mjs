import {deflateSync} from 'node:zlib';
import {writeFile} from 'node:fs/promises';
function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;}
function chunk(type,data){const t=Buffer.from(type),length=Buffer.alloc(4),crc=Buffer.alloc(4);length.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([t,data])));return Buffer.concat([length,t,data,crc]);}
function distance(x,y,x1,y1,x2,y2){const t=Math.max(0,Math.min(1,((x-x1)*(x2-x1)+(y-y1)*(y2-y1))/((x2-x1)**2+(y2-y1)**2)));return Math.hypot(x-(x1+t*(x2-x1)),y-(y1+t*(y2-y1)));}
for(const size of [192,512]){
  const pixels=Buffer.alloc((size*4+1)*size);
  for(let y=0;y<size;y++){pixels[y*(size*4+1)]=0;for(let x=0;x<size;x++){const nx=x/size*512,ny=y/size*512,i=y*(size*4+1)+1+x*4;let color=[8,12,18];if(Math.min(distance(nx,ny,150,185,220,256),distance(nx,ny,220,256,150,327))<14)color=[99,212,230];if(nx>=277&&nx<=369&&ny>=313&&ny<=341)color=[237,242,247];pixels.set([...color,255],i);}}
  const header=Buffer.alloc(13);header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
  await writeFile(`public/icon-${size}.png`,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]));
}
