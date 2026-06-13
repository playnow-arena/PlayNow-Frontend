$res = Invoke-WebRequest -Uri 'https://www.playnowarena.in/assets/index-DLYTukAu.css' -UseBasicParsing
$content = $res.Content
$content.Substring(0, 500)
if ($content -match 'w-full') {
    Write-Output "Has w-full"
} else {
    Write-Output "No w-full"
}
