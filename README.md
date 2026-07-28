# 🗺️ AI Harita Planlama ve Bilgi (Interactive Travel Planner)

Doğal dilde arama, saatli seyahat planı ve **Google Maps Platform** üzerinde interaktif rota keşfi.

**Stack:** Vite + TypeScript + Google Maps JavaScript API · Vercel Serverless proxy · Python backend (Cloud Run)

---

## Öne çıkanlar

### Keşif modu
- Serbest metin sorgu → AI konumları + harita markerları
- **Google Places Photo** ile gerçek mekan görselleri (kart + InfoWindow)
- Kart üzerinde **360° Street View** butonu

### Günlük planlayıcı
- Gün / saat / süre / sıra (sequence) destekli itinerary
- Gün içi TSP + coğrafi küme optimizasyonu
- **Google Directions** ile gerçek yol geometrisi, süre ve mesafe etiketleri
- Plan dışa aktarma (HTML/print)

---

## Mimari

```
Browser (Maps JS + Places/Directions client)
    │
    ├─ POST /api/generate-map  ──► Vercel Function ──► Cloud Run /api/generate-map (Gemini tools)
    │
    └─ GET  /api/places/photo  ──► Vercel Function ──► Cloud Run /api/places/photo
                                      │                    (Places Photo → Street View → Static)
                                      └─ mode=image → image stream (API key tarayıcıya sızmaz)
```

Güvenlik:
- `GATEWAY_CLIENT_API_KEY` yalnızca sunucu tarafında (Vercel env)
- `VITE_GOOGLE_MAPS_API_KEY` tarayıcıda (Maps JS için zorunlu) — **HTTP referrer kısıtı** ile koruyun
- Places fotoğrafları tercihen `/api/places/photo?mode=image` proxy üzerinden

---

## Kurulum

```bash
npm install
cp .env.example .env   # anahtarları doldurun
npm run dev            # http://localhost:5173
```

### `.env`

```env
AI_API_URL=https://python-backend-....run.app
GATEWAY_CLIENT_API_KEY=...
VITE_GOOGLE_MAPS_API_KEY=...
```

### Google Cloud’da açılması gereken API’ler

| API | Kullanım |
|-----|----------|
| Maps JavaScript API | Harita, marker, InfoWindow |
| Directions API | Gerçek yol rotaları |
| Places API | Mekan fotoğrafları / arama |
| Street View Static API | Backend fallback görsel |
| Maps Static API | Uydu fallback |
| Geocoding API | Backend adres → koordinat |

Browser key: **HTTP referrer** (ör. `https://ai-map-planning-and-info.vercel.app/*`, `http://localhost:5173/*`)  
Server key (Cloud Run): **IP / unrestricted** veya Cloud Run SA + kısıtlı key

---

## Deploy

### Frontend (Vercel)
```bash
vercel --prod
```
Env: `AI_API_URL`, `GATEWAY_CLIENT_API_KEY`, `VITE_GOOGLE_MAPS_API_KEY`

### Backend (Cloud Run)
`python_backend` reposundaki `env.yaml` içinde `GOOGLE_MAPS_API_KEY` tanımlı olmalı.  
Yeni Places photo bias + `/api/places/details` için backend redeploy gerekir.

---

## Repo bağlantıları

| Repo | Rol |
|------|-----|
| `ai_map_planning_and_info` | Bu frontend |
| `pages-bff` | Paylaşımlı Next.js BFF (diğer uygulamalar) |
| `python_backend` | Gemini gateway + Google Maps REST |

Canlı: https://ai-map-planning-and-info.vercel.app
