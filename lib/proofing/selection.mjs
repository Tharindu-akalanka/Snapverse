export function cleanName(value) {
 if(typeof value !== 'string' || !value.trim() || value.length>240 || /[\x00-\x1f\\/]/.test(value)) throw new Error('Invalid photo filename');
 if(!/\.jpe?g$/i.test(value)) throw new Error('Only JPEG/JPG previews are accepted');
 return value;
}
export function cleanRelative(value, name) {
 const p = String(value || name).replaceAll('\\','/');
 if(p.length>600 || p.split('/').some(v=>!v || v==='..' || v==='.') || /[\x00-\x1f]/.test(p) || p.split('/').at(-1)!==name) throw new Error('Invalid relative photo path');
 return p;
}
export function validateSelection(rows, ids, notes, max) {
 if(!Array.isArray(ids) || ids.length>10000 || ids.some(x=>typeof x!=='string') || new Set(ids).size!==ids.length) throw new Error('Invalid selection');
 if(max>0 && ids.length>max) throw new Error('Selection exceeds the album limit');
 const known=new Set(rows.map(x=>x.id));
 if(ids.some(x=>!known.has(x))) throw new Error('Selection contains an unknown photo');
 const safe={};
 for(const id of ids) {const n=notes?.[id]??'';if(typeof n!=='string'||n.length>1000)throw new Error('Notes must be under 1,000 characters');safe[id]=n;}
 return {ids,notes:safe};
}
export function exportSelection(title, rows) {
 return ['SNAPPERS-SELECTION-1',title.replace(/[\r\n\t]/g,' '),...rows.filter(p=>p.selected).map(p=>p.relative)].join('\n')+'\n';
}
