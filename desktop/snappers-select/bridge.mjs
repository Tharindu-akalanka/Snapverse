import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
export function parseRequest(value,site){
 const u=new URL(value),origin=new URL(site);
 if(u.protocol!=='snappers-select:'||u.hostname!=='open')throw new Error('Invalid Snappers request');
 if(origin.protocol!=='https:'||origin.username||origin.password||origin.pathname!=='/'||origin.search||origin.hash)throw new Error('Configure a trusted HTTPS site origin');
 const album=u.searchParams.get('album'),token=u.searchParams.get('token');
 if(!album||!/^[a-zA-Z0-9-]{10,80}$/.test(album)||!token||!/^[a-zA-Z0-9-]{30,150}$/.test(token))throw new Error('Invalid album credentials');
 return new URL(`/api/proofing/albums/${encodeURIComponent(album)}/export?token=${encodeURIComponent(token)}`,origin);
}
async function main(){
 const dir=path.dirname(fileURLToPath(import.meta.url));const config=JSON.parse(await fs.readFile(path.join(dir,'bridge-config.json'),'utf8'));
 const target=parseRequest(process.argv[2],config.siteOrigin);
 const r=await fetch(target,{redirect:'error',signal:AbortSignal.timeout(45000)});if(!r.ok)throw new Error('Selection is unavailable or has not been submitted');
 const chunks=[];let size=0;for await(const chunk of r.body){size+=chunk.length;if(size>5_000_000)throw new Error('Selection is too large');chunks.push(chunk);}
 const content=Buffer.concat(chunks).toString('utf8');if(!content.startsWith('SNAPPERS-SELECTION-1\n'))throw new Error('Invalid selection response');
 const inbox=config.inboxPath||path.join(os.homedir(),'Documents','SnappersSelect','Inbox');await fs.mkdir(inbox,{recursive:true});
 const id=target.pathname.split('/').at(-2);const tmp=path.join(inbox,`${id}.tmp`),final=path.join(inbox,`${id}.txt`);
 await fs.writeFile(tmp,content,'utf8');await fs.rename(tmp,final);
 const stat=await fs.stat(config.lightroomPath);if(!stat.isFile()||path.basename(config.lightroomPath).toLowerCase()!=='lightroom.exe')throw new Error('Configure the Lightroom Classic executable');
 const child=spawn(config.lightroomPath,[],{detached:true,stdio:'ignore',windowsHide:true});child.unref();
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(async err=>{
 const folder=path.join(os.homedir(),'Documents','SnappersSelect');await fs.mkdir(folder,{recursive:true});await fs.writeFile(path.join(folder,'last-error.txt'),`${new Date().toISOString()}\n${err.message}\n`);process.exitCode=1;
});
