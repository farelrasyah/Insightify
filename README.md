# 🧠 Insightify - YouTube Comment Summarizer

<div align="center">

![Insightify Logo](https://img.shields.io/badge/Insightify-YouTube%20Comment%20Summarizer-blue?style=for-the-badge&logo=youtube&logoColor=white)

**Ekstensi Chrome yang menggunakan AI untuk merangkum komentar YouTube dan memberikan insight tentang reaksi penonton**

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green?style=flat&logo=google-chrome)](https://chrome.google.com/webstore/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-orange?style=flat)](https://developer.chrome.com/docs/extensions/mv3/)
[![Gemini AI](https://img.shields.io/badge/Powered%20by-Gemini%20AI-blue?style=flat&logo=google)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

## ✨ Fitur Utama

- 🎯 **Ekstraksi Otomatis**: Mengambil 50-500 komentar teratas dari video YouTube
- 🤖 **AI-Powered Analysis**: Menggunakan Google Gemini API untuk analisis mendalam
- 📊 **Kategorisasi Cerdas**: Memisahkan sentimen positif, negatif, dan insight menarik
- 🔒 **Keamanan Terjamin**: API key disimpan lokal, tidak ter-upload ke GitHub
- ⚡ **Antarmuka Modern**: UI yang responsif dan mudah digunakan
- 📋 **Easy Copy**: Salin hasil ringkasan dengan satu klik

## 🚀 Demo & Screenshot

### Popup Interface
- **Setup Screen**: Input API key dengan validasi
- **Analysis Screen**: Progress loading dan hasil ringkasan
- **Results Display**: Kategori analisis yang terstruktur

### Hasil Analisis Mencakup:
1. **Sentimen Umum** - Mayoritas reaksi penonton
2. **Tema Utama** - Topik yang paling sering dibahas
3. **Poin Menarik** - Insight unik dari komentar
4. **Kritik & Saran** - Feedback konstruktif
5. **Reaksi Emosional** - Cara penonton merespons konten

## 🛠️ Instalasi & Setup

### 1. Clone Repository
```bash
git clone https://github.com/farelrasyah/insightify.git
cd insightify
```

### 2. Dapatkan Gemini API Key
1. Kunjungi [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Buat API key baru untuk Gemini
3. Salin API key Anda

### 3. Install di Chrome
1. Buka Chrome dan ketik `chrome://extensions/`
2. Aktifkan "Developer mode"
3. Klik "Load unpacked" dan pilih folder `Insightify`
4. Ekstensi akan muncul di toolbar Chrome

### 4. Konfigurasi API Key
1. Klik ikon Insightify di toolbar
2. Masukkan API key Gemini Anda
3. Klik "Simpan" - key akan disimpan lokal di browser

## 📖 Cara Penggunaan

1. **Buka Video YouTube**: Navigasi ke halaman video YouTube mana pun
2. **Klik Ekstensi**: Klik ikon Insightify di toolbar Chrome
3. **Mulai Analisis**: Klik tombol "✨ Rangkum Komentar"
4. **Tunggu Proses**: Ekstensi akan mengekstrak dan menganalisis komentar
5. **Lihat Hasil**: Hasil ringkasan akan ditampilkan dengan kategori yang jelas
6. **Salin Hasil**: Gunakan tombol "📋 Salin Ringkasan" untuk menyalin hasil

## 🏗️ Struktur Proyek

```
Insightify/
├── 📄 manifest.json          # Konfigurasi ekstensi Chrome
├── 🎨 popup.html             # Antarmuka popup ekstensi
├── ⚡ popup.js               # Logic untuk popup dan API calls
├── 🔍 content.js             # Script untuk ekstraksi komentar YouTube
├── 🔧 background.js          # Service worker untuk background tasks
├── 💅 style.css              # Styling untuk UI ekstensi
├── 📁 config/
│   └── 🔐 secrets.js         # Template untuk API key (masuk .gitignore)
├── 🖼️ icons/                 # Icon ekstensi (16, 32, 48, 128px)
├── 🚫 .gitignore             # File yang diabaikan Git
└── 📚 README.md              # Dokumentasi ini
```

## 🔧 Fungsi Setiap File

### `manifest.json`
- Konfigurasi ekstensi Chrome dengan Manifest V3
- Permissions untuk YouTube dan Gemini API
- Definisi content scripts dan popup

### `popup.html` & `popup.js`
- Antarmuka utama ekstensi
- Manajemen API key dengan penyimpanan lokal
- Komunikasi dengan content script
- Pemanggilan Gemini API untuk analisis

### `content.js`
- Ekstraksi komentar dari DOM YouTube
- Scroll otomatis untuk memuat lebih banyak komentar
- Filter dan pembersihan data komentar

### `background.js`
- Service worker untuk background tasks
- Manajemen badge ekstensi
- Error handling dan validasi

### `style.css`
- Modern UI dengan gradient design
- Responsive layout untuk popup
- Loading animations dan notifications

## 🔒 Keamanan API Key

### ⚠️ PENTING: Jangan Hardcode API Key!

Proyek ini menggunakan beberapa lapisan keamanan:

1. **Local Storage**: API key disimpan di `chrome.storage.local`
2. **User Input**: User memasukkan API key mereka sendiri
3. **Gitignore Protection**: File `config/secrets.js` tidak di-commit
4. **No Hardcoding**: Tidak ada API key yang di-hardcode di kode

### Untuk Development:
```javascript
// config/secrets.js (MASUK .GITIGNORE!)
const SECRETS = {
    GEMINI_API_KEY: 'your-api-key-here'
};
```

### Untuk Production:
- User input API key melalui popup
- Disimpan dengan `chrome.storage.local.set()`
- Validasi format API key sebelum disimpan

## ⚡ Optimasi & Limitasi

### Batasan API Gemini:
- **Rate Limit**: 60 requests per menit
- **Token Limit**: ~30,000 token per request
- **Quota**: Berdasarkan plan API Anda

### Optimasi yang Diterapkan:
- **Batasan Komentar**: Maksimal 100 komentar per analisis
- **Batch Processing**: Memproses komentar dalam batch
- **Error Handling**: Retry logic untuk request yang gagal
- **Cache Results**: Menyimpan hasil untuk mengurangi API calls

### Tips Penggunaan:
- Gunakan pada video dengan komentar > 20 untuk hasil optimal
- Tunggu komentar YouTube selesai dimuat sebelum analisis
- Untuk video viral, hasil mungkin perlu waktu lebih lama

## 🧪 Testing & Development

### Local Testing:
1. Load ekstensi dalam Developer Mode
2. Test di berbagai video YouTube
3. Periksa Console untuk debugging
4. Gunakan Chrome DevTools untuk inspect popup

### Debug Commands:
```javascript
// Di popup console
chrome.storage.local.get(['geminiApiKey'])

// Di content script console
document.querySelectorAll('#comment #content-text').length
```

## 🐛 Troubleshooting

### Masalah Umum:

**❌ "Tidak ada komentar ditemukan"**
- Tunggu halaman YouTube selesai dimuat
- Scroll down untuk memuat komentar
- Pastikan video memiliki komentar yang aktif

**❌ "API key tidak valid"**
- Periksa format API key (harus dimulai dengan `AIzaSy`)
- Pastikan API key Gemini sudah aktif
- Cek quota API di Google AI Studio

**❌ "Quota exceeded"**
- Tunggu reset quota (biasanya 1 menit)
- Upgrade plan API jika diperlukan
- Kurangi frekuensi penggunaan

## 🚀 Roadmap & Fitur Mendatang

- [ ] **Multi-language Support**: Analisis dalam berbagai bahasa
- [ ] **Sentiment Scoring**: Skor numerik untuk sentimen
- [ ] **Export Options**: Export ke PDF/CSV
- [ ] **Historical Data**: Simpan riwayat analisis
- [ ] **Comparison Mode**: Bandingkan komentar beberapa video
- [ ] **Chrome Sync**: Sinkronisasi pengaturan antar device

## 👥 Kontribusi

Kontribusi sangat diterima! Silakan:

1. Fork repository ini
2. Buat branch fitur baru (`git checkout -b feature/amazing-feature`)
3. Commit perubahan (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

### Guidelines:
- Ikuti standar coding JavaScript ES6+
- Tambahkan komentar untuk fungsi kompleks
- Test di berbagai browser Chrome/Edge
- Update README jika menambah fitur

## 📄 Lisensi

Proyek ini menggunakan lisensi MIT. Lihat file [LICENSE](LICENSE) untuk detail.

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) - AI engine untuk analisis
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/) - Platform ekstensi
- [YouTube](https://youtube.com) - Platform video yang dianalisis

## 📞 Support & Contact

- **Discussions**:https://github.com/farelrasyah
- **Email**: farelrasyah87@gmail.com

---

<div align="center">

**🌟 Jika proyek ini membantu, berikan star di GitHub! 🌟**

Made with farelrasyah❤️

</div>
