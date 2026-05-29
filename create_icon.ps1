# Create a simple star/kids icon as ICO file using .NET
Add-Type -AssemblyName System.Drawing

$size = 256
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.TextRenderingHint = 'AntiAlias'

# Background gradient (purple)
$brush1 = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    [System.Drawing.Point]::new(0, 0),
    [System.Drawing.Point]::new($size, $size),
    [System.Drawing.Color]::FromArgb(255, 102, 126, 234),
    [System.Drawing.Color]::FromArgb(255, 118, 75, 162)
)
$g.FillEllipse($brush1, 8, 8, $size - 16, $size - 16)

# Draw star emoji as text
$font = New-Object System.Drawing.Font('Segoe UI Emoji', 120)
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = 'Center'
$sf.LineAlignment = 'Center'
$rect = [System.Drawing.RectangleF]::new(0, -10, $size, $size)
$g.DrawString('⭐', $font, [System.Drawing.Brushes]::White, $rect, $sf)

$g.Dispose()
$bmp.Save("$PSScriptRoot\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Icon created."
