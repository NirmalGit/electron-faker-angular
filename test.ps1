function Show-Tree {
    param($Path = ".", $Prefix = "")
    $items = Get-ChildItem -LiteralPath $Path -Force | Where-Object {
        -not ($_.PSIsContainer -and ($_.Name -match '^(node_modules|dist|coverage|out|tmp|\..*)$')) -and
        -not ($_.Name -match '^\..*')
    }

    foreach ($item in $items) {
    Write-Output ($Prefix + ([char]0x251C) + ([char]0x2500) + ([char]0x2500) + " " + $item.Name)
        if ($item.PSIsContainer) {
            if ($item.Name -notmatch '^(node_modules|dist|coverage|out|tmp|\..*)$') {
                Show-Tree -Path $item.FullName -Prefix ("$Prefix" + ([char]0x2502) + "   ")
            }
        }
    }
}

Show-Tree | Out-File -Encoding utf8 structure.txt
Get-Content structure.txt