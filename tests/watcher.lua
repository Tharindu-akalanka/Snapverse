local prefs={}
local exhausted=false
local moved=false
local opened=false
local status=''
local dialogs={}
local sdk={}
sdk.LrPrefs={prefsForPlugin=function()return prefs end}
sdk.LrPathUtils={getStandardFilePath=function(which)return which=='documents' and 'C:/Documents' or 'C:/User' end,child=function(a,b)assert(not b:find('/'),'child must be a single segment');return a..'/'..b end}
sdk.LrFileUtils={exists=function()return 'directory' end,files=function()local i=0;return function()i=i+1;if i==1 then return 'C:/Documents/SnappersSelect/Inbox/selection.txt' end;exhausted=true;return nil end end,chooseUniqueFileName=function(v)return v end,move=function(src,dst)assert(exhausted,'iterator must finish before file move');moved=true;return true end}
sdk.LrDialogs={message=function(...)table.insert(dialogs,{...})end}
sdk.LrTasks={pcall=pcall,sleep=function()prefs.bridgeGeneration=prefs.bridgeGeneration+1 end,startAsyncTask=function(fn)fn()end}
function import(name)return sdk[name]end
_PLUGIN={path='plugin'}
local realOpen=io.open
io.open=function()return {write=function(_,s)status=s end,close=function()end}end
local realDofile=dofile
dofile=function(file)assert(file=='plugin/ImportSelection.lua');assert(prefs.pendingSelection:match('selection.txt.processing$'));opened=true end
realDofile('desktop/snappers-select/SnappersSelect.lrplugin/Init.lua')
assert(moved and opened and #dialogs==0)
print('PASS watcher nested Windows paths, exhausted iterator, queue claim and import handoff')
sdk.LrFileUtils.files=function()error('simulated watcher failure')end
realDofile('desktop/snappers-select/SnappersSelect.lrplugin/Init.lua')
assert(#dialogs==1 and status:find('simulated watcher failure',1,true))
print('PASS watcher errors produce diagnostics and a visible message')
io.open=realOpen;dofile=realDofile
