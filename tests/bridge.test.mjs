import {test} from 'node:test';import assert from 'node:assert/strict';import {parseRequest,validateManifest,loadSelection} from '../desktop/snappers-select/bridge.mjs';
const token='a'.repeat(64),album='12345678-1234-1234-1234-123456789abc';
test('bridge downloads only from the configured site',()=>{const u=parseRequest(`snappers-select://open/?album=${album}&token=${token}&origin=https://evil.example`,'https://snapverse.example');assert.equal(u.origin,'https://snapverse.example');assert.equal(u.pathname,`/api/proofing/albums/${album}/export`);assert.equal(u.searchParams.get('token'),token);});
test('bridge rejects invalid requests and insecure site settings',()=>{for(const u of ['https://open/?album=x','snappers-select://evil/?album=x',`snappers-select://open/?album=../../file&token=${token}`,`snappers-select://open/?album=${album}&token=short`])assert.throws(()=>parseRequest(u,'https://snapverse.example'));for(const site of ['http://snapverse.example','https://user:pass@snapverse.example','https://snapverse.example/extra','https://snapverse.example/?x=1'])assert.throws(()=>parseRequest(`snappers-select://open/?album=${album}&token=${token}`,site));});

import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';
test('attachment validates filenames without executing paths',()=>{
 assert.equal(validateManifest('SNAPPERS-SELECTION-1\r\nWedding\r\nCamera A/DSC_0001.jpg\r\n'),'SNAPPERS-SELECTION-1\nWedding\nCamera A/DSC_0001.jpg\n');
 for(const p of ['../DSC_1.jpg','/DSC_1.jpg','C:/DSC_1.jpg','folder\\DSC_1.jpg','run.exe','a.jpg\n\na.jpg'])assert.throws(()=>validateManifest('SNAPPERS-SELECTION-1\nWedding\n'+p+'\n'));
 assert.throws(()=>validateManifest('SNAPPERS-SELECTION-1\nWedding\n'));
});
test('saved email attachment queues the exact selection text without network access',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'snappers-attachment-'));
 try{const file=path.join(dir,'Picks.snappers-selection');const content='SNAPPERS-SELECTION-1\nWedding\nDSC_0001.jpg\n';await fs.writeFile(file,content);assert.equal(await loadSelection(file,'https://snapverse.example'),content);await assert.rejects(()=>loadSelection(path.join(dir,'Picks.txt'),'https://snapverse.example'),/snappers-selection/);}finally{await fs.rm(dir,{recursive:true,force:true});}
});
