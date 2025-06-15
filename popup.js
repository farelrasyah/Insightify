// Popup Script untuk Insightify - Versi dengan API key aman untuk GitHub
class InsightifyPopup {
    constructor() {
        // API key dari config yang aman untuk GitHub
        this.apiKey = this.getApiKey();
        this.init();
    }

    // Function untuk mendapatkan API key dengan fallback
    getApiKey() {
        try {
            // Priority: Secrets file > Config file > Environment > Default
            if (typeof window.getSecretApiKey !== 'undefined') {
                return window.getSecretApiKey();
            } else if (typeof window.getApiKey !== 'undefined') {
                return window.getApiKey();
            } else if (typeof window.INSIGHTIFY_CONFIG !== 'undefined') {
                return window.INSIGHTIFY_CONFIG.DEV_API_KEY;
            } else {
                // Fallback untuk production - user harus input sendiri
                return this.getStoredApiKey();
            }
        } catch (error) {
            console.warn('Error getting API key from config:', error);
            return this.getStoredApiKey();
        }
    }

    // Function untuk mendapatkan API key dari storage (untuk production)
    async getStoredApiKey() {
        try {
            const result = await chrome.storage.local.get(['geminiApiKey']);
            return result.geminiApiKey || null;
        } catch (error) {
            console.error('Error getting stored API key:', error);
            return null;
        }
    }    async init() {
        this.setupEventListeners();
        this.checkCurrentTab();
        
        // Check if API key is available
        if (!this.apiKey) {
            console.warn('API key not found in config, checking storage...');
            this.apiKey = await this.getStoredApiKey();
            
            if (!this.apiKey) {
                console.warn('No API key available, showing setup section');
                this.showSetupSection();
                return;
            }
        }
        
        this.showMainSection(); // Show main section if API key is available
    }    setupEventListeners() {
        // Setup section events (untuk case ketika API key tidak tersedia)
        const saveApiKeyBtn = document.getElementById('saveApiKey');
        const apiKeyInput = document.getElementById('apiKeyInput');
        
        if (saveApiKeyBtn) {
            saveApiKeyBtn.addEventListener('click', () => {
                this.saveApiKey();
            });
        }

        if (apiKeyInput) {
            apiKeyInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.saveApiKey();
                }
            });
        }

        // Main section events
        document.getElementById('summarizeBtn').addEventListener('click', () => {
            this.startSummarization();
        });

        document.getElementById('copyBtn').addEventListener('click', () => {
            this.copySummary();
        });

        document.getElementById('retryBtn').addEventListener('click', () => {
            this.startSummarization();
        });

        // Settings button untuk switch ke setup mode
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSetupSection();
            });
            // Show settings button in case user wants to change API key
            settingsBtn.style.display = 'inline-block';
        }
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
                statusEl.style.borderRadius = '8px';
                statusEl.style.padding = '10px';
            } else {
                statusEl.innerHTML = '<p>⚠️ Buka halaman video YouTube terlebih dahulu</p>';
                statusEl.style.background = '#fff3cd';
                statusEl.style.color = '#856404';
                statusEl.style.borderRadius = '8px';
                statusEl.style.padding = '10px';
            }
        } catch (error) {
            console.error('Error checking tab:', error);
            document.getElementById('status').innerHTML = '<p>❌ Error checking current tab</p>';        }
    }

    async startSummarization() {
        try {
            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url || !tab.url.includes('youtube.com/watch')) {
                this.showError('Buka halaman video YouTube terlebih dahulu');
                return;
            }            this.showLoading();

            // List available models for debugging
            await this.listAvailableModels();

            // Inject content script if not already injected
            await this.ensureContentScriptInjected(tab.id);

            // Send message to content script to extract comments
            console.log('Sending message to content script...');
            
            const response = await this.sendMessageWithRetry(tab.id, { action: 'extractComments' });

            console.log('Response from content script:', response);

            if (response.error) {
                throw new Error(response.error);
            }

            if (!response.comments || response.comments.length === 0) {
                throw new Error('Tidak ada komentar yang ditemukan. Pastikan komentar sudah dimuat di halaman.');
            }

            console.log(`Found ${response.comments.length} comments`);

            // Send comments to Gemini API for summarization
            const summary = await this.summarizeWithGemini(response.comments);
            this.displayResults(summary, response.comments.length);

        } catch (error) {
            console.error('Summarization error:', error);
            this.showError(error.message);
        }
    }    async summarizeWithGemini(comments) {
        // Try multiple models in order of preference
        const models = [
            'gemini-1.5-flash',
            'gemini-1.5-pro', 
            'gemini-pro',
            'gemini-1.0-pro'
        ];
        
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

        // Try each model until one works
        for (const model of models) {
            try {
                console.log(`Trying model: ${model}`);
                const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
                
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

                console.log(`API Response status for ${model}:`, response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('API Response data:', data);
                    
                    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                        console.log(`Successfully used model: ${model}`);
                        return {
                            summary: data.candidates[0].content.parts[0].text,
                            totalComments: comments.length,
                            analyzedComments: selectedComments.length
                        };
                    }
                } else {
                    const errorText = await response.text();
                    console.warn(`Model ${model} failed:`, response.status, errorText);
                    
                    // If this is the last model, throw the error
                    if (model === models[models.length - 1]) {
                        throw new Error(`API Error: ${response.status} - ${errorText}`);
                    }
                    // Otherwise, continue to next model
                    continue;
                }
            } catch (error) {
                console.warn(`Error with model ${model}:`, error);
                
                // If this is the last model, throw the error
                if (model === models[models.length - 1]) {
                    throw error;
                }
                // Otherwise, continue to next model
                continue;
            }
        }
        
        throw new Error('Semua model Gemini tidak tersedia. Coba lagi nanti.');
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

    // Helper function to ensure content script is injected
    async ensureContentScriptInjected(tabId) {
        try {
            // Try to ping the content script first
            await this.sendMessageWithRetry(tabId, { action: 'ping' });
        } catch (error) {
            console.log('Content script not found, injecting...');
            
            // Inject content script manually
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['utils.js', 'content.js']
            });
            
            // Wait a bit for injection to complete
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // Helper function to send message with retry logic
    async sendMessageWithRetry(tabId, message, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await new Promise((resolve, reject) => {
                    chrome.tabs.sendMessage(tabId, message, (response) => {
                        if (chrome.runtime.lastError) {
                            reject(new Error(chrome.runtime.lastError.message));
                        } else {
                            resolve(response);
                        }
                    });
                });
                
                return response;
            } catch (error) {
                console.warn(`Message attempt ${i + 1} failed:`, error.message);
                
                if (i === maxRetries - 1) {
                    throw error;
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    }

    // Function to list available Gemini models (for debugging)
    async listAvailableModels() {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`);
            if (response.ok) {
                const data = await response.json();
                console.log('Available Gemini models:', data.models?.map(m => m.name) || []);
                return data.models;
            }
        } catch (error) {
            console.error('Error listing models:', error);
        }
        return [];
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Popup DOM loaded, initializing...');
    new InsightifyPopup();
});
