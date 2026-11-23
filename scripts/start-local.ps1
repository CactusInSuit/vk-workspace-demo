param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$ProjectPath = Split-Path -Parent $PSScriptRoot
$LocalUrl = 'http://127.0.0.1:4173/'
$AlreadyRunning = $false
try { $Health = Invoke-RestMethod -Uri ($LocalUrl + '__workspace_health') -TimeoutSec 2; $AlreadyRunning = $Health.app -eq 'workspace-local-prototype' } catch {}
if (-not $AlreadyRunning) {
  $NodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
  $NodePath = if ($NodeCommand) { $NodeCommand.Source } else { $null }
  if (-not $NodePath) {
    $BundledNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
    if (Test-Path -LiteralPath $BundledNode) { $NodePath = $BundledNode }
  }
  if (-not $NodePath) { throw 'Node.js was not found. Install Node.js 22 or newer from https://nodejs.org/' }
  if (-not (Test-Path -LiteralPath (Join-Path $ProjectPath 'dist\index.html'))) { throw 'Build is missing. Run npm install and npm run build in the project folder.' }
  $LogPath = Join-Path $ProjectPath 'tmp'
  New-Item -ItemType Directory -Force -Path $LogPath | Out-Null
  $ServerScript = Join-Path $PSScriptRoot 'serve.mjs'
  $ServerProcess = Start-Process -FilePath $NodePath -ArgumentList @('"' + $ServerScript + '"') -WorkingDirectory $ProjectPath -WindowStyle Hidden -RedirectStandardOutput (Join-Path $LogPath 'workspace-server.log') -RedirectStandardError (Join-Path $LogPath 'workspace-server-error.log') -PassThru
  $ServerProcess.Id | Set-Content -LiteralPath (Join-Path $LogPath 'workspace-server.pid')
  for ($Attempt=0; $Attempt -lt 20; $Attempt++) {
    Start-Sleep -Milliseconds 200
    try { $Health=Invoke-RestMethod -Uri ($LocalUrl + '__workspace_health') -TimeoutSec 1; if ($Health.app -eq 'workspace-local-prototype') { $AlreadyRunning=$true; break } } catch {}
  }
  if (-not $AlreadyRunning) { throw 'Server did not start. Port 4173 may be occupied. See tmp/workspace-server-error.log.' }
}
Write-Output ('WorkSpace is running: ' + $LocalUrl)
if (-not $NoBrowser) { Start-Process $LocalUrl }
