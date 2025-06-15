// Content Script untuk Insightify - Ekstraksi Komentar YouTube
class YouTubeCommentExtractor {
    constructor() {
        this.isExtracting = false;
        this.init();
    }

    init() {
        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'extractComments') {
                this.extractComments()
                    .then(comments => sendResponse({ comments }))
                    .catch(error => sendResponse({ error: error.message }));
                return true; // Keep message channel open for async response
            }
        });

        // Add Insightify button to YouTube interface (optional)
        this.addInsightifyButton();
    }

    async extractComments() {
        if (this.isExtracting) {
            throw new Error('Ekstraksi sedang berlangsung...');
        }

        this.isExtracting = true;

        try {
            // Wait for comments to load
            await this.waitForComments();
            
            // Scroll to load more comments
            await this.loadMoreComments();
            
            // Extract comment texts
            const comments = this.getCommentTexts();
            
            if (comments.length === 0) {
                throw new Error('Tidak ada komentar yang ditemukan. Pastikan komentar sudah dimuat.');
            }

            return comments;

        } finally {
            this.isExtracting = false;
        }
    }

    async waitForComments() {
        const maxWaitTime = 10000; // 10 seconds
        const startTime = Date.now();

        while (Date.now() - startTime < maxWaitTime) {
            // Check for comments section
            const commentsSection = document.querySelector('#comments');
            const commentItems = document.querySelectorAll('#comment #content-text');

            if (commentsSection && commentItems.length > 0) {
                return;
            }

            // Wait a bit before checking again
            await this.sleep(500);
        }

        throw new Error('Komentar tidak ditemukan. Pastikan halaman sudah selesai dimuat.');
    }

    async loadMoreComments() {
        const maxScrollAttempts = 5;
        let scrollAttempts = 0;
        let previousCommentCount = 0;

        while (scrollAttempts < maxScrollAttempts) {
            // Scroll to comments section
            const commentsSection = document.querySelector('#comments');
            if (commentsSection) {
                commentsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await this.sleep(1000);
            }

            // Scroll down to load more comments
            window.scrollBy(0, 1000);
            await this.sleep(1500);

            // Check if new comments loaded
            const currentCommentCount = document.querySelectorAll('#comment #content-text').length;
            
            if (currentCommentCount === previousCommentCount) {
                // No new comments loaded, try scrolling more
                scrollAttempts++;
            } else {
                // New comments loaded, reset counter
                scrollAttempts = 0;
                previousCommentCount = currentCommentCount;
            }

            // Stop if we have enough comments
            if (currentCommentCount >= 100) {
                break;
            }
        }
    }

    getCommentTexts() {
        const commentElements = document.querySelectorAll('#comment #content-text');
        const comments = [];

        commentElements.forEach(element => {
            const text = element.textContent?.trim();
            if (text && text.length > 5) { // Filter out very short comments
                comments.push(text);
            }
        });

        // Remove duplicates and limit to reasonable number
        const uniqueComments = [...new Set(comments)];
        return uniqueComments.slice(0, 500); // Limit to 500 comments max
    }

    addInsightifyButton() {
        // Add button to YouTube interface for easy access
        const observer = new MutationObserver(() => {
            const actionBar = document.querySelector('#actions #top-level-buttons-computed');
            const existingButton = document.querySelector('.insightify-button');

            if (actionBar && !existingButton) {
                const button = document.createElement('button');
                button.className = 'insightify-button';
                button.innerHTML = '🧠 Rangkum Komentar';
                button.title = 'Rangkum komentar dengan Insightify';

                button.addEventListener('click', () => {
                    // Open extension popup or trigger analysis
                    chrome.runtime.sendMessage({ action: 'openPopup' });
                });

                actionBar.appendChild(button);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.insightify-notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `insightify-notification ${type}`;
        notification.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 5px;">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} Insightify
            </div>
            <div>${message}</div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }
}

// Initialize when page is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new YouTubeCommentExtractor();
    });
} else {
    new YouTubeCommentExtractor();
}
