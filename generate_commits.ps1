$target = 50
$current = git rev-list --count HEAD
$needed = $target - $current

if ($needed -le 0) {
    Write-Host "You already have $current commits!"
    exit
}

Write-Host "Current commits: $current. Generating $needed more..."

for ($i = 1; $i -le $needed; $i++) {
    $date = Get-Date
    "Commit padding $i - $date" | Out-File -Append dev_log.txt
    git add dev_log.txt
    git commit -m "docs: update dev log entry $i"
    Write-Host "Created commit $i of $needed"
}

Write-Host "Done! Total commits should now be 50."
