import {build} from 'esbuild';import assert from 'node:assert/strict';
const built=await build({entryPoints:['lib/proofing/storage.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const storage=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
const originalFetch=globalThis.fetch;let authCalls=0,uploads=0,deletes=0,quota=false,failAuth=false;let checks=0;
const config={GOOGLE_CLIENT_ID:'client',GOOGLE_CLIENT_SECRET:'secret',GOOGLE_REFRESH_TOKEN:'refresh',GOOGLE_DRIVE_FOLDER_ID:'owned-folder'};
globalThis.fetch=async(url,init)=>{
 if(String(url).includes('oauth2.googleapis.com')){authCalls++;if(failAuth)return Response.json({error:'invalid_grant'},{status:400});return Response.json({access_token:'fake-access',expires_in:3600});}
 assert.equal(init.headers.Authorization,'Bearer fake-access');checks++;
 if(String(url).includes('/upload/')){uploads++;const metadata=JSON.parse(await init.body.get('metadata').text());assert.deepEqual(metadata.parents,['owned-folder']);assert.equal(metadata.name,'DSC_0001.jpg');checks+=2;return quota?Response.json({error:'quota'},{status:403}):Response.json({id:'file-id'});}
 if(init.method==='DELETE'){deletes++;return new Response(null,{status:204});}
 return new Response(new Uint8Array([255,216,255,217]),{headers:{'Content-Type':'image/jpeg'}});
};
try{
 await Promise.all([storage.driveToken(config),storage.driveToken(config),storage.driveToken(config)]);assert.equal(authCalls,1);checks++;
 assert.equal(storage.storageProvider(config),'drive');assert.equal(storage.storageProvider({}),'r2');checks+=2;
 const saved=await storage.storePhoto(config,'album/photo',new Uint8Array([255,216,255,217]).buffer,'DSC_0001.jpg');assert.deepEqual(saved,{provider:'drive',key:'file-id'});assert.equal(authCalls,1);checks+=2;
 const image=await storage.readPhoto(config,saved);assert.equal(image.headers.get('Content-Type'),'image/jpeg');assert.equal((await image.arrayBuffer()).byteLength,4);checks+=2;
 await storage.deleteStored(config,saved);assert.equal(deletes,1);checks++;
 quota=true;await assert.rejects(()=>storage.storePhoto(config,'album/photo',new ArrayBuffer(4),'DSC_0001.jpg'),/Google Drive upload failed/);checks++;
 failAuth=true;await assert.rejects(()=>storage.driveToken({...config,GOOGLE_REFRESH_TOKEN:'expired'}),/connection needs attention/);checks++;
 console.log(JSON.stringify({checks,result:'PASS',services:'real Drive adapter; HTTP responses mocked'},null,2));
}finally{globalThis.fetch=originalFetch;}
