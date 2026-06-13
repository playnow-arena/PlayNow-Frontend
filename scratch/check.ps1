$res = Invoke-WebRequest -Uri 'https://www.playnowarena.in/assets/index-DLYTukAu.css' -UseBasicParsing
$res.Headers | Out-String
