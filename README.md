# 🗺️ İnteraktif Harita Gezgini

Modern ve kullanıcı dostu bir harita uygulaması. AI destekli konum keşfi ve günlük seyahat planlaması özelliklerine sahip.

![Maps Planner](https://img.shields.io/badge/Maps-Planner-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

## ✨ Özellikler

### 🎯 Temel Özellikler
- **AI Destekli Konum Arama**: Google Gemini AI ile akıllı konum önerileri
- **İnteraktif Harita**: Leaflet.js tabanlı modern harita deneyimi
- **Türkiye Odaklı**: Türkiye haritası ile başlangıç
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm

### 🗓️ Günlük Planlayıcı Modu
- **Detaylı Günlük Programlar**: Saatli ve sıralı ziyaret planları
- **Ulaşım Bilgileri**: Konumlar arası seyahat süreleri ve yöntemleri
- **Timeline Görünümü**: Günlük planınızı zaman çizelgesi olarak görüntüleme
- **Plan Dışa Aktarma**: Günlük planınızı metin dosyası olarak kaydetme

### 🎨 Kullanıcı Deneyimi
- **Blur Loading Efekti**: Arama sırasında profesyonel loading animasyonu
- **Konum Kartları**: Her konum için detaylı bilgi kartları
- **Popup Bilgileri**: Harita üzerinde zengin konum detayları
- **Carousel Navigasyon**: Konumlar arasında kolay geçiş

## 🚀 Kurulum

### Gereksinimler
- Node.js (v16 veya üzeri)
- npm veya yarn
- Google Gemini API anahtarı

### Adım Adım Kurulum

1. **Projeyi klonlayın**
```bash
git clone https://github.com/kullanici-adi/maps-planner.git
cd maps-planner
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Çevre değişkenlerini ayarlayın**
```bash
# .env dosyası oluşturun
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
```

4. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

5. **Tarayıcınızda açın**
```
http://localhost:5173
```

## 🔧 API Anahtarı Alma

1. [Google AI Studio](https://makersuite.google.com/app/apikey) adresine gidin
2. Google hesabınızla giriş yapın
3. "Create API Key" butonuna tıklayın
4. API anahtarınızı kopyalayın
5. `.env` dosyasına ekleyin

## 📖 Kullanım

### Genel Keşif Modu
1. Arama çubuğuna istediğiniz konumu yazın
2. AI size ilgili konumları önerecek
3. Harita üzerinde konumları keşfedin
4. Konum kartlarını kullanarak detayları görün

**Örnek Aramalar:**
- "İstanbul'daki tarihi yerler"
- "Kapadokya gezilecek yerler"
- "Antalya plajları"
- "Ankara müzeleri"

### Günlük Planlayıcı Modu
1. **Günlük Planlayıcı Modu** toggle'ını açın
2. Günlük plan isteğinizi yazın
3. AI size detaylı bir günlük program oluşturacak
4. Timeline'da saatli programınızı görün
5. İsterseniz planınızı dışa aktarın

**Örnek Günlük Planlar:**
- "İstanbul'da bir gün"
- "Kapadokya günlük turu"
- "Antalya şehir gezisi"
- "Ankara kültür turu"

## 🛠️ Teknoloji Stack

| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| **TypeScript** | ~5.7.2 | Type-safe JavaScript |
| **Vite** | ^6.2.0 | Modern build tool |
| **Leaflet.js** | ^1.9.4 | İnteraktif harita kütüphanesi |
| **Google Gemini AI** | ^0.7.0 | AI destekli konum önerileri |
| **Font Awesome** | 6.4.0 | İkon kütüphanesi |

## 📁 Proje Yapısı

```
maps-planner/
├── index.html          # Ana HTML dosyası
├── index.tsx           # Ana TypeScript dosyası
├── index.css           # Stil dosyası
├── package.json        # Proje bağımlılıkları
├── tsconfig.json       # TypeScript konfigürasyonu
├── vite.config.ts      # Vite konfigürasyonu
└── README.md           # Bu dosya
```

## 🎨 Özelleştirme

### Harita Ayarları
```typescript
// index.tsx dosyasında
map = L.map('map', {
  center: [39.9334, 32.8597], // Başlangıç koordinatları
  zoom: 6,                    // Başlangıç zoom seviyesi
  maxZoom: 10,               // Maksimum zoom seviyesi
});
```

### Stil Özelleştirme
CSS değişkenlerini `index.css` dosyasında düzenleyebilirsiniz:
- Renk paleti
- Font boyutları
- Animasyon süreleri
- Layout boyutları

## 🚀 Production Build

```bash
# Production build oluşturma
npm run build

# Build önizleme
npm run preview
```

Build dosyaları `dist/` klasöründe oluşturulacaktır.

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje Apache 2.0 lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🐛 Sorun Bildirimi

Bir sorunla karşılaştıysanız, lütfen [Issues](https://github.com/kullanici-adi/maps-planner/issues) sayfasından bildirin.

## 📞 İletişim

- **Geliştirici**: [Adınız]
- **Email**: your.email@example.com
- **LinkedIn**: [LinkedIn Profiliniz]

## 🙏 Teşekkürler

- [Leaflet.js](https://leafletjs.com/) - Harita kütüphanesi
- [Google Gemini AI](https://ai.google.dev/) - AI desteği
- [OpenStreetMap](https://www.openstreetmap.org/) - Harita verileri
- [Font Awesome](https://fontawesome.com/) - İkonlar

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
