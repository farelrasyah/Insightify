// Popup Script untuk Insightify
class InsightifyPopup {
    constructor() {
        this.apiKey = null;
        this.init();
    }

    async init() {
        await this.loadApiKey();
        this.setupEventListeners();
        this.checkCurrentTab();
    }

    async loadApiKey() {
        try {
            const result = await chrome.storage.local.get(['geminiApiKey']);
            this.apiKey = result.geminiApiKey;
            
            if (this.apiKey) {
                this.showMainSection();
            } else {
                this.showSetupSection();
            }
        } catch (error) {
            console.error('Error loading API key:', error);
            this.showSetupSection();
        }
    }

    setupEventListeners() {
        // Setup section events
        document.getElementById('saveApiKey').addEventListener('click', () => {
            this.saveApiKey();
        });

        document.getElementById('apiKeyInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveApiKey();
            }
        });

        // Main section events
        document.getElementById('summarizeBtn').addEventListener('click', () => {
            this.startSummarization();
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSetupSection();
        });

        document.getElementById('copyBtn').addEventListener('click', () => {
            this.copySummary();
        });

        document.getElementById('retryBtn').addEventListener('click', () => {
            this.startSummarization();
        });
    }

    async saveApiKey() {
        const apiKeyInput = document.getElementById('apiKeyInput');
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            this.showNotification('Masukkan API key terlebih dahulu', 'error');
            return;
        }

        if (!apiKey.startsWith('AIzaSy')) {
            this.showNotification('Format API key tidak valid', 'error');
            return;
        }

        try {
            await chrome.storage.local.set({ geminiApiKey: apiKey });
            this.apiKey = apiKey;
            this.showNotification('API key berhasil disimpan!', 'success');
            setTimeout(() => {
                this.showMainSection();
            }, 1000);
        } catch (error) {
            console.error('Error saving API key:', error);
            this.showNotification('Gagal menyimpan API key', 'error');
        }
    }

    showSetupSection() {
        document.getElementById('setupSection').style.display = 'block';
        document.getElementById('mainSection').style.display = 'none';
    }

    showMainSection() {
        document.getElementById('setupSection').style.display = 'none';
        document.getElementById('mainSection').style.display = 'block';
    }

    async checkCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const statusEl = document.getElementById('status');
            
            if (tab.url && tab.url.includes('youtube.com/watch')) {
                statusEl.innerHTML = '<p>✅ Siap menganalisis komentar YouTube</p>';
                statusEl.style.background = '#d4edda';
                statusEl.style.color = '#155724';
            } else {
                statusEl.innerHTML = '<p>⚠️ Buka halaman video YouTube terlebih dahulu</p>';
                statusEl.style.background = '#fff3cd';
                statusEl.style.color = '#856404';
            }
        } catch (error) {
            console.error('Error checking tab:', error);
        }
    }

    async startSummarization() {
        if (!this.apiKey) {
            this.showNotification('API key belum diatur', 'error');
            return;
        }

        try {
            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url || !tab.url.includes('youtube.com/watch')) {
                this.showNotification('Buka halaman video YouTube terlebih dahulu', 'error');
                return;
            }

            this.showLoading();

            // Send message to content script to extract comments
            const response = await chrome.tabs.sendMessage(tab.id, { 
                action: 'extractComments' 
            });

            if (response.error) {
                throw new Error(response.error);
            }

            if (!response.comments || response.comments.length === 0) {
                throw new Error('Tidak ada komentar yang ditemukan. Pastikan komentar sudah dimuat di halaman.');
            }

            // Send comments to Gemini API for summarization
            const summary = await this.summarizeWithGemini(response.comments);
            this.displayResults(summary, response.comments.length);

        } catch (error) {
            console.error('Summarization error:', error);
            this.showError(error.message);
        }
    }

    async summarizeWithGemini(comments) {
        const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`;
        
        // Limit comments to avoid API limits
        const maxComments = Math.min(comments.length, 100);
        const selectedComments = comments.slice(0, maxComments);
        
        // Create prompt for summarization
        const commentsText = selectedComments
            .map((comment, index) => `${index + 1}. ${comment}`)
            .join('\n');

        const prompt = `Analisis dan rangkum komentar YouTube berikut dalam bahasa Indonesia:

${commentsText}

Buatkan ringkasan yang mencakup:
1. **Sentimen Umum**: Apakah mayoritas komentar positif, negatif, atau netral
2. **Tema Utama**: 3-5 topik yang paling sering dibahas
3. **Poin Menarik**: Insight atau pendapat unik yang menonjol
4. **Kritik & Saran**: Jika ada kritik konstruktif atau saran
5. **Reaksi Emosional**: Bagaimana penonton bereaksi terhadap konten

Format dalam bentuk yang mudah dibaca dengan bullet points.`;

        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            
            if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
                throw new Error('Invalid response from Gemini API');
            }

            return {
                summary: data.candidates[0].content.parts[0].text,
                totalComments: comments.length,
                analyzedComments: selectedComments.length
            };

        } catch (error) {
            if (error.message.includes('API_KEY_INVALID')) {
                throw new Error('API key tidak valid. Periksa kembali API key Anda.');
            } else if (error.message.includes('QUOTA_EXCEEDED')) {
                throw new Error('Kuota API sudah habis. Coba lagi nanti.');
            } else {
                throw new Error(`Gagal menganalisis komentar: ${error.message}`);
            }
        }
    }

    showLoading() {
        this.hideAllSections();
        document.getElementById('loading').style.display = 'block';
        document.getElementById('summarizeBtn').disabled = true;
    }

    displayResults(result, totalComments) {
        this.hideAllSections();
        
        // Format and display summary
        const summaryContent = document.getElementById('summaryContent');
        summaryContent.innerHTML = this.formatSummary(result.summary);
        
        // Update stats
        document.getElementById('totalComments').textContent = totalComments;
        document.getElementById('analyzedComments').textContent = result.analyzedComments;
        
        document.getElementById('results').style.display = 'block';
        document.getElementById('summarizeBtn').disabled = false;
        
        // Store summary for copying
        this.lastSummary = result.summary;
    }

    formatSummary(summary) {
        // Convert markdown-like formatting to HTML
        return summary
            .replace(/\*\*(.*?)\*\*/g, '<h4>$1</h4>')
            .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
            .replace(/^-\s+(.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            .replace(/\n/g, '<br>');
    }

    showError(message) {
        this.hideAllSections();
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('error').style.display = 'block';
        document.getElementById('summarizeBtn').disabled = false;
    }

    hideAllSections() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('results').style.display = 'none';
        document.getElementById('error').style.display = 'none';
    }

    async copySummary() {
        if (!this.lastSummary) return;

        try {
            await navigator.clipboard.writeText(this.lastSummary);
            this.showNotification('Ringkasan berhasil disalin!', 'success');
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            this.showNotification('Gagal menyalin ke clipboard', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `insightify-notification ${type}`;
        notification.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 5px;">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} Insightify
            </div>
            <div>${message}</div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new InsightifyPopup();
});
