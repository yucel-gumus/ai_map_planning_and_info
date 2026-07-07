# 🗺️ AI Harita Planlama ve Bilgi (Interactive Travel Planner & Discovery Map)

AI Harita Planlama ve Bilgi; kullanıcıların doğal dilde aramalar yaparak coğrafi keşifler yapmasını, saatli günlük seyahat planları (itinerary) oluşturmasını ve Leaflet harita üzerinde interaktif olarak rotalarını planlamasını sağlayan modern bir **Vite + TypeScript + Leaflet** web uygulamasıdır.

Uygulamanın yapay zeka operasyonları, API anahtarı güvenliğini sağlamak amacıyla yerleşik bir **Vercel Serverless Function Proxy** katmanı üzerinden yürütülür.

---

## 🌟 Öne Çıkan Özellikler

### 1. Genel Keşif Modu (Discovery Mode)
* **Doğal Dil ile Arama:** Kullanıcılar serbest metinlerle arama yapar (Örn: *"Kapadokya'da gezilecek en popüler 5 yer"* veya *"İzmir tarihi yerler"*).
* **Akıllı Konum İşaretleme:** Yapay zeka sorgulanan yerleri listeler, koordinatlarını çıkartır ve haritada markerlar ile işaretler.
* **Görsel Detay Kartları:** Harita altında, her konuma ait blur loading efektli detaylı bilgi kartları ve carousel listesi gösterilir.

### 2. Günlük Seyahat Planlayıcı Modu (Itinerary Mode)
* **Zaman Çizelgesi (Timeline):** Yapay zeka seyahatin başlangıç saatine göre saatli ve sıralı bir seyahat programı çıkarır.
* **Ulaşım ve Seyahat Süreleri:** Konumlar arasındaki tahmini seyahat süreleri ve en uygun ulaşım yöntemleri (yürüyüş, toplu taşıma, araç) AI tarafından hesaplanıp listelenir.
* **Planı Dışa Aktarma (Export):** Hazırlanan günlük seyahat planı tek tıkla metin dosyası (.txt) olarak bilgisayara indirilebilir.

---

## 🏗️ Mimarî Yapı ve Güvenlik Gücü

Uygulama, istemci tarafında (tarayıcıda) hiçbir şekilde API anahtarı barındırmaz. Güvenlik ve veri akışı şu şekilde sağlanır:

```
[ İstemci (Vite + Leaflet) ] ──(POST /api/generate-map)──► [ Vercel Serverless (api/generate-map.ts) ]
                                                                       │
                                                             (X-API-Key Yetkilendirme)
                                                                       ▼
[ Gemini 3.5 Flash ] ◄──(Koordinat & Plan Üretimi)──── [ Python Gateway (api.yucelgumus.dev) ]
```

* **Vercel Serverless Proxy:** İstemciden gelen `/api/generate-map` isteklerini yakalar, server-side env'de saklanan `GATEWAY_CLIENT_API_KEY`'i ekler ve canlı API Gateway'e (`https://api.yucelgumus.dev`) iletir.
* **Dev Proxy:** Geliştirme ortamında (localhost) CORS engeline takılmamak için Vite dev proxy yapılandırması kullanılır.

---

## 📂 Proje Klasör Yapısı

```
ai_map_planning_and_info/
├── src/
│   ├── components/       # Harita arayüzü, sepet, timeline ve arama panelleri
│   ├── constants/        # AI API endpoint sabitleri
│   ├── styles/           # CSS ve UI layout stilleri
│   ├── utils/            # İhracat (export) ve veri dönüştürücü araçlar
│   ├── app.ts            # Ana uygulama bileşeni ve durum yönetimi
│   └── main.ts
├── api/
│   └── generate-map.ts   # Vercel Serverless Function (Gateway Proxy)
├── vercel.json           # Vercel yönlendirme ve API yapılandırmaları
├── vite.config.ts        # Geliştirme sunucusu proxy ayarları
└── package.json
```

---

## 🚀 Kurulum ve Yerel Çalıştırma

### 1. Bağımlılıkları Yükleyin
```bash
git clone https://github.com/yucel-gumus/ai_map_planning_and_info.git
cd ai_map_planning_and_info
npm install
```

### 2. Çevresel Değişkenler (`.env`)
Proje kök dizininde `.env` oluşturun ve anahtarları tanımlayın:

```env
# Sunucu Tarafı (Vercel Serverless / Local API için)
AI_API_URL=https://api.yucelgumus.dev
GATEWAY_CLIENT_API_KEY=your_plain_client_api_key
```

### 3. Geliştirme Sunucusunu Başlatma
```bash
npm run dev
```
Uygulama `http://localhost:5173` adresinde başlayacaktır.

### 4. Vercel Dağıtımı (Production Deploy)
Projenizi Vercel CLI veya Vercel Git entegrasyonu ile deploy etmek için:
```bash
vercel --prod
```
*Not: Vercel Dashboard üzerinden `AI_API_URL` ve `GATEWAY_CLIENT_API_KEY` değişkenlerini tanımlamayı unutmayın.*

---

## 🔗 Canlı Bağlantılar
* **Canlı Demo:** [https://ai-map-planning-and-info.vercel.app](https://ai-map-planning-and-info.vercel.app)
* **Python API Gateway:** [yucel-gumus/llm_api](https://github.com/yucel-gumus/llm_api)