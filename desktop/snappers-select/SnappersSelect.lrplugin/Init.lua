local LrTasks=import 'LrTasks'
local LrFileUtils=import 'LrFileUtils'
local LrPathUtils=import 'LrPathUtils'
local LrPrefs=import 'LrPrefs'
local LrDialogs=import 'LrDialogs'
local prefs=LrPrefs.prefsForPlugin()
local pluginPath=_PLUGIN.path
local generation=(prefs.bridgeGeneration or 0)+1
prefs.bridgeGeneration=generation
prefs.bridgeBusy=false
local function status(message)
 local file=io.open(LrPathUtils.child(pluginPath,'bridge-status.txt'),'w')
 if file then file:write(os.date('%Y-%m-%d %H:%M:%S')..'\n'..message..'\n');file:close() end
end
status('Starting selection inbox watcher')
LrTasks.startAsyncTask(function()
 local ok,err=LrTasks.pcall(function()
  local documents=LrPathUtils.getStandardFilePath('documents')
  local inbox=LrPathUtils.child(LrPathUtils.child(documents,'SnappersSelect'),'Inbox')
  local fallback=LrPathUtils.child(LrPathUtils.child(LrPathUtils.child(LrPathUtils.getStandardFilePath('home'),'Documents'),'SnappersSelect'),'Inbox')
  if not LrFileUtils.exists(inbox) and LrFileUtils.exists(fallback) then inbox=fallback end
  status('Watching: '..inbox)
  while prefs.bridgeGeneration==generation do
   LrTasks.sleep(5)
   if not prefs.bridgeBusy and LrFileUtils.exists(inbox) then
    local candidate
    -- Finish the iterator before moving files so Windows directory handles close.
    for file in LrFileUtils.files(inbox) do
     if not candidate and file:lower():match('%.txt$') and not file:lower():match('snappers%-match%-report%.txt$') then candidate=file end
    end
    if candidate then
     local processed=LrFileUtils.chooseUniqueFileName(candidate..'.processing')
     local moved,reason=LrFileUtils.move(candidate,processed)
     if not moved then error('Cannot claim selection: '..tostring(reason)) end
     status('Opening selection: '..processed)
     prefs.pendingSelection=processed
     dofile(LrPathUtils.child(pluginPath,'ImportSelection.lua'))
    end
   end
  end
 end)
 if not ok then
  prefs.bridgeBusy=false
  status('Watcher error: '..tostring(err))
  LrDialogs.message('Snappers selection bridge',tostring(err)..'\n\nUse Library > Plug-in Extras > Import client selection. Diagnostics: '..LrPathUtils.child(pluginPath,'bridge-status.txt'),'critical')
 end
end)
