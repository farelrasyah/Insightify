// Development utilities untuk Insightify

class DevUtils {
    static log(message, data = null) {
        if (this.isDevelopment()) {
            console.log(`[Insightify] ${message}`, data || '');
        }
    }

    static error(message, error = null) {
        console.error(`[Insightify Error] ${message}`, error || '');
    }

    static isDevelopment() {
        return !('update_url' in chrome.runtime.getManifest());
    }

    static async testApiKey(apiKey) {
        const testPrompt = "Test prompt untuk validasi API key";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: testPrompt }] }]
                })
            });
            
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    static getYouTubeVideoId(url) {
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    static formatCommentCount(count) {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count.toString();
    }

    static sanitizeComment(comment) {
        // Remove excessive whitespace and special characters
        return comment
            .replace(/\s+/g, ' ')
            .replace(/[^\w\s\u00C0-\u017F\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/g, '')
            .trim();
    }

    static async getCurrentTabInfo() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            return {
                url: tab.url,
                title: tab.title,
                videoId: this.getYouTubeVideoId(tab.url)
            };
        } catch (error) {
            this.error('Error getting tab info:', error);
            return null;
        }
    }
}

// Export untuk digunakan di file lain
if (typeof window !== 'undefined') {
    window.DevUtils = DevUtils;
}
