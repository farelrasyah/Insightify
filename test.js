// Test file untuk development dan debugging Insightify

class InsightifyTester {
    constructor() {
        this.testComments = [
            "Video ini sangat membantu, terima kasih!",
            "Penjelasannya kurang jelas di bagian tengah",
            "Mantap bang, lanjutkan terus!",
            "Bisa buat tutorial lebih detail lagi?",
            "Keren banget, subscriber baru nih!",
            "Audio kurang jelas, mungkin bisa diperbaiki",
            "Konten berkualitas, keep it up!",
            "Part 2 nya kapan bang?",
            "Tutorial yang sangat dibutuhkan, thanks!",
            "Lebih suka video sebelumnya sih"
        ];
    }

    // Test ekstraksi komentar
    async testCommentExtraction() {
        console.log('🧪 Testing comment extraction...');
        
        try {
            const response = await chrome.tabs.sendMessage(
                (await chrome.tabs.query({ active: true, currentWindow: true }))[0].id,
                { action: 'extractComments' }
            );
            
            console.log('✅ Comments extracted:', response.comments?.length || 0);
            return response.comments;
        } catch (error) {
            console.error('❌ Error extracting comments:', error);
            return null;
        }
    }

    // Test API call dengan komentar dummy
    async testGeminiAPI(apiKey) {
        console.log('🧪 Testing Gemini API...');
        
        const prompt = `Analisis komentar YouTube berikut:
${this.testComments.map((c, i) => `${i+1}. ${c}`).join('\n')}

Berikan ringkasan sentimen dan tema utama.`;

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ API Response received');
            return data;
        } catch (error) {
            console.error('❌ API Error:', error);
            return null;
        }
    }

    // Test storage functionality
    async testStorage() {
        console.log('🧪 Testing storage...');
        
        try {
            // Test save
            await chrome.storage.local.set({ testKey: 'testValue' });
            
            // Test retrieve
            const result = await chrome.storage.local.get(['testKey']);
            
            if (result.testKey === 'testValue') {
                console.log('✅ Storage test passed');
                
                // Cleanup
                await chrome.storage.local.remove(['testKey']);
                return true;
            } else {
                throw new Error('Storage value mismatch');
            }
        } catch (error) {
            console.error('❌ Storage test failed:', error);
            return false;
        }
    }

    // Run all tests
    async runAllTests() {
        console.log('🚀 Starting Insightify tests...');
        
        const results = {
            storage: await this.testStorage(),
            comments: await this.testCommentExtraction(),
            // API test requires valid key
        };
        
        console.log('📊 Test Results:', results);
        return results;
    }

    // Mock comment data for UI testing
    getMockComments() {
        return this.testComments;
    }

    // Generate test summary
    generateMockSummary() {
        return {
            summary: `**Sentimen Umum**: Mayoritas positif (70% positif, 20% netral, 10% negatif)

**Tema Utama**:
- Appreciation untuk konten (40%)
- Request untuk konten lanjutan (25%)
- Feedback teknis (20%)
- Pertanyaan dan diskusi (15%)

**Poin Menarik**:
- Banyak viewers baru yang tertarik subscribe
- Ada permintaan untuk tutorial lebih detail
- Beberapa masalah teknis audio yang perlu diperbaiki

**Kritik & Saran**:
- Perbaikan kualitas audio
- Penjelasan yang lebih detail di bagian tertentu
- Konten lanjutan sangat dinanti

**Reaksi Emosional**:
- Antusiasme tinggi untuk konten serupa
- Apresiasi terhadap kualitas konten
- Engagement yang baik dengan creator`,
            totalComments: 250,
            analyzedComments: 100
        };
    }
}

// Export untuk console debugging
if (typeof window !== 'undefined') {
    window.InsightifyTester = InsightifyTester;
    
    // Quick test function
    window.testInsightify = async () => {
        const tester = new InsightifyTester();
        return await tester.runAllTests();
    };
}
