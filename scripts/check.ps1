Write-Host "Frontend Booking Engine - Development Check" -ForegroundColor Cyan
Write-Host "==========================================="
Write-Host ""

# Check dependencies
Write-Host "Checking Dependencies:" -ForegroundColor Blue
node --version
npm --version

# Check key files
Write-Host ""
Write-Host "Checking Key Files:" -ForegroundColor Blue
if (Test-Path "package.json") { Write-Host " package.json" -ForegroundColor Green } else { Write-Host " package.json" -ForegroundColor Red }
if (Test-Path "src/App.tsx") { Write-Host " src/App.tsx" -ForegroundColor Green } else { Write-Host " src/App.tsx" -ForegroundColor Red }
if (Test-Path "src/pages/AdminManagement.tsx") { Write-Host " AdminManagement.tsx" -ForegroundColor Green } else { Write-Host " AdminManagement.tsx" -ForegroundColor Red }

# Check file dates
Write-Host ""
Write-Host "Latest HTML file:" -ForegroundColor Yellow
Get-ChildItem "*.html" | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Format-List Name, LastWriteTime

Write-Host "Latest React component:" -ForegroundColor Yellow  
Get-ChildItem "src/pages/*.tsx" | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Format-List Name, LastWriteTime

Write-Host ""
Write-Host " Ready for development!" -ForegroundColor Green
