# Frontend Booking Engine - Development Pre-Check Script
Write-Host ""
Write-Host "Frontend Booking Engine - Development Pre-Check" -ForegroundColor Cyan
Write-Host "=============================================="

# Check Node.js and npm
Write-Host ""
Write-Host "Checking Dependencies:" -ForegroundColor Blue
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found!" -ForegroundColor Red
}

try {
    $npmVersion = npm --version  
    Write-Host "✓ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm not found!" -ForegroundColor Red
}

# Check package.json
if (Test-Path "package.json") {
    Write-Host "✓ package.json found" -ForegroundColor Green
} else {
    Write-Host "✗ package.json not found!" -ForegroundColor Red
}

# Check React components
Write-Host ""
Write-Host "Checking React Components:" -ForegroundColor Blue
$keyFiles = @("src/App.tsx", "src/main.tsx", "src/pages/Index.tsx", "src/pages/AdminManagement.tsx")
foreach ($file in $keyFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file" -ForegroundColor Green
    } else {
        Write-Host "✗ $file MISSING!" -ForegroundColor Red
    }
}

# Check HTML vs React dates
Write-Host ""
Write-Host "Checking File Dates:" -ForegroundColor Blue
$htmlFiles = Get-ChildItem "*.html" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$reactFiles = Get-ChildItem "src/pages/*.tsx" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($htmlFiles -and $reactFiles) {
    if ($htmlFiles.LastWriteTime -gt $reactFiles.LastWriteTime) {
        Write-Host "⚠ WARNING: HTML files are newer than React components!" -ForegroundColor Red
        Write-Host "Make sure you update React components, not HTML files!" -ForegroundColor Red
    } else {
        Write-Host "✓ React components are up to date" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Development Guidelines:" -ForegroundColor Cyan
Write-Host "✓ Update files in: /src/pages/ or /src/components/" -ForegroundColor Green
Write-Host "✗ DO NOT update: HTML files in root directory" -ForegroundColor Red
Write-Host "! Always test with: npm run build" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ready to start development!" -ForegroundColor Green