import {readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
async function scan(dir){for(const e of await readdir(dir,{withFileTypes:true})){const file=`${dir}/${e.name}`;if(e.isDirectory())await scan(file);else if(/\.m?js$/.test(file))execFileSync(process.execPath,['--check',file]);}}
for(const dir of ['src','scripts','tests'])await scan(dir);console.log('JavaScript syntax verified.');
