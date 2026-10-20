import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cleanName,cleanRelative,validateSelection,exportSelection} from '../lib/proofing/selection.mjs';
test('JPEG filenames preserve RAW identity',()=>{assert.equal(cleanName('DSC_0123.JPG'),'DSC_0123.JPG');for(const n of ['../a.jpg','a.png','a\nb.jpg',''])assert.throws(()=>cleanName(n));});
test('relative camera paths reject traversal and mismatched leaves',()=>{assert.equal(cleanRelative('Camera A/DSC_0123.jpg','DSC_0123.jpg'),'Camera A/DSC_0123.jpg');for(const p of ['../DSC_0123.jpg','/DSC_0123.jpg','A//DSC_0123.jpg','A/other.jpg'])assert.throws(()=>cleanRelative(p,'DSC_0123.jpg'));});
test('selection validates membership, duplicates, limits and notes',()=>{const rows=[{id:'a'},{id:'b'}];assert.equal(validateSelection(rows,['a'],{a:'Crop'},1).notes.a,'Crop');for(const ids of [['x'],['a','a'],['a','b']])assert.throws(()=>validateSelection(rows,ids,{},1));assert.throws(()=>validateSelection(rows,['a'],{a:'x'.repeat(1001)},1));});
test('export includes only selected originals and preserves camera paths',()=>{assert.equal(exportSelection('Wedding\nClient',[{selected:true,relative:'Camera A/DSC_0001.JPG'},{selected:false,relative:'DSC_0002.jpg'}]),'SNAPPERS-SELECTION-1\nWedding Client\nCamera A/DSC_0001.JPG\n');});
