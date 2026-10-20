-- Execute the actual plug-in against an SDK test double, without opening or modifying a real catalog.
local prefs={};local current;local count=0
local function photo(id,path,offline)
 return {localIdentifier=id,offline=offline,getRawMetadata=function(self,k) if k=='path' then return path end end}
end
local realOpen=io.open
io.open=function() return {write=function() end,close=function() end} end
local function run(title,manifest,items,expected,expectedMessage)
 current={manifest=manifest,items=items,messages={},dialogs=0,collections={},selected=nil}
 prefs={}
 local catalog={getAllPhotos=function() return items end,withWriteAccessDo=function(self,name,fn)fn()end,
 createCollectionSet=function()return {}end,
 createCollection=function(self,name) local c={name=name,addPhotos=function(self,ps)self.photos=ps end};table.insert(current.collections,c);return c end,
 setActiveSources=function()end,setSelectedPhotos=function(self,p,ps)current.selected=ps end}
 local modules={
 LrApplication={activeCatalog=function()return catalog end},
 LrDialogs={runOpenPanel=function()current.dialogs=current.dialogs+1;return {current.dialogs==1 and 'selection.txt' or 'R:/Shoot'}end,message=function(title,text,kind)table.insert(current.messages,{title=title,text=text,kind=kind})end},
 LrTasks={startAsyncTask=function(fn)fn()end,pcall=pcall,yield=function()end},
 LrFileUtils={readFile=function()return manifest end,exists=function(path)for _,p in ipairs(items)do if p:getRawMetadata('path')==path then return not p.offline end end;return true end},
 LrPathUtils={child=function(a,b)return a..'/'..b end,parent=function()return '.'end},
 LrProgressScope=function()return {isCanceled=function()return false end,done=function()end,setPortionComplete=function()end,setCancelable=function()end}end,
 LrPrefs={prefsForPlugin=function()return prefs end},
 }
 import=function(name)assert(modules[name],name);return modules[name]end
 dofile('desktop/snappers-select/SnappersSelect.lrplugin/ImportSelection.lua')
 assert(#current.collections==expected,title..': collection count mismatch')
 if expected>0 then assert(#current.collections[1].photos==1,title..': wrong selected RAW count') end
 if expectedMessage then assert(current.messages[#current.messages].text:find(expectedMessage,1,true),title..': wrong diagnostic')end
 assert(prefs.bridgeBusy==false,title..': bridge remained busy')
 count=count+1;print('PASS '..title)
 return current
end
local header='SNAPPERS-SELECTION-1\nTest wedding\n'
run('exact RAW match',header..'DSC_0001.jpg\n',{photo(1,'R:/Shoot/DSC_0001.NEF')},1)
run('duplicate filename is ambiguous',header..'DSC_0001.jpg\n',{photo(1,'R:/Shoot/Camera A/DSC_0001.NEF'),photo(2,'R:/Shoot/Camera B/DSC_0001.ARW')},0,'Ambiguous RAW')
local a=run('relative camera path resolves collision',header..'Camera A/DSC_0001.jpg\n',{photo(1,'R:/Shoot/Camera A/DSC_0001.NEF'),photo(2,'R:/Shoot/Camera B/DSC_0001.ARW')},1)
assert(a.collections[1].photos[1].localIdentifier==1)
run('JPEG is excluded',header..'DSC_0001.jpg\n',{photo(1,'R:/Shoot/DSC_0001.JPG')},0,'Missing RAW')
run('offline RAW stops collection creation',header..'DSC_0001.jpg\n',{photo(1,'R:/Shoot/DSC_0001.NEF',true)},0,'RAW is offline')
run('other shoots are excluded',header..'DSC_0001.jpg\n',{photo(1,'R:/ShootOther/DSC_0001.NEF')},0,'Missing RAW')
run('missing photo prevents partial collection',header..'DSC_0001.jpg\nDSC_0002.jpg\n',{photo(1,'R:/Shoot/DSC_0001.NEF')},0,'Missing RAW')
run('two previews cannot map to one RAW',header..'A/DSC_0001.jpg\nB/DSC_0001.jpg\n',{photo(1,'R:/Shoot/DSC_0001.NEF')},0,'Two selections map to the same RAW')
run('invalid manifest rejected','INVALID\nTest\nDSC_0001.jpg\n',{},0,'not a Snappers selection')
run('path traversal rejected',header..'../DSC_0001.jpg\n',{},0,'Invalid selection path')
io.open=realOpen
print(tostring(count)..' Lightroom matcher scenarios passed (SDK mocked).')
