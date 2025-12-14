
Add-Type -AssemblyName System.Drawing

function Remove-BlackBackground {
    param (
        [string]$imagePath,
        [int]$threshold = 30
    )

    if (-not (Test-Path $imagePath)) {
        Write-Host "File not found: $imagePath"
        return
    }

    $fullPath = (Resolve-Path $imagePath).Path
    Write-Host "Processing: $fullPath"

    try {
        $img = [System.Drawing.Bitmap]::FromFile($fullPath)
        $newImg = New-Object System.Drawing.Bitmap($img.Width, $img.Height)
        $g = [System.Drawing.Graphics]::FromImage($newImg)
        $g.DrawImage($img, 0, 0, $img.Width, $img.Height)
        $g.Dispose()
        $img.Dispose() # Release original file lock

        for ($x = 0; $x -lt $newImg.Width; $x++) {
            for ($y = 0; $y -lt $newImg.Height; $y++) {
                $pixel = $newImg.GetPixel($x, $y)
                # Check if pixel is dark (R, G, and B all below threshold)
                if ($pixel.R -lt $threshold -and $pixel.G -lt $threshold -and $pixel.B -lt $threshold) {
                    $newImg.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
                }
            }
        }

        $newImg.Save($fullPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $newImg.Dispose()
        Write-Host "Completed: $fullPath"
    }
    catch {
        Write-Host "Error processing $imagePath : $_"
    }
}

$files = @(
    "C:\Users\nafis\OneDrive\Documents\AntiGravity\Aim\favicon_home.png",
    "C:\Users\nafis\OneDrive\Documents\AntiGravity\Aim\favicon_aim.png",
    "C:\Users\nafis\OneDrive\Documents\AntiGravity\Aim\favicon_cps.png",
    "C:\Users\nafis\OneDrive\Documents\AntiGravity\Aim\favicon_reaction.png"
)

foreach ($f in $files) {
    Remove-BlackBackground -imagePath $f
}
