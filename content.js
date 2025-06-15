// content.js - Script untuk mengekstrak komentar dari halaman YouTube
console.log('Insightify content script loaded on:', window.location.href);

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script received message:', request);
    
    if (request.action === 'ping') {
        // Simple ping to check if content script is alive
        sendResponse({success: true, message: 'Content script is active'});
        return;
    }
    
    if (request.action === 'extractComments') {
        extractComments()
            .then(comments => {
                console.log(`Extracted ${comments.length} comments`);
                sendResponse({success: true, comments: comments});
            })
            .catch(error => {
                console.error('Error extracting comments:', error);
                sendResponse({error: error.message});
            });
        return true; // Keep message channel open for async response
    }
});

// Function to extract comments from YouTube page
async function extractComments() {
    try {
        // Wait for comments to load
        await waitForComments();
        
        // Scroll to load more comments
        await scrollToLoadComments();
        
        // Extract comment text
        const comments = getCommentTexts();
        
        if (comments.length === 0) {
            throw new Error('Tidak ada komentar yang ditemukan. Pastikan komentar sudah dimuat.');
        }
        
        return comments;
        
    } catch (error) {
        throw new Error(`Gagal mengekstrak komentar: ${error.message}`);
    }
}

// Wait for comments section to load
function waitForComments() {
    return new Promise((resolve, reject) => {
        const maxWait = 15000; // 15 seconds
        const startTime = Date.now();
        
        function checkComments() {
            // Try multiple selectors for comments
            const commentsSection = document.querySelector('#comments') || 
                                  document.querySelector('ytd-comments') ||
                                  document.querySelector('#comments-section');
            
            const commentItems = document.querySelectorAll('ytd-comment-thread-renderer') ||
                               document.querySelectorAll('#comment') ||
                               document.querySelectorAll('.comment-renderer');
            
            console.log(`Checking comments: section=${!!commentsSection}, items=${commentItems.length}`);
            
            if (commentsSection && commentItems.length > 0) {
                console.log('Comments found, proceeding...');
                resolve();
            } else if (Date.now() - startTime > maxWait) {
                // If no comments found, try to enable them
                tryEnableComments();
                reject(new Error('Comments tidak ditemukan. Pastikan comments diaktifkan untuk video ini.'));
            } else {
                setTimeout(checkComments, 1000);
            }
        }
        
        checkComments();
    });
}

// Try to enable comments by scrolling down
function tryEnableComments() {
    console.log('Trying to enable/load comments...');
    
    // Scroll down to trigger comment loading
    window.scrollTo(0, document.body.scrollHeight / 2);
    
    setTimeout(() => {
        window.scrollTo(0, document.body.scrollHeight);
    }, 1000);
}

// Scroll to load more comments
async function scrollToLoadComments() {
    const commentsSection = document.querySelector('#comments');
    if (!commentsSection) return;
    
    // Scroll to comments section first
    commentsSection.scrollIntoView({ behavior: 'smooth' });
    await sleep(1000);
    
    let lastCommentCount = 0;
    let currentCommentCount = 0;
    let scrollAttempts = 0;
    const maxScrolls = 5;
    
    while (scrollAttempts < maxScrolls) {
        currentCommentCount = document.querySelectorAll('ytd-comment-thread-renderer').length;
        
        if (currentCommentCount > lastCommentCount) {
            lastCommentCount = currentCommentCount;
            
            // Scroll down to load more
            window.scrollTo(0, document.body.scrollHeight);
            await sleep(2000);
            
            scrollAttempts++;
        } else {
            break; // No more comments loading
        }
    }
    
    console.log(`Loaded ${currentCommentCount} comments after scrolling`);
}

// Extract comment texts from the page
function getCommentTexts() {
    const comments = [];
    
    // Try multiple selectors for comment text
    const selectors = [
        'ytd-comment-thread-renderer #content-text',
        'ytd-comment-renderer #content-text', 
        '#comment #content-text',
        '.comment-renderer .comment-text',
        'yt-formatted-string[id="content-text"]'
    ];
    
    let commentElements = [];
    
    for (const selector of selectors) {
        commentElements = document.querySelectorAll(selector);
        if (commentElements.length > 0) {
            console.log(`Found ${commentElements.length} comments using selector: ${selector}`);
            break;
        }
    }
    
    if (commentElements.length === 0) {
        console.warn('No comment elements found with any selector');
        return [];
    }
    
    commentElements.forEach((element, index) => {
        if (index < 100) { // Limit to 100 comments for API efficiency
            const text = element.textContent?.trim();
            if (text && text.length > 5 && text.length < 500) { // Filter comments
                comments.push(text);
            }
        }
    });
    
    return comments;
}

// Helper function for delays
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Check if we're on a YouTube video page
function isYouTubeVideoPage() {
    return window.location.hostname === 'www.youtube.com' && 
           window.location.pathname === '/watch';
}

// Initialize content script
if (isYouTubeVideoPage()) {
    console.log('Insightify content script ready on YouTube video page');
} else {
    console.log('Not on a YouTube video page');
}
