let cached:{identity:string,token:string,expires:number}|null=null;
let pending:{identity:string,promise:Promise<string>}|null=null;
export async function driveToken(e:any):Promise<string> {
 const identity=e.GOOGLE_CLIENT_ID+':'+e.GOOGLE_REFRESH_TOKEN;
 if(cached?.identity===identity&&cached.expires>Date.now()+60000)return cached.token;
 if(pending?.identity===identity)return pending.promise;
 const promise=refreshDriveToken(e,identity);pending={identity,promise};
 try{return await promise;}finally{if(pending?.promise===promise)pending=null;}
}
async function refreshDriveToken(e:any,identity:string) {
 const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({client_id:e.GOOGLE_CLIENT_ID,client_secret:e.GOOGLE_CLIENT_SECRET,refresh_token:e.GOOGLE_REFRESH_TOKEN,grant_type:'refresh_token'})});
 const data:any=await response.json(); if(!response.ok||!data.access_token)throw new Error('Google Drive connection needs attention');cached={identity,token:data.access_token,expires:Date.now()+Math.max(0,Number(data.expires_in||3600))*1000};return data.access_token;
}
export function storageProvider(e:any) {return e.GOOGLE_DRIVE_FOLDER_ID&&e.GOOGLE_REFRESH_TOKEN&&e.GOOGLE_CLIENT_ID&&e.GOOGLE_CLIENT_SECRET?'drive':'r2';}
export async function storePhoto(e:any,key:string,data:ArrayBuffer,name:string) {
 const provider=storageProvider(e);
 if(provider==='r2') {await e.BUCKET.put(key,data,{httpMetadata:{contentType:'image/jpeg'}});return {provider,key};}
 const token=await driveToken(e);const form=new FormData();
 form.append('metadata',new Blob([JSON.stringify({name,parents:[e.GOOGLE_DRIVE_FOLDER_ID],appProperties:{snappersKey:key}})],{type:'application/json'}));
 form.append('file',new Blob([data],{type:'image/jpeg'}));
 const r=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{method:'POST',headers:{Authorization:`Bearer ${token}`},body:form});
 const result:any=await r.json();if(!r.ok||!result.id)throw new Error('Google Drive upload failed. Check available storage and permissions.');return {provider,key:result.id};
}
export async function readPhoto(e:any,p:any) {
 if(p.provider==='r2') {const obj=await e.BUCKET.get(p.key);return obj?new Response(obj.body,{headers:{'Content-Type':'image/jpeg','Cache-Control':'private, max-age=3600'}}):new Response('Preview unavailable',{status:404});}
 const token=await driveToken(e);const r=await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(p.key)}?alt=media`,{headers:{Authorization:`Bearer ${token}`}});
 return new Response(r.body,{status:r.status,headers:{'Content-Type':'image/jpeg','Cache-Control':'private, max-age=3600'}});
}
export async function deleteStored(e:any,p:any) {
 if(p.provider==='r2')return e.BUCKET.delete(p.key);
 const token=await driveToken(e);const r=await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(p.key)}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}});if(!r.ok&&r.status!==404)throw new Error('Drive cleanup failed');
}
