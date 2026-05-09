param(
  [int]$Port = 3000,
  [int[]]$FallbackPorts = @(3001, 3002),
  [switch]$ForcePreferredPort
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

function Get-CandidatePorts {
  param(
    [int]$PreferredPort,
    [int[]]$AlternativePorts
  )

  $orderedUniquePorts = @()
  foreach ($candidatePort in @($PreferredPort) + $AlternativePorts) {
    if ($candidatePort -le 0) { continue }
    if ($orderedUniquePorts -contains $candidatePort) { continue }
    $orderedUniquePorts += $candidatePort
  }

  return $orderedUniquePorts
}

$candidatePorts = Get-CandidatePorts -PreferredPort $Port -AlternativePorts $FallbackPorts
if ($candidatePorts.Count -eq 0) {
  throw "No valid dev ports were provided."
}

$selectedPort = $null

foreach ($candidatePort in $candidatePorts) {
  $portPids = Get-PortPids -TargetPort $candidatePort
  if ($portPids.Count -eq 0) {
    $selectedPort = $candidatePort
    break
  }

  if ($ForcePreferredPort -and $candidatePort -eq $Port) {
    foreach ($processId in $portPids) {
      if ($processId -eq $PID) { continue }
      try {
        Write-Host "Stopping PID $processId on preferred port $Port ..."
        Stop-Process -Id $processId -Force -ErrorAction Stop
      } catch {
        Write-Warning "Failed to stop PID ${processId}: $($_.Exception.Message)"
      }
    }
    Start-Sleep -Seconds 1
    $preferredPortPids = Get-PortPids -TargetPort $Port
    if ($preferredPortPids.Count -eq 0) {
      $selectedPort = $Port
      break
    }
  } else {
    Write-Host "Port $candidatePort is in use by PID(s): $($portPids -join ', ')"
  }
}

if (-not $selectedPort) {
  throw "No available port found. Tried: $($candidatePorts -join ', ')."
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

if ($selectedPort -ne $Port) {
  Write-Host "Preferred port $Port is busy. Using fallback port $selectedPort."
} else {
  Write-Host "Using port $selectedPort."
}

Write-Host "Starting Next.js dev server on port $selectedPort ..."
& $nodePath $nextCli dev --webpack --port $selectedPort
