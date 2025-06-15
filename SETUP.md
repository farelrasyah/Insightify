# Insightify - Setup Guide

## 🚀 Panduan Setup Lengkap

### 1. Prasyarat
- Google Chrome atau Microsoft Edge
- Koneksi internet
- API key Google Gemini (gratis)

### 2. Mendapatkan API Key Gemini

1. **Kunjungi Google AI Studio**
   - Buka [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
   - Login dengan akun Google Anda

2. **Buat API Key Baru**
   - Klik "Create API Key"
   - Pilih "Create API key in new project" atau gunakan project existing
   - Salin API key yang dihasilkan

3. **Simpan API Key**
   - API key format: `AIzaSy...` (39 karakter)
   - Jangan share API key ke orang lain
   - Simpan di tempat yang aman

### 3. Install Ekstensi

#### Metode 1: Dari Source Code (Recommended)
```bash
# Clone repository
git clone https://github.com/your-username/insightify.git
cd insightify

# Buka Chrome
# Ketik: chrome://extensions/
# Aktifkan "Developer mode" (toggle di kanan atas)
# Klik "Load unpacked"
# Pilih folder "Insightify"
```

#### Metode 2: Download ZIP
1. Download ZIP dari GitHub releases
2. Extract ke folder lokal
3. Load unpacked di Chrome extensions

### 4. Konfigurasi Awal

1. **Klik ikon Insightify** di toolbar Chrome
2. **Setup API Key**:
   - Masukkan API key Gemini Anda
   - Klik "💾 Simpan"
   - Key akan disimpan lokal di browser

3. **Test Ekstensi**:
   - Buka video YouTube
   - Klik ikon Insightify
   - Klik "✨ Rangkum Komentar"

### 5. Troubleshooting Setup

#### ❌ Ekstensi tidak muncul
- Pastikan Developer mode aktif
- Refresh halaman chrome://extensions/
- Periksa error di console

#### ❌ API key tidak valid
- Periksa format API key (harus `AIzaSy...`)
- Pastikan API key aktif di Google AI Studio
- Coba generate API key baru

#### ❌ Tidak bisa akses YouTube
- Refresh halaman YouTube
- Pastikan ekstensi memiliki permission
- Cek di chrome://extensions/ > Insightify > Details

### 6. Tips Penggunaan

- **Video Terbaik**: Pilih video dengan 50+ komentar
- **Loading Time**: Video viral mungkin butuh waktu lebih lama
- **Quota Management**: API gratis memiliki limit harian
- **Best Practice**: Tunggu komentar selesai load sebelum analisis

### 7. Update Ekstensi

```bash
# Pull update terbaru
git pull origin main

# Refresh ekstensi di Chrome
# chrome://extensions/ > Reload button pada Insightify
```

## 🔧 Development Setup

### Local Development
```bash
# Install dependencies (optional)
npm install

# Run development server (jika ada)
npm run dev

# Build untuk production
npm run build
```

### File Structure untuk Development
```
Insightify/
├── src/              # Source files
├── dist/             # Built files  
├── test/             # Test files
└── docs/             # Documentation
```

### Testing
- Test di berbagai video YouTube
- Periksa console errors
- Test dengan komentar dalam bahasa berbeda

## 📱 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 88+     | ✅ Full Support |
| Edge    | 88+     | ✅ Full Support |
| Firefox | -       | ❌ Not Supported (Manifest V3) |
| Safari  | -       | ❌ Not Supported |

## 🆘 Need Help?

- **Issues**: [GitHub Issues](https://github.com/your-username/insightify/issues)
- **Documentation**: [Wiki](https://github.com/your-username/insightify/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/insightify/discussions)
