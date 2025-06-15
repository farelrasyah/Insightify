// config.example.js - Template konfigurasi untuk produksi
// Copy file ini ke config.js dan sesuaikan dengan kebutuhan

const CONFIG = {
    // API Configuration
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE',
    
    // Fallback untuk development (akan di-override oleh environment variable)
    // PENTING: API key asli ada di secrets.js (tidak di-commit ke GitHub)
    DEV_API_KEY: 'YOUR_DEV_API_KEY_HERE',
    
    // API Settings
    API_SETTINGS: {
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        models: [
            'gemini-1.5-flash',
            'gemini-1.5-pro', 
            'gemini-pro',
            'gemini-1.0-pro'
        ],
        maxComments: 100,
        timeout: 30000
    },
    
    // Extension Settings
    EXTENSION_SETTINGS: {
        retryAttempts: 3,
        retryDelay: 1000,
        debugMode: false
    }
};

// Function to get API key with fallback
function getApiKey() {
    // Priority: 
    // 1. Secrets file (development) 
    // 2. Environment Variable 
    // 3. User storage
    // 4. Fallback to null (user must input)
    
    // Try secrets.js first (development)
    if (typeof window !== 'undefined' && typeof window.getSecretApiKey !== 'undefined') {
        const secretKey = window.getSecretApiKey();
        if (secretKey && secretKey !== 'YOUR_GEMINI_API_KEY_HERE') {
            return secretKey;
        }
    }
    
    // Try environment variable
    if (CONFIG.GEMINI_API_KEY !== 'YOUR_API_KEY_HERE') {
        return CONFIG.GEMINI_API_KEY;
    }
    
    // Try development fallback (should be placeholder in production)
    if (CONFIG.DEV_API_KEY !== 'YOUR_DEV_API_KEY_HERE') {
        return CONFIG.DEV_API_KEY;
    }
    
    // Return null - user must input API key
    return null;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// For browser environment
if (typeof window !== 'undefined') {
    window.INSIGHTIFY_CONFIG = CONFIG;
    window.getApiKey = getApiKey;
}
