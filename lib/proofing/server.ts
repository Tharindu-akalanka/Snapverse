import {cert,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore,FieldValue} from 'firebase-admin/firestore';
import {randomUUID} from 'node:crypto';
import {cleanName,cleanRelative,validateSelection,exportSelection} from './selection.mjs';
import {storageProvider,storePhoto,readPhoto,deleteStored,driveToken} from './storage';
const collection='proofing_albums';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
function fail(message:string,status=400):never{throw Object.assign(new Error(message),{status});}
function firebase(){
 const existing=getApps().find(a=>a.name==='snappers-proofing');if(existing)return existing;
 const {FIREBASE_PROJECT_ID:projectId,FIREBASE_CLIENT_EMAIL:clientEmail,FIREBASE_PRIVATE_KEY:privateKey}=process.env;
 if(!projectId||!clientEmail||!privateKey)fail('Photo selections need server Firebase credentials. Complete the deployment setup.',503);
 return initializeApp({credential:cert({projectId,clientEmail,privateKey:privateKey.replace(/\\n/g,'\n')})},'snappers-proofing');
}
function database(){return getFirestore(firebase());}
async function connectionEnv(){
 if(process.env.GOOGLE_DRIVE_FOLDER_ID)return process.env;
 if(!process.env.GOOGLE_CLIENT_ID||!process.env.GOOGLE_CLIENT_SECRET||!process.env.GOOGLE_REFRESH_TOKEN)return process.env;
 try{const settings=(await database().collection('proofing_settings').doc('storage').get()).data();return {...process.env,GOOGLE_DRIVE_FOLDER_ID:settings?.folderId};}catch{return process.env;}
}
async function admin(req:Request){
 const token=req.headers.get('authorization')?.replace(/^Bearer /,'');if(!token)fail('Sign in with your studio Google account',401);
 let user;try{user=await getAuth(firebase()).verifyIdToken(token,true);}catch{fail('Please sign in again',401);}
 const allowed=(process.env.PROOFING_ADMIN_EMAILS||'tharinduakalanka930@gmail.com').split(',').map(v=>v.trim().toLowerCase());
 if(!user.email_verified||!user.email||!allowed.includes(user.email.toLowerCase()))fail('Studio administrator access required',403);
 return user.uid;
}
function plain(a:any,owner=false){const {token,owner:uid,...rest}=a;return owner?{...rest,token}:rest;}
async function notify(a:any,count:number){
 const {RESEND_API_KEY,PROOFING_EMAIL_FROM}=process.env;const to=process.env.PROOFING_NOTIFY_EMAIL||'tharinduakalanka930@gmail.com';
 if(process.env.GOOGLE_GMAIL_ENABLED==='true'&&process.env.GOOGLE_REFRESH_TOKEN){
 try{const accessToken=await driveToken(process.env);const from=process.env.GOOGLE_ACCOUNT_EMAIL||'tharinduakalanka930@gmail.com';if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(from))throw new Error('Invalid notification address');
 const subject=Buffer.from(`SnapVerse: ${count} photos selected — ${a.title}`,'utf8').toString('base64');const text=Buffer.from(`${a.client} selected ${count} photos for ${a.title}.\nReview the selection and editing notes at ${process.env.PROOFING_SITE_URL||'https://snapverse-m47a.vercel.app'}/select`,'utf8').toString('base64');const raw=Buffer.from(`From: ${from}\r\nTo: ${to}\r\nSubject: =?UTF-8?B?${subject}?=\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${text}`).toString('base64url');
 const response=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{method:'POST',headers:{Authorization:`Bearer ${accessToken}`,'Content-Type':'application/json'},body:JSON.stringify({raw})});return response.ok?'Email sent':'Email failed — check Gmail permissions and retry';}catch{return 'Email failed — check Gmail permissions and retry';}
 }
 if(!RESEND_API_KEY||!PROOFING_EMAIL_FROM)return 'Email not configured — selection saved in dashboard';
 try{const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`selection-${a.id}-${a.submitted}`},body:JSON.stringify({from:PROOFING_EMAIL_FROM,to:[to],subject:`SnapVerse: ${count} photos selected — ${a.title}`,text:`${a.client} selected ${count} photos for ${a.title}. Review the selection and editing notes at ${process.env.PROOFING_SITE_URL||'https://snapverse-m47a.vercel.app'}/select`})});return r.ok?'Email sent':'Email failed — retry from dashboard';}catch{return 'Email failed — retry from dashboard';}
}
export async function handleProofing(req:Request){try{return await handle(req);}catch(err:any){if(!err.status)console.error('Proofing request failed',{method:req.method,path:new URL(req.url).pathname,type:err.name,code:typeof err.code==='number'?err.code:undefined,detail:err.name==='TypeError'?String(err.message).slice(0,200):undefined});return reply({error:err.status?err.message:(err.message?.startsWith('Invalid')||err.message?.startsWith('Selection')||err.message?.startsWith('Notes')?err.message:'The request could not be completed. Check the service connection and retry.')},err.status||400);}}
async function handle(req:Request):Promise<Response>{
 const url=new URL(req.url),p=url.pathname.split('/').filter(Boolean).slice(2);
 if(req.method==='POST'&&req.headers.get('origin')&&req.headers.get('origin')!==url.origin)fail('Cross-origin request rejected',403);
 const storageEnv=await connectionEnv();
 if(p[0]==='status')return reply({storage:storageProvider(storageEnv),driveConfigured:storageProvider(storageEnv)==='drive',driveAuthorizationReady:!!(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET&&process.env.GOOGLE_REFRESH_TOKEN),emailConfigured:!!((process.env.RESEND_API_KEY&&process.env.PROOFING_EMAIL_FROM)||(process.env.GOOGLE_GMAIL_ENABLED==='true'&&process.env.GOOGLE_REFRESH_TOKEN))});
 if(p[0]==='drive-folder'&&req.method==='POST'){
 await admin(req);if(storageEnv.GOOGLE_DRIVE_FOLDER_ID)return reply({ok:true});
 if(!process.env.GOOGLE_CLIENT_ID||!process.env.GOOGLE_CLIENT_SECRET||!process.env.GOOGLE_REFRESH_TOKEN)fail('Add the Google OAuth connection settings first',503);
 const accessToken=await driveToken(process.env);const response=await fetch('https://www.googleapis.com/drive/v3/files?fields=id',{method:'POST',headers:{Authorization:`Bearer ${accessToken}`,'Content-Type':'application/json'},body:JSON.stringify({name:'SnapVerse Client Previews',mimeType:'application/vnd.google-apps.folder'})});const folder=await response.json();if(!response.ok||!folder.id)fail('Could not create the Google Drive folder. Check the Drive connection.',502);
 await database().collection('proofing_settings').doc('storage').set({folderId:folder.id});return reply({ok:true});
 }
 if(p[0]!=='albums')fail('Not found',404);
 const db=database(),albums=db.collection(collection);
 if(p.length===1){const uid=await admin(req);
 if(req.method==='GET'){const snap=await albums.where('owner','==',uid).get();return reply(snap.docs.map(d=>{const a=d.data();return {...plain(a,true),total:a.total||0,chosen:a.chosen||0};}).sort((a:any,b:any)=>b.created.localeCompare(a.created)));}
 if(req.method==='POST'){const b=await req.json();const title=String(b.title||'').trim(),client=String(b.client||'').trim(),max=Number(b.max||0);
 if(!title||title.length>150||!client||client.length>150||!Number.isInteger(max)||max<0||max>10000)fail('Enter a title, client name, and limit between 0 and 10,000');
 const id=randomUUID();await albums.doc(id).create({id,owner:uid,title,client,max,token:randomUUID()+randomUUID(),status:'draft',created:new Date().toISOString(),total:0,chosen:0,notification:'Not submitted',submitted:null});return reply({id},201);}
 }
 const ref=albums.doc(p[1]||'invalid'),snap=await ref.get();if(!snap.exists)fail('Album not found',404);const a=snap.data()!;
 const token=url.searchParams.get('token'),hasToken=!!token&&token===a.token;
 let isOwner=false;
 if(req.headers.get('authorization')){try{isOwner=(await admin(req))===a.owner;}catch{}}
 if(!isOwner&&(!hasToken||(a.status==='draft'&&p[2]!=='photos')))fail('Album is private or link is no longer available',403);
 const onlyOwner=()=>{if(!isOwner)fail('Studio administrator access required',403);};
 const photosRef=ref.collection('photos');const getPhotos=async()=>{const s=await photosRef.get();return s.docs.map(d=>d.data()).sort((x,y)=>x.relative.localeCompare(y.relative));};
 if(p.length===2&&req.method==='GET'){const ps=await selectionPhotos(ref,await getPhotos());return reply({album:plain(a,isOwner),isOwner,photos:ps.map(({key,provider,...p})=>p)});}
 if(p[2]==='photos'&&p[3]&&req.method==='GET'){const ps=await photosRef.doc(p[3]).get();if(!ps.exists)fail('Photo not found',404);return readPhoto(storageEnv,ps.data());}
 if(p[2]==='photos'&&req.method==='POST'){
 onlyOwner();if(a.status!=='draft')fail('Reopen the album before uploading',409);if(storageProvider(storageEnv)!=='drive')fail('Connect Google Drive before uploading previews',503);
 const form=await req.formData(),file=form.get('file');if(!(file instanceof File))fail('Choose a JPEG file');const name=cleanName(String(form.get('name')||file.name)),relative=cleanRelative(form.get('relative'),name);
 if(file.size<4||file.size>3*1024*1024)fail('Preview must be smaller than 3 MB',413);const data=await file.arrayBuffer(),sig=new Uint8Array(data);if(sig[0]!==255||sig[1]!==216||sig[2]!==255)fail('Choose a valid JPEG preview');
 // Deterministic path key prevents duplicate uploads even across simultaneous requests.
 const {createHash}=await import('node:crypto');const pid=createHash('sha256').update(relative).digest('hex');const pref=photosRef.doc(pid);
 if((await pref.get()).exists)fail('This photo is already uploaded',409);
 const stored=await storePhoto(storageEnv,`${a.id}/${pid}`,data,name);
 try{await db.runTransaction(async tx=>{const current=await tx.get(ref),existing=await tx.get(pref);if(current.data()?.status!=='draft')fail('Album changed while uploading',409);if(existing.exists)fail('This photo is already uploaded',409);if((current.data()?.total||0)>=10000)fail('An album can contain up to 10,000 previews');tx.create(pref,{id:pid,name,relative,...stored,bytes:file.size,selected:false,note:''});tx.update(ref,{total:FieldValue.increment(1)});});}catch(err){await deleteStored(storageEnv,stored);throw err;}return reply({id:pid},201);
 }
 if(p[2]==='publish'&&req.method==='POST'){onlyOwner();await db.runTransaction(async tx=>{const current=(await tx.get(ref)).data()!;if(current.status!=='draft')fail('Already shared',409);if(!current.total)fail('Upload previews before sharing');tx.update(ref,{status:'open'});});return reply({ok:true});}
 if(p[2]==='reopen'&&req.method==='POST'){onlyOwner();await ref.update({status:'draft',submitted:null});return reply({ok:true});}
 if(p[2]==='selection'&&req.method==='POST'){
 const b=await req.json();const ps=await getPhotos(),v=validateSelection(ps,b.ids,b.notes,a.max);if(b.submit&&!v.ids.length)fail('Select at least one photo');if(new TextEncoder().encode(JSON.stringify(v)).length>700000)fail('Editing notes are too long. Shorten some notes before saving.');
 // Keep one compact selection document, so thousands of photos do not exceed a transaction's write limit.
 const submission=new Date().toISOString();await db.runTransaction(async tx=>{const current=(await tx.get(ref)).data()!;if(current.status!=='open')fail('Album is closed. Refresh to view the final selection.',409);const currentValidated=validateSelection(ps,v.ids,v.notes,current.max);tx.set(ref.collection('private').doc('selection'),{ids:currentValidated.ids,notes:currentValidated.notes});tx.update(ref,{chosen:v.ids.length,...(b.submit?{status:'submitted',submitted:submission,notification:'Sending notification'}:{})});});
 if(b.submit){const n=await notify({...a,submitted:submission},v.ids.length);await ref.update({notification:n});}return reply({ok:true,submitted:!!b.submit});
 }
 if(p[2]==='notify'&&req.method==='POST'){onlyOwner();if(a.status!=='submitted')fail('No submitted selection');const notification=await notify(a,a.chosen);await ref.update({notification});return reply({notification});}
 if(p[2]==='export'&&req.method==='GET'){if(a.status!=='submitted')fail('Wait for the submitted selection');const ps=await selectionPhotos(ref,await getPhotos());return new Response(exportSelection(a.title,ps),{headers:{'Content-Type':'text/plain; charset=utf-8','Content-Disposition':'attachment; filename="snappers-selection.txt"','Cache-Control':'no-store'}});}
 fail('Not found',404);
}
async function selectionPhotos(ref:any,ps:any[]){const s=(await ref.collection('private').doc('selection').get()).data();const ids=new Set(s?.ids||[]);return ps.map(p=>({...p,selected:ids.has(p.id),note:s?.notes?.[p.id]||''}));}
