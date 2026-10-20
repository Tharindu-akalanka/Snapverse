local LrTasks=import 'LrTasks'
local LrFileUtils=import 'LrFileUtils'
local LrPathUtils=import 'LrPathUtils'
local LrPrefs=import 'LrPrefs'
local prefs=LrPrefs.prefsForPlugin()
prefs.bridgeBusy=false
LrTasks.startAsyncTask(function()
 local inbox=LrPathUtils.child(LrPathUtils.getStandardFilePath('documents'),'SnappersSelect/Inbox')
 while true do
  LrTasks.sleep(5)
  if not prefs.bridgeBusy and LrFileUtils.exists(inbox) then
   for file in LrFileUtils.files(inbox) do
    if file:lower():match('%.txt$') then
     local processed=file..'.'..os.time()..'.processing'
     local ok=LrFileUtils.move(file,processed)
     if ok then
      prefs.pendingSelection=processed
      dofile(LrPathUtils.child(_PLUGIN.path,'ImportSelection.lua'))
     end
     break
    end
   end
  end
 end
end)
