param(
  [string]$Root = "frontend/public/axis1-test-photos",
  [string]$Output = "frontend/public/axis1-test-photos/messy-synthetic"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$rootPath = Resolve-Path $Root
$outputPath = Join-Path (Resolve-Path ".") $Output
New-Item -ItemType Directory -Force -Path $outputPath | Out-Null

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq "image/jpeg" } |
  Select-Object -First 1

function Save-Jpeg {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [string]$Path,
    [int]$Quality = 72
  )

  $params = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality,
    [int64]$Quality
  )
  $Bitmap.Save($Path, $jpegCodec, $params)
  $params.Dispose()
}

function New-Canvas {
  param(
    [int]$Width,
    [int]$Height
  )

  $bitmap = New-Object System.Drawing.Bitmap($Width, $Height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear([System.Drawing.Color]::White)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

  return @{
    Bitmap = $bitmap
    Graphics = $graphics
  }
}

function Write-Variant {
  param(
    [string]$Source,
    [string]$Name,
    [string]$Kind,
    [string]$ExpectedStress,
    [scriptblock]$Transform
  )

  $image = [System.Drawing.Image]::FromFile($Source)

  try {
    $result = & $Transform $image
    $target = Join-Path $outputPath $Name
    Save-Jpeg -Bitmap $result.Bitmap -Path $target -Quality $result.Quality
    $relative = "/axis1-test-photos/messy-synthetic/$Name"

    [pscustomobject]@{
      file = $Name
      localPath = $relative
      source = (Resolve-Path $Source).Path.Replace((Resolve-Path ".").Path + "\", "")
      kind = $Kind
      expectedStress = $ExpectedStress
      width = $result.Bitmap.Width
      height = $result.Bitmap.Height
      bytes = (Get-Item $target).Length
    }
  } finally {
    if ($result -and $result.Graphics) { $result.Graphics.Dispose() }
    if ($result -and $result.Bitmap) { $result.Bitmap.Dispose() }
    $image.Dispose()
  }
}

function Resize-Longest {
  param(
    [System.Drawing.Image]$Image,
    [int]$Longest = 1100
  )

  $scale = [Math]::Min(1.0, $Longest / [Math]::Max($Image.Width, $Image.Height))
  $width = [Math]::Max(1, [int][Math]::Round($Image.Width * $scale))
  $height = [Math]::Max(1, [int][Math]::Round($Image.Height * $scale))
  $canvas = New-Canvas -Width $width -Height $height
  $canvas.Graphics.DrawImage($Image, 0, 0, $width, $height)
  $canvas.Quality = 72
  return $canvas
}

function Darken {
  param([System.Drawing.Bitmap]$Bitmap, [int]$Alpha = 95)

  $graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
  $brush = New-Object System.Drawing.SolidBrush(
    [System.Drawing.Color]::FromArgb($Alpha, 0, 0, 0)
  )
  $graphics.FillRectangle($brush, 0, 0, $Bitmap.Width, $Bitmap.Height)
  $brush.Dispose()
  $graphics.Dispose()
}

function Washout {
  param([System.Drawing.Bitmap]$Bitmap, [int]$Alpha = 90)

  $graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
  $brush = New-Object System.Drawing.SolidBrush(
    [System.Drawing.Color]::FromArgb($Alpha, 255, 255, 255)
  )
  $graphics.FillRectangle($brush, 0, 0, $Bitmap.Width, $Bitmap.Height)
  $brush.Dispose()
  $graphics.Dispose()
}

$sources = @{
  hood = Join-Path $rootPath "clean-hood-before-after.jpg"
  filter = Join-Path $rootPath "dirty-hood-filter-wide.jpg"
  duct = Join-Path $rootPath "grease-duct-before-cleaning.jpg"
  fan = Join-Path $rootPath "kitchen-exhaust-fan.jpg"
  grease = Join-Path $rootPath "grease-removed-bucket.jpg"
  cleanFilter = Join-Path $rootPath "clean-filter-after-wash.jpg"
}

$manifest = @()

$manifest += Write-Variant $sources.hood "IMG_7421.jpg" "low_light_rotated_hood" "AI should not overclaim before/after proof from a dark rotated hood photo." {
  param($image)
  $canvas = Resize-Longest $image 1000
  Darken $canvas.Bitmap 105
  $canvas.Bitmap.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone)
  $canvas.Quality = 68
  $canvas
}

$manifest += Write-Variant $sources.filter "IMG_7422.jpg" "blurry_filter_duplicate_a" "Duplicate-looking filter photo should need vendor review if slot is uncertain." {
  param($image)
  $small = New-Canvas -Width ([Math]::Max(1, [int]($image.Width / 4))) -Height ([Math]::Max(1, [int]($image.Height / 4)))
  $small.Graphics.DrawImage($image, 0, 0, $small.Bitmap.Width, $small.Bitmap.Height)
  $large = New-Canvas -Width $image.Width -Height $image.Height
  $large.Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $large.Graphics.DrawImage($small.Bitmap, 0, 0, $image.Width, $image.Height)
  $small.Graphics.Dispose()
  $small.Bitmap.Dispose()
  $large.Quality = 54
  $large
}

$manifest += Write-Variant $sources.filter "IMG_7423.jpg" "blurry_filter_duplicate_b" "Near duplicate should not inflate proof coverage by itself." {
  param($image)
  $canvas = Resize-Longest $image 900
  Darken $canvas.Bitmap 55
  $canvas.Quality = 58
  $canvas
}

$manifest += Write-Variant $sources.duct "random-kitchen-01.jpg" "cropped_grease_path" "Cropped duct/grease path should be suggested cautiously, not called complete cleaning." {
  param($image)
  $sourceRect = New-Object System.Drawing.Rectangle(
    [int]($image.Width * 0.25),
    [int]($image.Height * 0.15),
    [int]($image.Width * 0.55),
    [int]($image.Height * 0.55)
  )
  $canvas = New-Canvas -Width 900 -Height 900
  $canvas.Graphics.DrawImage($image, (New-Object System.Drawing.Rectangle(0, 0, 900, 900)), $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
  $canvas.Quality = 70
  $canvas
}

$manifest += Write-Variant $sources.fan "roof-top-final-final.jpg" "overexposed_rooftop_fan" "Overexposed rooftop fan should still read as fan area but need review if unclear." {
  param($image)
  $canvas = Resize-Longest $image 1000
  Washout $canvas.Bitmap 105
  $canvas.Quality = 66
  $canvas
}

$manifest += Write-Variant $sources.grease "not-sure.jpg" "small_grease_bucket" "Grease bucket should not become cleaned-area proof." {
  param($image)
  $canvas = Resize-Longest $image 720
  $canvas.Quality = 62
  $canvas
}

$manifest += Write-Variant $sources.cleanFilter "after-or-before-maybe.jpg" "clean_filter_bad_name" "Clean filter with ambiguous filename should be a suggestion, not confirmed proof." {
  param($image)
  $canvas = Resize-Longest $image 1100
  $canvas.Quality = 66
  $canvas
}

$manifest += Write-Variant $sources.hood "blocked_area_cleaned_questionmark.jpg" "misleading_filename" "Misleading cleaned/blocked filename must not decide job result." {
  param($image)
  $canvas = Resize-Longest $image 900
  Darken $canvas.Bitmap 35
  $canvas.Quality = 64
  $canvas
}

$receipt = New-Canvas -Width 900 -Height 1200
$receiptBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 245, 238))
$receipt.Graphics.FillRectangle($receiptBrush, 60, 60, 780, 1080)
$receiptBrush.Dispose()
$inkBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(35, 35, 35))
$mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120, 120, 120))
$titleFont = New-Object System.Drawing.Font("Arial", 44, [System.Drawing.FontStyle]::Bold)
$bodyFont = New-Object System.Drawing.Font("Arial", 28, [System.Drawing.FontStyle]::Regular)
$receipt.Graphics.DrawString("UNRELATED RECEIPT", $titleFont, $inkBrush, 120, 130)
$receipt.Graphics.DrawString("TABLE 14", $bodyFont, $mutedBrush, 120, 230)
$receipt.Graphics.DrawString("COFFEE  4.50", $bodyFont, $inkBrush, 120, 330)
$receipt.Graphics.DrawString("LUNCH  18.00", $bodyFont, $inkBrush, 120, 390)
$receipt.Graphics.DrawString("TOTAL  22.50", $bodyFont, $inkBrush, 120, 510)
$receipt.Graphics.DrawString("NOT A HOOD JOB PHOTO", $bodyFont, $inkBrush, 120, 690)
$receipt.Graphics.DrawLine([System.Drawing.Pens]::Gray, 120, 810, 780, 810)
$receipt.Graphics.DrawString("QA SYNTHETIC", $bodyFont, $mutedBrush, 120, 870)
$receiptPath = Join-Path $outputPath "IMG_8420.jpg"
Save-Jpeg -Bitmap $receipt.Bitmap -Path $receiptPath -Quality 70
$manifest += [pscustomobject]@{
  file = "IMG_8420.jpg"
  localPath = "/axis1-test-photos/messy-synthetic/IMG_8420.jpg"
  source = "synthetic"
  kind = "unrelated_receipt"
  expectedStress = "Unrelated image should not be forced into a proof slot."
  width = $receipt.Bitmap.Width
  height = $receipt.Bitmap.Height
  bytes = (Get-Item $receiptPath).Length
}
$titleFont.Dispose()
$bodyFont.Dispose()
$inkBrush.Dispose()
$mutedBrush.Dispose()
$receipt.Graphics.Dispose()
$receipt.Bitmap.Dispose()

$manifestPath = Join-Path $outputPath "manifest.json"
$manifest | ConvertTo-Json -Depth 4 | Set-Content -Path $manifestPath -Encoding UTF8

Write-Output "Generated $($manifest.Count) messy Axis 1 fixtures at $outputPath"
