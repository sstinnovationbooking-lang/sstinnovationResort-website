param(
  [int]$Port = 3000
)

$ErrorActionPreference = "Stop"

function Get-PortPids {
  param([int]$TargetPort)

  $pids = @()

  $netTcpCmd = Get-Command Get-NetTCPConnection -ErrorAction SilentlyContinue
  if ($netTcpCmd) {
    try {
      $pids += Get-NetTCPConnection -LocalPort $TargetPort -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique
    } catch {
      # Fallback to netstat parsing below.
    }
  }

  if (-not $pids -or $pids.Count -eq 0) {
    $netstatPath = Join-Path $env:SystemRoot "System32\netstat.exe"
    if (Test-Path $netstatPath) {
      $lines = & $netstatPath -ano -p tcp | Select-String "[:\.]$TargetPort\s"
      foreach ($line in $lines) {
        $parts = ($line.ToString().Trim() -split "\s+") | Where-Object { $_ }
        if ($parts.Count -gt 0) {
          $pidToken = $parts[$parts.Count - 1]
          $pidValue = 0
          if ([int]::TryParse($pidToken, [ref]$pidValue)) {
            $pids += $pidValue
          }
        }
      }
    }
  }

  return $pids | Where-Object { $_ -gt 0 } | Sort-Object -Unique
}

Write-Host "Checking port $Port ..."
$portPids = Get-PortPids -TargetPort $Port

if ($portPids.Count -gt 0) {
  foreach ($processId in $portPids) {
    if ($processId -eq $PID) { continue }
    try {
      Write-Host "Stopping PID $processId on port $Port ..."
      Stop-Process -Id $processId -Force -ErrorAction Stop
    } catch {
      Write-Warning "Failed to stop PID ${processId}: $($_.Exception.Message)"
    }
  }
  Start-Sleep -Seconds 1
} else {
  Write-Host "Port $Port is free."
}

$lockPath = Join-Path $PSScriptRoot "..\.next\dev\lock"
if (Test-Path $lockPath) {
  try {
    Remove-Item -LiteralPath $lockPath -Force -ErrorAction Stop
    Write-Host "Removed stale lock file: .next/dev/lock"
  } catch {
    Write-Warning "Could not remove lock file: $($_.Exception.Message)"
  }
}

$nodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $nodePath) {
  $fallbackNode = "C:\Program Files\nodejs\node.exe"
  if (Test-Path $fallbackNode) {
    $nodePath = $fallbackNode
  }
}
if (-not $nodePath) {
  throw "Node.js was not found in PATH. Install Node.js or add it to PATH."
}

$nextCli = Join-Path $PSScriptRoot "..\node_modules\next\dist\bin\next"
if (-not (Test-Path $nextCli)) {
  throw "Next CLI not found at node_modules\\next\\dist\\bin\\next. Run npm install first."
}

Write-Host "Starting Next.js dev server on port $Port ..."
& $nodePath $nextCli dev --webpack --port $Port
