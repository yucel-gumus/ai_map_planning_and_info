# 🗺️ AI Map Planner & Spatial Itinerary Guide

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-Spatial_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![GIS / Maps](https://img.shields.io/badge/GIS-Maps_Interceptor-28A745?style=for-the-badge&logo=openstreetmap&logoColor=white)](https://leafletjs.com/)
[![Portfolio](https://img.shields.io/badge/Portfolio-yucelgumus.dev-2563EB?style=for-the-badge&logo=google-chrome&logoColor=white)](https://www.yucelgumus.dev/)

> Kullanıcıların seyahat, gezi ve keşif hedeflerini **Google Gemini AI** ile akıllı gezi rotalarına, zaman çizelgelerine (timeline) ve harita üzeri interaktif durak kartlarına dönüştüren modern coğrafi planlama platformu.

---

## 🌟 Öne Çıkan Özellikler

- 🧭 **Yapay Zeka Destekli Rota Oluşturucu:** *"İstanbul'da 2 günlük tarihi ve gastronomik rota çiz"* gibi serbest metin isteklerini optimize edilmiş coğrafi koordinatlı duraklara dönüştürür.
- ⏱️ **İnteraktif Zaman Çizelgesi (Timeline):** Her bir durağın ziyaret süresini, önerilen saatini, ulaşım yöntemini (yürüme, toplu taşıma, araç) ve mesafe hesaplamalarını dinamik gösterir.
- 🎴 **Konum Kartları & Karusel (Location Cards):** Mekan fotoğrafları, puanları, tarihi bilgileri ve ipuçlarını içeren zengin kart bileşenleri.
- 📡 **Google Places & Maps Interceptor:** Mekanların yüksek kaliteli fotoğraflarını ve mekan detaylarını çeken güvenli API proxy katmanı (`api/places/photo.ts`).
- 💾 **Dışa Aktarma & Paylaşım:** Oluşturulan seyahat planlarını farklı formatlarda dışa aktarma (`export.utils.ts`).
- ⚡ **Modüler TypeScript Mimarisi:** Custom hook (`usePlanner`, `useTimeline`, `useMap`) ve servis katmanı ayrımı ile yüksek performans.

---

## 🏗️ Mimari & Modül Yapısı

```mermaid
graph TD
    User([Kullanıcı / Gezgin]) -->|Arama & İstek| SearchBar[Search & Mode Toggle]
    SearchBar --> usePlanner[usePlanner Hook]
    usePlanner --> AIService[Gemini AI Service]
    AIService -->|Yapılandırılmış Rota Verisi| useTimeline[useTimeline & useMap Hooks]
    useTimeline --> MapContainer[Interactive Map Engine]
    useTimeline --> TimelineUI[Timeline & Duration Breakdown]
    useTimeline --> Carousel[Location Cards Carousel]
    MapContainer <-->|Fotoğraf & Mekan Bilgisi| PhotoAPI[Places Proxy API]
```

| Modül | Görev |
| :--- | :--- |
| **`src/services/ai.service.ts`** | Gemini AI ile rota oluşturma ve mekan analizi |
| **`src/components/Map/`** | Harita render motoru, marker çizimi ve rota çizgileri |
| **`src/components/Timeline/`** | Zaman çizelgesi, durak sıralaması ve ulaşım detayları |
| **`src/utils/route.utils.ts`** | Koordinatlar arası mesafe ve rota optimizasyonu |
| **`api/places/photo.ts`** | Mekan fotoğraflarını güvenle çeken serverless API |

---

## 🚀 Hızlı Başlangıç

### Gereksinimler
- **Node.js**: v18.0 veya üstü
- **Google Gemini API Key**

### Kurulum

```bash
# Depoyu klonlayın
git clone https://github.com/yucel-gumus/ai_map_planning_and_info.git
cd ai_map_planning_and_info

# Bağımlılıkları yükleyin
npm install
```

### Ortam Değişkenleri (`.env`)

Proje kök dizininde `.env` dosyası oluşturun:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Uygulamayı Çalıştırma

```bash
# Geliştirme sunucusunu başlatın
npm run dev
```

Uygulama `http://localhost:5173` adresinde çalışacaktır.

---

## 📂 Proje Dizin Yapısı

```
ai_map_planning_and_info/
├── api/
│   ├── generate-map.ts             # Harita üretim serverless fonksiyonu
│   └── places/photo.ts             # Mekan fotoğrafları proxy API
├── index.html
├── package.json
├── vite.config.ts
└── src/
    ├── main.ts
    ├── app.ts
    ├── types/                      # Rota, konum ve UI tipleri
    ├── constants/                  # Harita ve AI sabitleri
    ├── services/
    │   ├── ai.service.ts           # Gemini planlama servisi
    │   ├── map.service.ts          # Harita servisleri
    │   └── image.service.ts        # Fotoğraf servisleri
    ├── hooks/
    │   ├── usePlanner.ts           # Rota planlayıcı hook
    │   ├── useTimeline.ts          # Zaman çizelgesi hook
    │   └── useMap.ts               # Harita state hook
    ├── components/
    │   ├── Search/                 # Arama çubuğu ve mod seçici
    │   ├── Map/                    # Harita konteyneri
    │   ├── Timeline/               # Zaman çizelgesi bileşenleri
    │   ├── Cards/                  # Mekan kartları & karusel
    │   └── Modal/                  # Yardım ve bilgilendirme modalları
    └── styles/                     # CSS değişkenleri ve modüler stiller
```

---

## 📄 Lisans
Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.

---

## 👨‍💻 Geliştirici & İletişim

**Yücel Gümüş** - Full Stack Developer

- 🌐 **Web Sitesi / Portfolyo:** [yucelgumus.dev](https://www.yucelgumus.dev/)
- 💼 **LinkedIn:** [linkedin.com/in/yucel-gumus](https://www.linkedin.com/in/yucel-gumus/)
- 🐙 **GitHub:** [@yucel-gumus](https://github.com/yucel-gumus)

<p align="left">
  <a href="https://www.yucelgumus.dev/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Developed%20by-Yücel%20Gümüş-blue?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Yücel Gümüş Portfolio" />
  </a>
</p>
