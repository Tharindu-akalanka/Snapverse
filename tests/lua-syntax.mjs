import fs from 'node:fs';import lua from 'luaparse';
const folder='desktop/snappers-select/SnappersSelect.lrplugin';
for(const f of fs.readdirSync(folder).filter(x=>x.endsWith('.lua'))){lua.parse(fs.readFileSync(folder+'/'+f,'utf8').replace(/^\uFEFF/,''),{luaVersion:'5.1'});console.log(f+': Lua 5.1 syntax PASS');}
