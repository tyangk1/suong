# SƯƠNG: copy inbox -> work/raw (fixing the swapped hill names), then remove the Gemini ✦ with PhotoCraft -> work/clean
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$pc = "$env:LOCALAPPDATA\Programs\PhotoCraft\photocraft-cli.exe"
$raw = "$root\work\raw"; $clean = "$root\work\clean"
New-Item -ItemType Directory -Force $raw, $clean | Out-Null

Get-ChildItem "$root\inbox\*.png" | ForEach-Object {
  $n = $_.BaseName
  if ($n -eq 'hill-far') { $n = 'hill-mid' } elseif ($n -eq 'hill-mid') { $n = 'hill-far' }
  Copy-Item $_.FullName "$raw\$n.png" -Force
}

$marked = 'ch-heo','tea-luc','tea-sen','tea-shan','tea-olong','leaf-luc','leaf-sen','leaf-shan','leaf-olong','paper','set-still'
Add-Type -AssemblyName System.Drawing
Get-ChildItem "$raw\*.png" | ForEach-Object {
  $n = $_.BaseName
  if ($marked -contains $n) {
    $img = [System.Drawing.Image]::FromFile($_.FullName); $W = $img.Width; $H = $img.Height; $img.Dispose()
    $p = '{"strokes":[{"points":[[' + ($W-142) + ',' + ($H-112) + '],[' + ($W-82) + ',' + ($H-112) + ']],"size":150,"hardness":60}]}'
    & $pc run $_.FullName --cmd paint.remove --params $p --out "$clean\$n.png" | Out-Null
    if ($LASTEXITCODE) { throw "photocraft failed on $n" }
    "cleaned $n"
  } else {
    Copy-Item $_.FullName "$clean\$n.png" -Force
  }
}
