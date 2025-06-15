# Setup Script untuk Production
# Script ini membantu setup ekstensi untuk production

echo "🚀 Setting up Insightify for Production..."

# Check if secrets.js exists
if [ ! -f "secrets.js" ]; then
    echo "📋 Creating secrets.js from template..."
    cp secrets.example.js secrets.js
    echo "⚠️  Please edit secrets.js and add your Gemini API key"
    echo "📝 Edit: GEMINI_API_KEY: 'your-actual-api-key-here'"
else
    echo "✅ secrets.js already exists"
fi

# Check if .gitignore includes secrets.js
if ! grep -q "secrets.js" .gitignore; then
    echo "🔒 Adding secrets.js to .gitignore..."
    echo "secrets.js" >> .gitignore
else
    echo "✅ secrets.js already in .gitignore"
fi

echo "✨ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit secrets.js and add your API key"
echo "2. Load extension in Chrome"
echo "3. Test on YouTube video page"
echo ""
echo "🔒 Security note: secrets.js will not be committed to git"
