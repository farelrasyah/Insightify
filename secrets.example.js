// secrets.example.js - Template file untuk production
// Copy file ini ke secrets.js dan isi dengan API key Anda

const SECRETS = {
    // Ganti dengan API key Gemini Anda
    GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE',
    
    // Konfigurasi tambahan jika diperlukan
    API_CONFIG: {
        timeout: 30000,
        retries: 3
    }
};

// Function untuk mendapatkan API key
function getSecretApiKey() {
    if (SECRETS.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        console.warn('Please set your API key in secrets.js');
        return null;
    }
    return SECRETS.GEMINI_API_KEY;
}

// Export untuk digunakan di file lain
if (typeof window !== 'undefined') {
    window.INSIGHTIFY_SECRETS = SECRETS;
    window.getSecretApiKey = getSecretApiKey;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SECRETS;
}
