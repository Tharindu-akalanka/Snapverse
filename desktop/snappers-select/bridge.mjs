import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
export function parseRequest(value,site){
 const u=new URL(value),origin=new URL(site);
 if(u.protocol!=='snappers-select:'||u.hostname!=='open')throw new Error('Invalid Snappers request');
 if(origin.protocol!=='https:'||origin.username||origin.password||origin.pathname!=='/'||origin.search||origin.hash)throw new Error('Configure a trusted HTTPS site origin');
 const album=u.searchParams.get('album'),token=u.searchParams.get('token');
 if(!album||!/^[a-zA-Z0-9-]{10,80}$/.test(album)||!token||!/^[a-zA-Z0-9-]{30,150}$/.test(token))throw new Error('Invalid album credentials');
 return new URL(`/api/proofing/albums/${encodeURIComponent(album)}/export?token=${encodeURIComponent(token)}`,origin);
}
export function validateManifest(content){
 if(Buffer.byteLength(content,'utf8')>5_000_000)throw Error('Selection is too large');
 const lines=content.replaceAll('\r\n','\n').split('\n');
 if(lines[0]!=='SNAPPERS-SELECTION-1'||!lines[1]||lines[1].length>150)throw Error('Invalid selection file');
 const photos=lines.slice(2);if(photos.at(-1)==='')photos.pop();
 if(!photos.length||photos.length>10000||new Set(photos).size!==photos.length)throw Error('Invalid selection photos');
 for(const photo of photos){if(photo.length>600||/[\x00-\x1f\\]/.test(photo)||!/^.+\.jpe?g$/i.test(photo)||photo.split('/').some(p=>!p||p==='.'||p==='..'||p.includes(':')))throw Error('Invalid photo path');}
 return lines.slice(0,2).concat(photos).join('\n')+'\n';
}
export async function loadSelection(value,site){
 if(typeof value!=='string')throw Error('Choose a Snappers selection file');
 if(!value.startsWith('snappers-select:')){
  if(path.extname(value).toLowerCase()!=='.snappers-selection')throw Error('Choose a .snappers-selection attachment');
  const stat=await fs.stat(value);if(!stat.isFile()||stat.size>5_000_000)throw Error('Invalid selection file size');
  return validateManifest(await fs.readFile(value,'utf8'));
 }
 const target=parseRequest(value,site);
 const r=await fetch(target,{redirect:'error',signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error('Selection unavailable or not submitted');
 const chunks=[];let size=0;for await(const chunk of r.body){size+=chunk.length;if(size>5_000_000)throw Error('Selection is too large');chunks.push(chunk);}
 return validateManifest(Buffer.concat(chunks).toString('utf8'));
}
async function main(){
 const dir=path.dirname(fileURLToPath(import.meta.url));const config=JSON.parse(await fs.readFile(path.join(dir,'bridge-config.json'),'utf8'));
 const content=await loadSelection(process.argv[2],config.siteOrigin);
 const inbox=config.inboxPath||path.join(os.homedir(),'Documents','SnappersSelect','Inbox');await fs.mkdir(inbox,{recursive:true});
 const id=randomUUID();const tmp=path.join(inbox,`${id}.tmp`),final=path.join(inbox,`${id}.txt`);
 await fs.writeFile(tmp,content,'utf8');await fs.rename(tmp,final);
 const stat=await fs.stat(config.lightroomPath);if(!stat.isFile()||path.basename(config.lightroomPath).toLowerCase()!=='lightroom.exe')throw new Error('Configure the Lightroom Classic executable');
 const child=spawn(config.lightroomPath,[],{detached:true,stdio:'ignore',windowsHide:true});child.unref();
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(async err=>{
 const folder=path.join(os.homedir(),'Documents','SnappersSelect');await fs.mkdir(folder,{recursive:true});await fs.writeFile(path.join(folder,'last-error.txt'),`${new Date().toISOString()}\n${err.message}\n`);process.exitCode=1;
});
