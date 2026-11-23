$ErrorActionPreference = 'Stop'
$ProjectPath = Split-Path -Parent $PSScriptRoot
$PidFile = Join-Path $ProjectPath 'tmp\workspace-server.pid'
if (-not (Test-Path -LiteralPath $PidFile)) { Write-Output 'No local WorkSpace server was started by the launcher.'; exit 0 }
$ServerProcessId = [int](Get-Content -LiteralPath $PidFile -Raw).Trim()
$ServerProcess = Get-CimInstance Win32_Process -Filter ('ProcessId = ' + $ServerProcessId)
if (-not $ServerProcess) { Write-Output 'Local server is already stopped.'; exit 0 }
$ExpectedScript = Join-Path $PSScriptRoot 'serve.mjs'
if ($ServerProcess.Name -ne 'node.exe' -or -not $ServerProcess.CommandLine -or $ServerProcess.CommandLine.IndexOf($ExpectedScript,[StringComparison]::OrdinalIgnoreCase) -lt 0) { throw 'PID does not match this local WorkSpace server. No process was stopped.' }
Stop-Process -Id $ServerProcessId
Write-Output 'Local WorkSpace server stopped.'
