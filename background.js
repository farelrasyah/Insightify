// background.js - Service Worker sederhana untuk Insightify
console.log('Insightify background script loaded');

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Insightify extension installed/updated:', details.reason);
    
    if (details.reason === 'install') {
        console.log('First time installation');
    }
});

// Handle tab updates to show badge on YouTube pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        if (tab.url.includes('youtube.com/watch')) {
            // Show active badge on YouTube video pages
            chrome.action.setBadgeText({
                text: '✓',
                tabId: tabId
            });
            chrome.action.setBadgeBackgroundColor({
                color: '#667eea',
                tabId: tabId
            });
        } else {
            // Clear badge on other pages
            chrome.action.setBadgeText({
                text: '',
                tabId: tabId
            });
        }
    }
});

// Simple message handling (mainly for debugging)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);
    
    // Just acknowledge the message
    sendResponse({ status: 'background received message' });
    return true;
});
