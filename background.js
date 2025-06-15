// Background Script untuk Insightify
class InsightifyBackground {
    constructor() {
        this.init();
    }

    init() {
        // Handle extension installation
        chrome.runtime.onInstalled.addListener((details) => {
            if (details.reason === 'install') {
                console.log('Insightify installed successfully!');
                // Open welcome page or setup page
                chrome.tabs.create({
                    url: chrome.runtime.getURL('popup.html')
                });
            }
        });

        // Handle messages from other scripts
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'openPopup') {
                // Open extension popup
                chrome.action.openPopup();
            }
        });

        // Handle tab updates to check for YouTube pages
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com/watch')) {
                // Update extension icon or badge when on YouTube
                chrome.action.setBadgeText({ text: '✓', tabId: tabId });
                chrome.action.setBadgeBackgroundColor({ color: '#667eea', tabId: tabId });
            } else {
                // Clear badge on other pages
                chrome.action.setBadgeText({ text: '', tabId: tabId });
            }
        });

        // Handle extension icon click
        chrome.action.onClicked.addListener((tab) => {
            // This will open the popup automatically due to manifest configuration
            console.log('Extension icon clicked');
        });
    }

    // Helper method to manage API key security
    async validateApiKey(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') {
            return false;
        }

        // Basic validation for Gemini API key format
        return apiKey.startsWith('AIzaSy') && apiKey.length >= 39;
    }

    // Helper method to handle API errors
    handleApiError(error) {
        console.error('API Error:', error);
        
        if (error.message.includes('API_KEY_INVALID')) {
            return 'API key tidak valid. Periksa pengaturan API key.';
        } else if (error.message.includes('QUOTA_EXCEEDED')) {
            return 'Kuota API telah habis. Coba lagi nanti.';
        } else if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
            return 'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.';
        } else {
            return 'Terjadi kesalahan. Coba lagi nanti.';
        }
    }
}

// Initialize background script
new InsightifyBackground();
