# Script untuk memeriksa keamanan sebelum commit ke GitHub
# Jalankan script ini sebelum git push

Write-Host "🔍 Checking security before GitHub commit..." -ForegroundColor Cyan
Write-Host ""

$hasErrors = $false

# Check 1: Verify secrets.js is not tracked by git
Write-Host "1. Checking if secrets.js is ignored by git..." -ForegroundColor Yellow
$gitStatus = git status --porcelain 2>$null
if ($gitStatus -match "secrets\.js") {
    Write-Host "❌ DANGER: secrets.js is tracked by git!" -ForegroundColor Red
    Write-Host "   Run: git rm --cached secrets.js" -ForegroundColor Red
    $hasErrors = $true
} else {
    Write-Host "✅ secrets.js is properly ignored" -ForegroundColor Green
}

# Check 2: Scan for hardcoded API keys in tracked files
Write-Host "2. Scanning for hardcoded API keys..." -ForegroundColor Yellow
$apiKeyPattern = "AIzaSy[A-Za-z0-9_-]{33}"
$trackedFiles = git ls-files | Where-Object { $_ -match "\.(js|json|html)$" -and $_ -notmatch "secrets\." -and $_ -notmatch "\.example\." }

$foundKeys = @()
foreach ($file in $trackedFiles) {
    $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
    if ($content -match $apiKeyPattern) {
        $foundKeys += $file
    }
}

if ($foundKeys.Count -gt 0) {
    Write-Host "❌ DANGER: API keys found in tracked files!" -ForegroundColor Red
    foreach ($file in $foundKeys) {
        Write-Host "   File: $file" -ForegroundColor Red
    }
    $hasErrors = $true
} else {
    Write-Host "✅ No hardcoded API keys found" -ForegroundColor Green
}

# Check 3: Verify .gitignore contains necessary entries
Write-Host "3. Checking .gitignore configuration..." -ForegroundColor Yellow
$gitignoreContent = Get-Content ".gitignore" -ErrorAction SilentlyContinue
$requiredEntries = @("secrets.js", "*.env", ".environment")
$missingEntries = @()

foreach ($entry in $requiredEntries) {
    if ($gitignoreContent -notcontains $entry) {
        $missingEntries += $entry
    }
}

if ($missingEntries.Count -gt 0) {
    Write-Host "⚠️  Missing entries in .gitignore:" -ForegroundColor Yellow
    foreach ($entry in $missingEntries) {
        Write-Host "   Missing: $entry" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ .gitignore properly configured" -ForegroundColor Green
}

# Check 4: Verify extension still functions
Write-Host "4. Checking if extension files are complete..." -ForegroundColor Yellow
$requiredFiles = @("manifest.json", "popup.html", "popup.js", "content.js", "background.js")
$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (!(Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ Missing required files:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "   Missing: $file" -ForegroundColor Red
    }
    $hasErrors = $true
} else {
    Write-Host "✅ All required files present" -ForegroundColor Green
}

Write-Host ""
Write-Host "📊 Security Check Results:" -ForegroundColor Cyan
if ($hasErrors) {
    Write-Host "❌ SECURITY ISSUES FOUND! DO NOT COMMIT YET!" -ForegroundColor Red
    Write-Host "   Fix the issues above before pushing to GitHub" -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ All security checks passed!" -ForegroundColor Green
    Write-Host "🚀 Safe to commit to GitHub" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  git add ." -ForegroundColor White
    Write-Host "  git commit -m 'feat: secure API implementation'" -ForegroundColor White
    Write-Host "  git push origin main" -ForegroundColor White
}
