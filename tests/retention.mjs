import {build} from 'esbuild';
import assert from 'node:assert/strict';
const compiled=await build({entryPoints:['lib/proofing/retention.ts'],bundle:true,write:false,format:'esm',platform:'node',plugins:[{name:'auth',setup(b){b.onResolve({filter:/^\.\/storage$/},()=>({path:'auth',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export const driveToken=async()=>"test";'}));}}]});
const {deleteExpiredPreview,cleanupDate}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
assert.equal(cleanupDate('2026-10-20T10:00:00.000Z'),'2026-11-03T10:00:00.000Z');
const original=globalThis.fetch;let patches=0,mode='valid';
globalThis.fetch=async(url,init)=>{assert.match(String(url),/\/files\/file-1/);if(init.method==='DELETE'){patches++;return new Response('{}');}if(mode==='missing')return new Response('',{status:404});if(mode==='failure')return new Response('',{status:403});return Response.json({id:'file-1',trashed:mode==='trashed',appProperties:mode==='untagged'?{}:{snappersKey:mode==='other'?'other-shoot/photo-1':'shoot-1/photo-1'}});};
try{const p={provider:'drive',key:'file-1',id:'photo-1'};await deleteExpiredPreview({},'shoot-1',p);assert.equal(patches,1);
for(const m of ['other','untagged','failure']){mode=m;await assert.rejects(()=>deleteExpiredPreview({},'shoot-1',p));}
for(const m of ['missing']){mode=m;await deleteExpiredPreview({},'shoot-1',p);}
await assert.rejects(()=>deleteExpiredPreview({},'shoot-1',{...p,provider:'r2'}));assert.equal(patches,1);
console.log('PASS retention deadline, exact shoot ownership, untagged files rejected, wrong shoot rejected, API failure closed, idempotent missing, deletes only verified file IDs');
}finally{globalThis.fetch=original;}
