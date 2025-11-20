Write-Host "Monthly Maintenance Verification" -ForegroundColor Cyan
Write-Host "================================"
Write-Host ""

Write-Host "1. File Date Check:" -ForegroundColor Blue
$latestHtml = Get-ChildItem "*.html" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$latestReact = Get-ChildItem "src/pages/*.tsx" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Write-Host "   Latest HTML: $($latestHtml.Name) - $($latestHtml.LastWriteTime)"
Write-Host "   Latest React: $($latestReact.Name) - $($latestReact.LastWriteTime)"

Write-Host ""
Write-Host "2. Key Components Check:" -ForegroundColor Blue
if (Test-Path "src/pages/AdminManagement.tsx") { Write-Host "    AdminManagement.tsx exists" -ForegroundColor Green }
if (Test-Path "src/pages/AdminCalendar.tsx") { Write-Host "    AdminCalendar.tsx exists" -ForegroundColor Green }
if (Test-Path "src/components/ImageGallery.tsx") { Write-Host "    ImageGallery.tsx exists" -ForegroundColor Green }

Write-Host ""
Write-Host "3. Build Test:" -ForegroundColor Blue
Write-Host "   Running npm run build..."
