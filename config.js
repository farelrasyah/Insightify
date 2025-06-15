// config.js - File konfigurasi untuk API keys dan settings
// File ini akan masuk ke .gitignore untuk keamanan

const CONFIG = {
    // API Configuration
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE',
    
    // Fallback untuk development (akan di-override oleh environment variable)
    DEV_API_KEY: 'AIzaSyARIKwnlrUeIxpGvTS5VhRxuR2HhWQCxoY',
    
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
    // Priority: Environment Variable > Dev Key > User Input
    return CONFIG.GEMINI_API_KEY !== 'YOUR_API_KEY_HERE' 
        ? CONFIG.GEMINI_API_KEY 
        : CONFIG.DEV_API_KEY;
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
