import {build} from 'esbuild';
import assert from 'node:assert/strict';
const data=new Map();let connected=true;
class Ref {constructor(path){this.path=path;}collection(n){return new Col(this.path+'/'+n);}async get(){return {exists:data.has(this.path),data:()=>structuredClone(data.get(this.path))};}async create(v){if(data.has(this.path))throw new Error('exists');data.set(this.path,structuredClone(v));}async update(v){const old=data.get(this.path);if(!old)throw new Error('missing');for(const [k,x]of Object.entries(v)){old[k]=x?.__increment!==undefined?(old[k]||0)+x.__increment:x;}}}
class Col {constructor(path){this.path=path;}doc(id){return new Ref(this.path+'/'+id);}where(k,op,v){const get=async()=>({docs:(await this.get()).docs.filter(d=>op==='<= '?d.data()[k]<=v:op==='<='?!!d.data()[k]&&d.data()[k]<=v:d.data()[k]===v)});return {get,limit:()=>({get})};}async get(){return {docs:[...data].filter(([p])=>p.startsWith(this.path+'/')&&!p.slice(this.path.length+1).includes('/')).map(([p,v])=>({id:p.split('/').at(-1),data:()=>structuredClone(v)}))};}}
const db={collection:n=>new Col(n),runTransaction:async fn=>{const changes=[];const result=await fn({get:r=>r.get(),create:(r,v)=>changes.push(()=>r.create(v)),set:(r,v)=>changes.push(()=>data.set(r.path,structuredClone(v))),update:(r,v)=>changes.push(()=>r.update(v))});for(const change of changes)await change();return result;}};
globalThis.__proofingMocks={db,connected:()=>connected};
const mocks={
 'firebase-admin/app':`export const getApps=()=>[];export const cert=x=>x;export const initializeApp=x=>x;`,
 'firebase-admin/auth':`export const getAuth=()=>({verifyIdToken:async t=>{if(t==='admin')return {uid:'studio',email:'tharinduakalanka930@gmail.com',email_verified:true};if(t==='outsider')return {uid:'other',email:'outsider@example.com',email_verified:true};throw Error('invalid');}});`,
 'firebase-admin/firestore':`export const getFirestore=()=>globalThis.__proofingMocks.db;export const FieldValue={increment:n=>({__increment:n}),delete:()=>null};`,
 'storage':`export const driveToken=async()=> 'test-token';export const storageProvider=()=>globalThis.__proofingMocks.connected()?'drive':'r2';export const storePhoto=async(e,key)=>({key,provider:'drive'});export const readPhoto=async()=>new Response(new Uint8Array([255,216,255,217]),{headers:{'Content-Type':'image/jpeg'}});export const deleteStored=async()=>{};`,
};
const built=await build({entryPoints:['lib/proofing/server.ts'],bundle:true,write:false,platform:'node',format:'esm',plugins:[{name:'mock-services',setup(b){b.onResolve({filter:/^firebase-admin\//},a=>({path:a.path,namespace:'mock'}));b.onResolve({filter:/^\.\/storage$/},()=>({path:'storage',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},a=>({contents:mocks[a.path],loader:'js'}));}}]});
const {handleProofing}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
process.env.FIREBASE_PROJECT_ID='test';process.env.FIREBASE_CLIENT_EMAIL='test@example.com';process.env.FIREBASE_PRIVATE_KEY='test';delete process.env.RESEND_API_KEY;
let checks=0;
async function req(p,{auth='admin',body,form,code=200,origin}={}){const headers=new Headers();if(auth)headers.set('Authorization','Bearer '+auth);if(body)headers.set('Content-Type','application/json');if(origin)headers.set('Origin',origin);const r=await handleProofing(new Request('https://snapverse.example/api/proofing/'+p,{method:body||form?'POST':'GET',headers,body:form|| (body?JSON.stringify(body):undefined)}));const text=await r.text();assert.equal(r.status,code,`${p}: ${text}`);checks++;try{return JSON.parse(text);}catch{return text;}}
await req('albums',{auth:null,code:401});await req('albums',{auth:'outsider',code:403});await req('albums',{body:{title:'X',client:'C',max:0},origin:'https://evil.example',code:403});
const {id}=await req('albums',{body:{title:'Wedding QA',client:'Client',max:2},code:201});
await req('albums/'+id+'/publish',{body:{},code:400});
const file=()=>{const f=new FormData();f.append('file',new Blob([new Uint8Array([255,216,255,217])]),'DSC_0001.jpg');f.append('name','DSC_0001.jpg');return f;};
connected=false;await req('albums/'+id+'/photos',{form:file(),code:503});connected=true;
await req('albums/'+id+'/photos',{form:file(),code:201});await req('albums/'+id+'/photos',{form:file(),code:409});
let a=await req('albums/'+id);const token=a.album.token,client='?token='+token;const pid=a.photos[0].id;
await req('albums/'+id+client,{auth:null,code:403});await req('albums/'+id+'/publish',{body:{}});
a=await req('albums/'+id+client,{auth:null});assert.equal(a.album.token,undefined);assert.equal(a.isOwner,false);checks+=2;
await req('albums/'+id+'?token=wrong',{auth:null,code:403});
await req('albums/'+id+'/reopen'+client,{auth:null,body:{},code:403});
await req('albums/'+id+'/selection'+client,{auth:null,body:{ids:['unknown'],notes:{}},code:400});
await req('albums/'+id+'/selection'+client,{auth:null,body:{ids:[pid],notes:{[pid]:'Crop please'}}});
a=await req('albums/'+id+client,{auth:null});assert.equal(a.photos[0].selected,true);assert.equal(a.photos[0].note,'Crop please');checks+=2;
await req('albums/'+id+'/export'+client,{auth:null,code:400});
await req('albums/'+id+'/selection'+client,{auth:null,body:{ids:[pid],notes:{[pid]:'Crop please'},submit:true}});
await req('albums/'+id+'/selection'+client,{auth:null,body:{ids:[],notes:{}},code:409});
const txt=await req('albums/'+id+'/export'+client,{auth:null});assert.match(txt,/SNAPPERS-SELECTION-1\nWedding QA\nDSC_0001.jpg/);checks++;
a=await req('albums/'+id);assert.match(a.album.notification,/not configured/);assert.equal(a.album.status,'submitted');checks+=2;
const originalFetch=globalThis.fetch;let mail;
process.env.GOOGLE_GMAIL_ENABLED='true';process.env.GOOGLE_REFRESH_TOKEN='fake-refresh';
globalThis.fetch=async(url,init)=>{assert.equal(url,'https://gmail.googleapis.com/gmail/v1/users/me/messages/send');mail=Buffer.from(JSON.parse(init.body).raw,'base64url').toString('utf8');return Response.json({id:'mock-mail'});};
try{const notified=await req('albums/'+id+'/notify',{body:{}});assert.equal(notified.notification,'Email sent');assert.match(mail,/To: tharinduakalanka930@gmail.com/);assert.match(mail,/Content-Transfer-Encoding: base64/);assert.match(mail,/Content-Type: multipart\/mixed/);assert.match(mail,/filename="Snappers-Selection.snappers-selection"/);const attachment=mail.split('Content-Disposition: attachment;')[1].split('\r\n\r\n')[1].split('\r\n--')[0];assert.equal(Buffer.from(attachment.replaceAll('\r\n',''),'base64').toString('utf8'),'SNAPPERS-SELECTION-1\nWedding QA\nDSC_0001.jpg\n');assert.ok(!Buffer.from(attachment,'base64').toString('utf8').includes(token));checks+=7;}finally{globalThis.fetch=originalFetch;delete process.env.GOOGLE_GMAIL_ENABLED;delete process.env.GOOGLE_REFRESH_TOKEN;}
process.env.CRON_SECRET='cron-test';
await req('cleanup',{auth:null,code:401});await req('cleanup',{auth:'wrong',code:401});
const albumRecord=data.get('proofing_albums/'+id);
albumRecord.submitted=new Date(Date.now()-15*86400000).toISOString();albumRecord.cleanupAt=new Date(Date.now()-86400000).toISOString();
const futureId='future';data.set('proofing_albums/'+futureId,{...structuredClone(albumRecord),id:futureId,submitted:new Date().toISOString(),cleanupAt:new Date(Date.now()+14*86400000).toISOString()});
const savedFetch=globalThis.fetch;globalThis.fetch=async(url,init)=>init.method==='PATCH'?Response.json({id:pid}):Response.json({id:albumRecord.id+'/'+pid,appProperties:{snappersKey:albumRecord.id+'/'+pid}});
try{const result=await req('cleanup',{auth:'cron-test'});assert.equal(result.completed,1);assert.equal(data.get('proofing_albums/'+futureId).cleanupState,undefined);assert.equal(data.get('proofing_albums/'+id+'/photos/'+pid).previewClearedAt!==undefined,true);checks+=3;
await req('albums/'+id+'/photos/'+pid,{code:410});await req('albums/'+id+'/reopen',{body:{},code:409});await req('albums/'+id+'/export');
const again=await req('cleanup',{auth:'cron-test'});assert.equal(again.completed,0);checks++;
}finally{globalThis.fetch=savedFetch;}
albumRecord.cleanupState=null;albumRecord.previewsClearedAt=null;
await req('albums/'+id+'/reopen',{body:{}});await req('albums/'+id+client,{auth:null,code:403});
console.log(JSON.stringify({checks,result:'PASS',services:'Firestore, Firebase Auth, Drive mocked; real application handler'},null,2));
