import {driveToken} from './storage';
export const retentionDays=14;
export const cleanupDate=(submitted:string)=>new Date(Date.parse(submitted)+retentionDays*86400000).toISOString();
// Never search by filename or delete a folder: check each recorded file's app tag.
export async function deleteExpiredPreview(env:any,albumId:string,photo:any){
 if(photo.provider!=='drive'||!photo.key||!photo.id)throw Error('Unverified preview record');
 const token=await driveToken(env),url=`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(photo.key)}`;
 const headers={Authorization:`Bearer ${token}`};
 const response=await fetch(url+'?fields=id,trashed,appProperties',{headers});
 if(response.status===404)return;
 if(!response.ok)throw Error('Cannot verify preview ownership');
 const file=await response.json();
 if(file.id!==photo.key||file.appProperties?.snappersKey!==`${albumId}/${photo.id}`)throw Error('Preview ownership mismatch');
 const result=await fetch(url,{method:'DELETE',headers});
 if(!result.ok)throw Error('Preview cleanup failed');
}
