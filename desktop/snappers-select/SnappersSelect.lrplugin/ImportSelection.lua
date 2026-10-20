local LrApplication = import 'LrApplication'
local LrDialogs = import 'LrDialogs'
local LrTasks = import 'LrTasks'
local LrFileUtils = import 'LrFileUtils'
local LrPathUtils = import 'LrPathUtils'
local LrProgressScope = import 'LrProgressScope'
local prefs=(import 'LrPrefs').prefsForPlugin()
local rawExtensions = {nef=true,nrw=true,cr2=true,cr3=true,arw=true,srf=true,sr2=true,dng=true,raf=true,orf=true,rw2=true,pef=true,rwl=true,raw=true,["3fr"]=true,fff=true,iiq=true,x3f=true}
local function normal(p) return (p:gsub('\\','/'):gsub('/+$','')):lower() end
local function stem(p) return p:gsub('%.[^./]+$','') end
local pending=prefs.pendingSelection
prefs.pendingSelection=nil
prefs.bridgeBusy=true
LrTasks.startAsyncTask(function()
 local file = pending and {pending} or LrDialogs.runOpenPanel {title='Choose Snappers selection',canChooseFiles=true,canChooseDirectories=false,allowsMultipleSelection=false,fileTypes={'txt','snappers-selection'}}
 if not file then prefs.bridgeBusy=false;return end
 local rawRoot = LrDialogs.runOpenPanel {title='Choose the RAW folder for this shoot',canChooseFiles=false,canChooseDirectories=true,allowsMultipleSelection=false}
 if not rawRoot then prefs.bridgeBusy=false;return end
 local ok, err = LrTasks.pcall(function()
 local content=LrFileUtils.readFile(file[1])
 if not content or #content>5000000 then error('Cannot read selection or selection is too large.') end
 content=content:gsub('^\239\187\191','')
 local lines={}; for line in (content..'\n'):gmatch('(.-)\r?\n') do table.insert(lines,line) end
 if lines[1]~='SNAPPERS-SELECTION-1' then error('This is not a Snappers selection file.') end
 local title=lines[2] or 'Client selection'
 if #title>150 then title=title:sub(1,150) end
 local wanted={}; local unique={}
 for i=3,#lines do
  local line=lines[i]
  if #line>0 then
   if line:find('[%c]') or line:find('%.%./') or line:sub(1,1)=='/' or line:find(':') then error('Invalid selection path.') end
   local key=stem(normal(line)); if not unique[key] then table.insert(wanted,key);unique[key]=true end
  end
 end
 if #wanted==0 then error('The selection is empty.') end
 local catalog=LrApplication.activeCatalog()
 local root=normal(rawRoot[1])..'/'
 local byPath={};local byName={}
 local progress=LrProgressScope {title='Matching selected RAW photos'}
 progress:setCancelable(true)
 local all=catalog:getAllPhotos()
 for i,photo in ipairs(all) do
  if progress:isCanceled() then progress:done();return end
  local path=normal(photo:getRawMetadata('path') or '')
  local ext=path:match('%.([^./]+)$')
  if ext and rawExtensions[ext] and path:sub(1,#root)==root then
   local relative=stem(path:sub(#root+1));local name=relative:match('([^/]+)$')
   byPath[relative]=byPath[relative] or {};table.insert(byPath[relative],photo)
   byName[name]=byName[name] or {};table.insert(byName[name],photo)
  end
  if i%100==0 then progress:setPortionComplete(i,#all);LrTasks.yield() end
 end
 local matched={};local issues={};local matchedIds={}
 for _,key in ipairs(wanted) do
  local candidates=byPath[key]
  if not candidates then candidates=byName[key:match('([^/]+)$')] end
  if not candidates or #candidates==0 then table.insert(issues,'Missing RAW: '..key)
  elseif #candidates>1 then table.insert(issues,'Ambiguous RAW: '..key..' ('..#candidates..' matches)')
  elseif matchedIds[candidates[1].localIdentifier] then table.insert(issues,'Two selections map to the same RAW: '..key)
  elseif not LrFileUtils.exists(candidates[1]:getRawMetadata('path')) then table.insert(issues,'RAW is offline: '..key)
  else table.insert(matched,candidates[1]);matchedIds[candidates[1].localIdentifier]=true end
 end
 progress:done()
 if #issues>0 then
  local report=table.concat(issues,'\n')
  local log=LrPathUtils.child(LrPathUtils.parent(file[1]),'snappers-match-report.txt')
  local f=io.open(log,'w');if f then f:write(report);f:close() end
  LrDialogs.message('Selection needs attention',report:sub(1,5000)..'\n\nNo collection was created. Import missing RAWs into the catalog, reconnect offline files, or choose the correct shoot folder. A report is saved next to the selection file.','warning');return
 end
 local collection
 catalog:withWriteAccessDo('Create Snappers client selection',function()
  local set=catalog:createCollectionSet('Snappers Select',nil,true)
  local collectionName=title..' - '..os.date('%Y%m%d %H%M%S')
  collection=catalog:createCollection(collectionName,set,false)
  collection:addPhotos(matched)
 end)
 if collection then catalog:setActiveSources({collection});catalog:setSelectedPhotos(matched[1],matched) end
 LrDialogs.message('Ready to edit',tostring(#matched)..' RAW photos matched and added to a new collection.','info')
 end)
 prefs.bridgeBusy=false
 if not ok then LrDialogs.message('Snappers Select',tostring(err),'critical') end
end)
