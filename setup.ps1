# Setup Script untuk Production (Windows PowerShell)
# Script ini membantu setup ekstensi untuk production

Write-Host "🚀 Setting up Insightify for Production..." -ForegroundColor Green

# Check if secrets.js exists
if (!(Test-Path "secrets.js")) {
    Write-Host "📋 Creating secrets.js from template..." -ForegroundColor Yellow
    Copy-Item "secrets.example.js" "secrets.js"
    Write-Host "⚠️  Please edit secrets.js and add your Gemini API key" -ForegroundColor Red
    Write-Host "📝 Edit: GEMINI_API_KEY: 'your-actual-api-key-here'" -ForegroundColor Cyan
} else {
    Write-Host "✅ secrets.js already exists" -ForegroundColor Green
}

# Check if config.js exists and update if needed
if (!(Test-Path "config.js")) {
    Write-Host "📋 Creating config.js from template..." -ForegroundColor Yellow
    Copy-Item "config.example.js" "config.js"
} else {
    Write-Host "✅ config.js already exists" -ForegroundColor Green
}

# Check if debug.js exists and update if needed
if (!(Test-Path "debug.js")) {
    Write-Host "📋 Creating debug.js from template..." -ForegroundColor Yellow
    Copy-Item "debug.example.js" "debug.js"
} else {
    Write-Host "✅ debug.js already exists" -ForegroundColor Green
}

# Check if .gitignore includes sensitive files
$gitignoreContent = Get-Content ".gitignore" -ErrorAction SilentlyContinue
$filesToIgnore = @("secrets.js", "config-local.js", "debug-local.js")

foreach ($file in $filesToIgnore) {
    if ($gitignoreContent -notcontains $file) {
        Write-Host "🔒 Adding $file to .gitignore..." -ForegroundColor Yellow
        Add-Content ".gitignore" "`n$file"
    } else {
        Write-Host "✅ $file already in .gitignore" -ForegroundColor Green
    }
}

Write-Host "✨ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit secrets.js and add your API key"
Write-Host "2. Load extension in Chrome"
Write-Host "3. Test on YouTube video page"
Write-Host ""
Write-Host "🔒 Security note: secrets.js will not be committed to git" -ForegroundColor Yellow
Write-Host "🔍 Run 'git status' to verify no sensitive files are tracked" -ForegroundColor Yellow
