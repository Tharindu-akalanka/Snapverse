# Snappers Select for Lightroom Classic

1. Unzip the package to a permanent folder on your computer.
2. Lightroom Classic → File → Plug-in Manager → Add → select `SnappersSelect.lrplugin`.
3. Import the shoot's RAW originals into your Lightroom catalog and connect their drive.
4. In the web dashboard, open a submitted album and click **Export Lightroom selection**.
5. Lightroom → Library → Plug-in Extras → Import client selection. Choose the exported text file and the shoot's RAW folder.

The plug-in matches relative paths first, then uses a filename only if it is unique within the chosen RAW folder. JPEGs and videos in the catalog are excluded. Missing, offline, or ambiguous matches stop the import and produce a report; no partial collection is created. A new collection is created for each successful import, and original files are not moved or modified.

Keep camera subfolders identical between preview exports and RAW originals when possible. Do not rename JPEG previews independently of their RAW originals.

For the one-click handoff, run `Install-Bridge.ps1` once with your trusted website origin. Node.js 22+ is required. The installer registers `snappers-select://` for the current Windows user. The dashboard's **Open in Lightroom** button sends only an album ID and its private link token to the bridge; the bridge downloads the selection from the configured HTTPS origin, queues it in Documents/SnappersSelect/Inbox and launches Lightroom. The installed plug-in watches that inbox and asks you to choose the shoot's RAW folder before matching. Failed/cancelled queue items remain as `.processing` files; rename a relevant file to `.txt` and use the manual import to retry.

The installer does not change Windows execution policies. If local policy blocks it, use the manual text handoff or have the installer appropriately signed. Configuration lives in `%LOCALAPPDATA%/SnappersSelect`. An error from the bridge is written to Documents/SnappersSelect/last-error.txt. To unregister it, remove only `HKCU/Software/Classes/snappers-select` and the bridge's own installation folder through your normal Windows administration process.

The plug-in and bridge require verification with your installed Lightroom Classic and an actual catalog before production use. Automated matching tests use an SDK test double. This is a photographer-initiated handoff, not an unattended service that wakes your computer when a client submits.

## Email attachment handoff

Final submissions and Retry email attach `Snappers-Selection.snappers-selection`. This is a UTF-8 text manifest with selected JPEG filenames, not executable code and not RAW image data. The attachment contains no album access token. Install the updated Windows bridge once to register only `.snappers-selection` (ordinary `.txt` associations are unchanged). Save/open the attachment from your email. The bridge validates the file, queues it locally and opens Lightroom Classic. The plug-in then asks for the shoot RAW folder and creates a matching collection; it does not import unknown RAW files, move originals or guess ambiguous matches. The matching shoot must already be imported in the open Lightroom catalog.

Email providers may require saving the attachment before opening it. If a Windows download warning appears, review it yourself. Manual alternative: open the attachment with a text editor or rename a copy to `.txt` and import through Plug-in Extras. Actual desktop execution still needs validation on your installed Lightroom catalog.
