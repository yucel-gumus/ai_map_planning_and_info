# 🗺️ AI Harita Planlama ve Bilgi (`ai_map_planning_and_info`)

Türkiye odaklı **interaktif harita** uygulaması: serbest metinle konum keşfi ve **günlük seyahat planı** modu (saatli timeline, ulaşım notları, dışa aktarma). Tüm harita/AI üretimi **Gemini Gateway** endpoint’i `POST /api/generate-map` üzerinden yapılır; istemciye API anahtarı verilmez.

**Canlı:** [ai-map-planning-and-info.vercel.app](https://ai-map-planning-and-info.vercel.app)  
**GitHub:** [yucel-gumus/ai_map_planning_and_info](https://github.com/yucel-gumus/ai_map_planning_and_info)

---

## Modlar

### 1. Genel keşif
- Kullanıcı doğal dilde arama yapar (“Kapadokya gezilecek yerler”)
- AI konum listesi döner; haritada marker + carousel kartlar
- Blur loading ve popup detayları

### 2. Günlük planlayıcı
- Toggle ile plan modu açılır
- AI saat sıralı program, konumlar arası süre/tür önerir
- Timeline görünümü ve metin dosyası olarak export

---

## Mimari

```
React + Vite + Leaflet
        │
        POST /api/generate-map  { prompt, mode, ... }
        │
        ├─► Vercel serverless (api/generate-map.ts)
        │         GATEWAY_CLIENT_API_KEY (server)
        │         └─► https://api.yucelgumus.dev/api/generate-map
        │
        └─► dev: vite proxy aynı path → gateway
```

`src/constants/ai.constants.ts` endpoint’i `VITE_API_BASE_URL` ile override edilebilir; boş bırakılırsa same-origin `/api/generate-map` kullanılır.

---

## Kurulum

```bash
git clone https://github.com/yucel-gumus/ai_map_planning_and_info.git
cd ai_map_planning_and_info
npm install
cp .env.example .env
```

**Sunucu tarafı (Vercel / lokal API route):**

```env
AI_API_URL=https://api.yucelgumus.dev
GATEWAY_CLIENT_API_KEY=your_plain_client_key
```

**İstemci (opsiyonel):**

```env
VITE_API_BASE_URL=   # boş = Vercel function
```

```bash
npm run dev
# http://localhost:5173
```

---

## Vercel production

- `api/generate-map.ts` gateway proxy
- `scripts/vercel_prod_deploy.py` — env senkron ve prod deploy yardımcısı
- **Asla** `VITE_GEMINI_API_KEY` ile anahtarı bundle’a koymayın (eski README anti-pattern)

---

## Örnek istekler

**Keşif:** “İstanbul'daki tarihi yerler”  
**Plan:** “İstanbul'da bir gün — sabah 09:00’dan başla”

Gateway yanıtı yapılandırılmış konum dizisi + plan adımları olarak parse edilir (şema gateway sürümüne bağlı).

---

## Teknoloji

| Bileşen | Sürüm / not |
|---------|-------------|
| TypeScript | ~5.7 |
| Vite | ^6 |
| Leaflet | Harita motoru |
| AI | Gemini via [llm_api](https://github.com/yucel-gumus/llm_api) |

---

## Proje yapısı

```
ai_map_planning_and_info/
├── src/
│   ├── components/     # Harita, arama, timeline UI
│   ├── constants/      # AI endpoint sabitleri
│   └── ...
├── api/
│   └── generate-map.ts # Vercel gateway proxy
├── vite.config.ts      # Dev proxy → AI_API_URL
└── vercel.json
```

---

## Sorun giderme

| Sorun | Kontrol |
|-------|---------|
| 403 | `GATEWAY_CLIENT_API_KEY` düz metin, base64 değil |
| Boş harita | Gateway log, geocoding |
| Lokal çalışmıyor | `AI_API_URL` ve gateway ayakta mı |

---

## Lisans

Apache-2.0

---

## İletişim

Geliştirici: [Yücel Gümüş](https://github.com/yucel-gumus)