// debug.example.js - Template debug script untuk produksi
// Copy file ini ke debug.js dan sesuaikan dengan kebutuhan

async function testGeminiAPI() {
    // API key akan diambil dari secrets.js atau user input
    // JANGAN hardcode API key di sini!
    let API_KEY = null;
    
    // Try to get API key from various sources
    if (typeof window.getSecretApiKey !== 'undefined') {
        API_KEY = window.getSecretApiKey();
    } else if (typeof window.getApiKey !== 'undefined') {
        API_KEY = window.getApiKey();
    } else {
        console.error('❌ No API key available for testing');
        return { success: false, error: 'No API key configured' };
    }
    
    if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        console.error('❌ Please configure your API key in secrets.js');
        return { success: false, error: 'API key not configured' };
    }
    
    console.log('🧪 Testing Gemini API...');
    
    // 1. Test list models
    try {
        console.log('📋 Checking available models...');
        const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        
        if (modelsResponse.ok) {
            const modelsData = await modelsResponse.json();
            const availableModels = modelsData.models?.map(m => m.name.split('/').pop()) || [];
            console.log('✅ Available models:', availableModels);
            
            // Test the first available model
            if (availableModels.length > 0) {
                const testModel = availableModels[0];
                console.log(`🚀 Testing model: ${testModel}`);
                
                const testPrompt = 'Halo, ini adalah tes sederhana. Jawab dengan "API berfungsi dengan baik!"';
                
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${testModel}:generateContent?key=${API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: testPrompt
                            }]
                        }]
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    console.log('✅ API Response:', result);
                    return { success: true, model: testModel, response: result };
                } else {
                    const errorText = await response.text();
                    console.error('❌ API Error:', response.status, errorText);
                    return { success: false, error: errorText };
                }
            }
        } else {
            const errorText = await modelsResponse.text();
            console.error('❌ Models list error:', modelsResponse.status, errorText);
            return { success: false, error: errorText };
        }
    } catch (error) {
        console.error('❌ Network error:', error);
        return { success: false, error: error.message };
    }
}

// Test function untuk content script
function testContentScript() {
    console.log('🧪 Testing content script...');
    
    // Check if we're on YouTube
    if (window.location.hostname !== 'www.youtube.com') {
        console.log('❌ Not on YouTube');
        return false;
    }
    
    if (!window.location.pathname.includes('/watch')) {
        console.log('❌ Not on a video page');
        return false;
    }
    
    console.log('✅ On YouTube video page');
    
    // Check for comments
    const commentsSection = document.querySelector('#comments');
    const commentItems = document.querySelectorAll('ytd-comment-thread-renderer');
    
    console.log(`📝 Found ${commentItems.length} comment threads`);
    
    if (commentItems.length > 0) {
        const sampleComments = Array.from(commentItems)
            .slice(0, 5)
            .map(item => {
                const textElement = item.querySelector('#content-text');
                return textElement ? textElement.textContent.trim() : '';
            })
            .filter(text => text.length > 0);
            
        console.log('📝 Sample comments:', sampleComments);
        return true;
    } else {
        console.log('❌ No comments found');
        return false;
    }
}

// Export functions for console use
if (typeof window !== 'undefined') {
    window.testGeminiAPI = testGeminiAPI;
    window.testContentScript = testContentScript;
    
    console.log('🛠️ Test functions loaded:');
    console.log('- testGeminiAPI() - Test API connection');
    console.log('- testContentScript() - Test comment extraction');
}
