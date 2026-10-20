param(
 [string]$SiteOrigin='https://snapverse-m47a.vercel.app',
 [string]$LightroomPath=''
)
$ErrorActionPreference='Stop'
$site=[Uri]$SiteOrigin
if($site.Scheme -ne 'https' -or $site.AbsolutePath -ne '/' -or $site.Query -or $site.Fragment -or $site.UserInfo){throw 'Enter only your trusted HTTPS website origin.'}
if(-not $LightroomPath){$LightroomPath=(Get-Process Lightroom -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Path)}
if(-not $LightroomPath){$LightroomPath=Join-Path $env:ProgramFiles 'Adobe\Adobe Lightroom Classic\Lightroom.exe'}
if(-not(Test-Path -LiteralPath $LightroomPath -PathType Leaf)){throw 'Supply the path to your Lightroom Classic Lightroom.exe.'}
$nodePath=(Get-Command node -ErrorAction Stop).Source
if(-not $nodePath.EndsWith('node.exe')){throw 'Node.js 22 or later is required.'}
$destination=Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'SnappersSelect'
New-Item -ItemType Directory -Force -Path $destination | Out-Null
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'bridge.mjs') -Destination (Join-Path $destination 'bridge.mjs') -Force
$config=@{siteOrigin=$site.GetLeftPart([UriPartial]::Authority);lightroomPath=$LightroomPath;inboxPath=(Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'SnappersSelect\Inbox')} | ConvertTo-Json
[IO.File]::WriteAllText((Join-Path $destination 'bridge-config.json'),$config,(New-Object Text.UTF8Encoding $false))
$protocol='HKCU:\Software\Classes\snappers-select'
New-Item -Path $protocol -Force | Out-Null
Set-Item -Path $protocol -Value 'URL:Snappers Select'
New-ItemProperty -Path $protocol -Name 'URL Protocol' -Value '' -PropertyType String -Force | Out-Null
New-Item -Path ($protocol+'\shell\open\command') -Force | Out-Null
$command='"'+$nodePath+'" "'+(Join-Path $destination 'bridge.mjs')+'" "%1"'
Set-Item -Path ($protocol+'\shell\open\command') -Value $command
$association='HKCU:\Software\Classes\.snappers-selection'
New-Item -Path $association -Force | Out-Null
Set-Item -Path $association -Value 'SnappersSelect.Selection'
$fileType='HKCU:\Software\Classes\SnappersSelect.Selection'
New-Item -Path ($fileType+'\shell\open\command') -Force | Out-Null
Set-Item -Path $fileType -Value 'Snappers Lightroom Selection'
Set-Item -Path ($fileType+'\shell\open\command') -Value $command
Write-Host 'Bridge installed. Add SnappersSelect.lrplugin in Lightroom Plug-in Manager, then use Open in Lightroom on a submitted album.'
