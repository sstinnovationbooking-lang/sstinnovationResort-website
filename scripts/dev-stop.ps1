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

Write-Host "Stopping dev server on port $Port ..."
$attempt = 0
while ($attempt -lt 5) {
  $attempt++
  $portPids = Get-PortPids -TargetPort $Port

  if ($portPids.Count -eq 0) {
    if ($attempt -eq 1) {
      Write-Host "No process found on port $Port."
    }
    Write-Host "Stopped."
    exit 0
  }

  foreach ($processId in $portPids) {
    if ($processId -eq $PID) { continue }
    try {
      Write-Host "Stopping PID $processId ..."
      Stop-Process -Id $processId -Force -ErrorAction Stop
    } catch {
      Write-Warning "Failed to stop PID ${processId}: $($_.Exception.Message)"
    }
  }

  Start-Sleep -Milliseconds 500
}

Write-Warning "Some processes on port $Port may still be running."
