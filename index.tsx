import {FunctionDeclaration, GoogleGenAI, Type} from '@google/genai';
import * as L from 'leaflet';

let map: L.Map;
let points: L.LatLngExpression[] = [];
let markers: L.Marker[] = [];
let lines: Array<{poly: L.Polyline; name: string; transport?: string; travelTime?: string}> = [];
let popUps: Array<{
  name: string;
  description: string;
  position: L.LatLng;
  popup: L.Popup;
  marker?: L.Marker;
  time?: string;
  duration?: string;
  sequence?: number;
}> = [];
let bounds: L.LatLngBounds;
let activeCardIndex = 0;
let isPlannerMode = false;
let dayPlanItinerary: Array<{
  name: string;
  description: string;
  position: L.LatLng;
  popup: L.Popup;
  marker?: L.Marker;
  time?: string;
  duration?: string;
  sequence?: number;
}> = [];

const generateButton = document.querySelector('#generate');
const resetButton = document.querySelector('#reset');
const cardContainer = document.querySelector(
  '#card-container',
) as HTMLDivElement;
const carouselIndicators = document.querySelector(
  '#carousel-indicators',
) as HTMLDivElement;
const prevCardButton = document.querySelector(
  '#prev-card',
) as HTMLButtonElement;
const nextCardButton = document.querySelector(
  '#next-card',
) as HTMLButtonElement;
const cardCarousel = document.querySelector('.card-carousel') as HTMLDivElement;
const plannerModeToggle = document.querySelector(
  '#planner-mode-toggle',
) as HTMLInputElement;
const timelineContainer = document.querySelector(
  '#timeline-container',
) as HTMLDivElement;
const timeline = document.querySelector('#timeline') as HTMLDivElement;
const closeTimelineButton = document.querySelector(
  '#close-timeline',
) as HTMLButtonElement;
const exportPlanButton = document.querySelector(
  '#export-plan',
) as HTMLButtonElement;
const mapContainer = document.querySelector('#map-container');
const timelineToggle = document.querySelector('#timeline-toggle');
const mapOverlay = document.querySelector('#map-overlay');
const loadingOverlay = document.querySelector('#loading-overlay');
const errorMessage = document.querySelector('#error-message');
const helpButton = document.querySelector('#help-button');
const helpModal = document.querySelector('#help-modal');
const helpCloseButton = document.querySelector('#help-close');

async function initMap() {
  bounds = L.latLngBounds([]);

  map = L.map('map', {
    center: [39.9334, 32.8597],
    zoom: 6,
    zoomControl: false,
    maxZoom: 10,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '',
    maxZoom: 10,
  }).addTo(map);
}

initMap();

const locationFunctionDeclaration: FunctionDeclaration = {
  name: 'location',
  parameters: {
    type: Type.OBJECT,
    description: 'Geographic coordinates of a location.',
    properties: {
      name: {
        type: Type.STRING,
        description: 'Name of the location.',
      },
      description: {
        type: Type.STRING,
        description:
          'Description of the location: why is it relevant, details to know.',
      },
      lat: {
        type: Type.STRING,
        description: 'Latitude of the location.',
      },
      lng: {
        type: Type.STRING,
        description: 'Longitude of the location.',
      },
      time: {
        type: Type.STRING,
        description:
          'Time of day to visit this location (e.g., "09:00", "14:30").',
      },
      duration: {
        type: Type.STRING,
        description:
          'Suggested duration of stay at this location (e.g., "1 hour", "45 minutes").',
      },
      sequence: {
        type: Type.NUMBER,
        description: 'Order in the day itinerary (1 = first stop of the day).',
      },
    },
    required: ['name', 'description', 'lat', 'lng'],
  },
};

const lineFunctionDeclaration: FunctionDeclaration = {
  name: 'line',
  parameters: {
    type: Type.OBJECT,
    description: 'Connection between a start location and an end location.',
    properties: {
      name: {
        type: Type.STRING,
        description: 'Name of the route or connection',
      },
      start: {
        type: Type.OBJECT,
        description: 'Start location of the route',
        properties: {
          lat: {
            type: Type.STRING,
            description: 'Latitude of the start location.',
          },
          lng: {
            type: Type.STRING,
            description: 'Longitude of the start location.',
          },
        },
      },
      end: {
        type: Type.OBJECT,
        description: 'End location of the route',
        properties: {
          lat: {
            type: Type.STRING,
            description: 'Latitude of the end location.',
          },
          lng: {
            type: Type.STRING,
            description: 'Longitude of the end location.',
          },
        },
      },
      transport: {
        type: Type.STRING,
        description:
          'Mode of transportation between locations (e.g., "walking", "driving", "public transit").',
      },
      travelTime: {
        type: Type.STRING,
        description:
          'Estimated travel time between locations (e.g., "15 minutes", "1 hour").',
      },
    },
    required: ['name', 'start', 'end'],
  },
};

const systemInstructions = `## İnteraktif Harita Gezgini için Sistem Talimatları

**Model Kişiliği:** Sen haritalar aracılığıyla görsel bilgi sağlayan bilgili, coğrafi farkındalığa sahip bir asistansın.
Temel amacın, konum ile ilgili herhangi bir sorguyu harita tabanlı görselleştirmeler kullanarak kapsamlı bir şekilde yanıtlamaktır.
Gerçek veya kurgusal, geçmiş, şimdiki veya gelecekteki hemen hemen her yer hakkında bilgi işleyebilirsin.

**Temel Yetenekler:**

1. **Coğrafi Bilgi:** Şunlar hakkında kapsamlı bilgiye sahipsin:
   * Küresel konumlar, simge yapılar ve turistik yerler
   * Tarihi siteler ve önemi
   * Doğal harikalar ve coğrafya
   * Kültürel ilgi noktaları
   * Seyahat rotaları ve ulaşım seçenekleri

2. **İki İşletim Modu:**

   **A. Genel Gezgin Modu** (DAY_PLANNER_MODE false olduğunda varsayılan):
   * Herhangi bir sorguya ilgili coğrafi konumları belirleyerek yanıt ver
   * Sorgu ile ilgili birden fazla ilgi noktası göster
   * Her konum için zengin açıklamalar sağla
   * İlgili konumları uygun yollarla bağla
   * Zamanlama yerine bilgi aktarımına odaklan

   **B. Günlük Planlayıcı Modu** (DAY_PLANNER_MODE true olduğunda):
   * Şunları içeren detaylı günlük programlar oluştur:
     * Gün boyunca ziyaret edilecek mantıklı bir konum dizisi (genellikle 4-6 ana durak)
     * Her konum ziyareti için belirli saatler ve gerçekçi süreler
     * Konumlar arası uygun ulaşım yöntemleri ile seyahat rotaları
     * Seyahat süresi, yemek molaları ve ziyaret sürelerini dikkate alan dengeli program
     * Her konum 'time' (örn. "09:00") ve 'duration' özelliği içermeli
     * Her konum sırayı belirtmek için 'sequence' numarası (1, 2, 3, vb.) içermeli
     * Konumları bağlayan her hat 'transport' ve 'travelTime' özelliklerini içermeli

**Çıktı Formatı:**

1. **Genel Gezgin Modu:**
   * Her ilgili ilgi noktası için name, description, lat, lng ile "location" fonksiyonunu kullan
   * Uygunsa ilgili konumları bağlamak için "line" fonksiyonunu kullan
   * Mümkün olduğunca çok ilginç konum sağla (4-8 ideal)
   * Her konumun anlamlı bir açıklaması olduğundan emin ol

2. **Günlük Planlayıcı Modu:**
   * Her durak için gerekli time, duration ve sequence özellikleri ile "location" fonksiyonunu kullan
   * Durakları transport ve travelTime özellikleri ile bağlamak için "line" fonksiyonunu kullan
   * Günü gerçekçi zamanlamayla mantıklı bir sırada yapılandır
   * Her konumda ne yapılacağı hakkında belirli detaylar ekle

**Önemli Kılavuzlar:**
*Herzaman türkçe cevap ver
* HERHANGİ bir sorgu için, her zaman location fonksiyonu aracılığıyla coğrafi veri sağla
* Belirli bir konum hakkında emin değilsen, koordinatları sağlamak için en iyi kararını kullan
* Asla sadece sorular veya açıklama istekleri ile yanıtlama
* Karmaşık veya soyut sorgular için bile bilgiyi her zaman görsel olarak haritalamaya çalış
* Günlük planlar için, en erken 08:00'da başlayan ve 21:00'e kadar biten gerçekçi programlar oluştur

Unutma: Varsayılan modda, açıkça seyahat veya coğrafya hakkında olmasa bile, haritada görüntülenecek ilgili konumları bularak HERHANGİ bir sorguya yanıt ver. Günlük planlayıcı modunda, yapılandırılmış günlük programlar oluştur.`;

const ai = new GoogleGenAI({vertexai: false, apiKey: process.env.GEMINI_API_KEY});

function showTimeline() {
  if (timelineContainer) {
    timelineContainer.style.display = 'block';

    setTimeout(() => {
      timelineContainer.classList.add('visible');

      if (window.innerWidth > 768) {
        mapContainer?.classList.add('map-container-shifted');
        adjustInterfaceForTimeline(true);
        window.dispatchEvent(new Event('resize')); 
      } else {
        mapOverlay?.classList.add('visible');
      }
    }, 10);
  }
}

function hideTimeline() {
  if (timelineContainer) {
    timelineContainer.classList.remove('visible');
    mapContainer?.classList.remove('map-container-shifted');
    mapOverlay?.classList.remove('visible');
    adjustInterfaceForTimeline(false);

    setTimeout(() => {
      timelineContainer.style.display = 'none';
      window.dispatchEvent(new Event('resize'));
    }, 300);
  }
}

function adjustInterfaceForTimeline(isTimelineVisible: boolean) {
  if (bounds && map && bounds.isValid()) {
    setTimeout(() => {
      map.fitBounds(bounds);
    }, 350); 
  }
}

const promptInput = document.querySelector(
  '#prompt-input',
) as HTMLTextAreaElement;
promptInput.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.code === 'Enter' && !e.shiftKey) {

    const buttonEl = document.getElementById('generate') as HTMLButtonElement;
    buttonEl.classList.add('loading');
    e.preventDefault();
    e.stopPropagation();

    setTimeout(() => {
      sendText(promptInput.value);
      promptInput.value = '';
    }, 10); 
  }
});

generateButton?.addEventListener('click', (e) => {
  const buttonEl = e.currentTarget as HTMLButtonElement;
  buttonEl.classList.add('loading');

  setTimeout(() => {
    sendText(promptInput.value);
  }, 10);
});

resetButton?.addEventListener('click', (e) => {
  restart();
});

if (prevCardButton) {
  prevCardButton.addEventListener('click', () => {
    navigateCards(-1);
  });
}

if (nextCardButton) {
  nextCardButton.addEventListener('click', () => {
    navigateCards(1);
  });
}

if (plannerModeToggle) {
  plannerModeToggle.addEventListener('change', () => {
    isPlannerMode = plannerModeToggle.checked;
    promptInput.placeholder = isPlannerMode
      ? "Günlük plan oluştur... (örn.'İstanbul'da bir gün')"
      : 'Yerler, tarih, etkinlikler keşfedin veya herhangi bir konum hakkında sorun...';

    if (!isPlannerMode && timelineContainer) {
      hideTimeline();
    }
  });
}

if (closeTimelineButton) {
  closeTimelineButton.addEventListener('click', () => {
    hideTimeline();
  });
}

if (timelineToggle) {
  timelineToggle.addEventListener('click', () => {
    showTimeline();
  });
}

if (mapOverlay) {
  mapOverlay.addEventListener('click', () => {
    hideTimeline();
  });
}

if (exportPlanButton) {
  exportPlanButton.addEventListener('click', () => {
    exportDayPlan();
  });
}

if (helpButton) {
  helpButton.addEventListener('click', () => {
    showHelpModal();
  });
}

if (helpCloseButton) {
  helpCloseButton.addEventListener('click', () => {
    hideHelpModal();
  });
}

if (helpModal) {
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      hideHelpModal();
    }
  });
}

function restart() {
  points = [];
  bounds = L.latLngBounds([]);
  dayPlanItinerary = [];

  markers.forEach((marker) => marker.remove());
  markers = [];

  lines.forEach((line) => {
    line.poly.remove();
  });
  lines = [];

  popUps.forEach((popup) => {
    popup.popup.remove();
  });
  popUps = [];

  if (cardContainer) cardContainer.innerHTML = '';
  if (carouselIndicators) carouselIndicators.innerHTML = '';
  if (cardCarousel) cardCarousel.style.display = 'none';
  if (timeline) timeline.innerHTML = '';
  if (timelineContainer) hideTimeline();
}

async function sendText(prompt: string) {
  if (errorMessage) errorMessage.innerHTML = '';
  loadingOverlay?.classList.add('visible');
  restart();
  const buttonEl = document.getElementById('generate') as HTMLButtonElement;

  try {
    let finalPrompt = prompt;
    if (isPlannerMode) {
      finalPrompt = prompt + ' day trip';
    }

    const updatedInstructions = isPlannerMode
      ? systemInstructions.replace('DAY_PLANNER_MODE', 'true')
      : systemInstructions.replace('DAY_PLANNER_MODE', 'false');

    const response = await ai.models.generateContentStream({
      model: 'gemini-2.0-flash-exp',
      contents: finalPrompt,
      config: {
        systemInstruction: updatedInstructions,
        temperature: 1,
        tools: [
          {
            functionDeclarations: [
              locationFunctionDeclaration,
              lineFunctionDeclaration,
            ],
          },
        ],
      },
    });

    let text = '';
    let results = false;
    for await (const chunk of response) {
      const fns = chunk.functionCalls ?? [];
      for (const fn of fns) {
        if (fn.name === 'location') {
          await setPin(fn.args);
          results = true;
        }
        if (fn.name === 'line') {
          await setLeg(fn.args);
          results = true;
        }
      }

      if (
        chunk.candidates &&
        chunk.candidates.length > 0 &&
        chunk.candidates[0].content &&
        chunk.candidates[0].content.parts
      ) {
        chunk.candidates[0].content.parts.forEach((part) => {
          if (part.text) text += part.text;
        });
      } else if (chunk.text) {
        text += chunk.text;
      }
    }

    if (!results) {
      throw new Error(
        'Herhangi bir sonuç üretilemedi. Tekrar deneyin veya farklı bir sorgu deneyin.',
      );
    }

    if (isPlannerMode && dayPlanItinerary.length > 0) {
      dayPlanItinerary.sort(
        (a, b) =>
          (a.sequence || Infinity) - (b.sequence || Infinity) ||
          (a.time || '').localeCompare(b.time || ''),
      );
      createTimeline();
      showTimeline();
    }

    createLocationCards();
  } catch (e) {
    if (errorMessage) errorMessage.innerHTML = (e as Error).message;
    console.error('Error generating content:', e);
  } finally {
    buttonEl.classList.remove('loading');
    loadingOverlay?.classList.remove('visible');
  }
}

async function setPin(args: any) {
  const lat = Number(args.lat);
  const lng = Number(args.lng);
  const latlng = L.latLng(lat, lng);
  points.push(latlng);
  bounds.extend(latlng);

  const marker = L.marker(latlng, {
    title: args.name,
  }).addTo(map);
  markers.push(marker);
  map.panTo(latlng);
  if (bounds.isValid()) {
    map.fitBounds(bounds);
  }

  let timeInfo = '';
  if (args.time) {
    timeInfo = `<div style="margin-top: 4px; font-size: 12px; color: #2196F3;">
                  <i class="fas fa-clock"></i> ${args.time}
                  ${args.duration ? ` • ${args.duration}` : ''}
                </div>`;
  }
  const popupContent = `<div class="popup-bubble"><b>${args.name}</b><br/>${args.description}${timeInfo}</div>`;

  const popup = L.popup({
    className: 'popup-container',
    closeButton: false,
    closeOnClick: false,
  }).setContent(popupContent);

  marker.bindPopup(popup);
  
  if (!isPlannerMode) {
    marker.openPopup();
  }

  const locationInfo = {
    name: args.name,
    description: args.description,
    position: latlng,
    popup,
    marker,
    time: args.time,
    duration: args.duration,
    sequence: args.sequence,
  };

  popUps.push(locationInfo);

  if (isPlannerMode && args.time) {
    dayPlanItinerary.push(locationInfo);
  }
}

async function setLeg(args: any) {
  const startLat = Number(args.start.lat);
  const startLng = Number(args.start.lng);
  const endLat = Number(args.end.lat);
  const endLng = Number(args.end.lng);
  
  const start = L.latLng(startLat, startLng);
  const end = L.latLng(endLat, endLng);
  
  points.push(start);
  points.push(end);
  bounds.extend(start);
  bounds.extend(end);
  if (bounds.isValid()) {
    map.fitBounds(bounds);
  }

  const polylineOptions: L.PolylineOptions = {
    color: isPlannerMode ? '#2196F3' : '#CC0099',
    opacity: 1.0,
    weight: isPlannerMode ? 4 : 3,
  };

  if (isPlannerMode) {
    polylineOptions.dashArray = '10, 10';
  }

  const poly = L.polyline([start, end], polylineOptions).addTo(map);

  lines.push({
    poly,
    name: args.name,
    transport: args.transport,
    travelTime: args.travelTime,
  });
}

function createTimeline() {
  if (!timeline || dayPlanItinerary.length === 0) return;
  timeline.innerHTML = '';

  dayPlanItinerary.forEach((item, index) => {
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';
    const timeDisplay = item.time || 'Esnek';

    timelineItem.innerHTML = `
      <div class="timeline-time">${timeDisplay}</div>
      <div class="timeline-connector">
        <div class="timeline-dot"></div>
        <div class="timeline-line"></div>
      </div>
      <div class="timeline-content" data-index="${index}">
        <div class="timeline-title">${item.name}</div>
        <div class="timeline-description">${item.description}</div>
        ${item.duration ? `<div class="timeline-duration">${item.duration}</div>` : ''}
      </div>
    `;

    const timelineContent = timelineItem.querySelector('.timeline-content');
    if (timelineContent) {
      timelineContent.addEventListener('click', () => {
        const popupIndex = popUps.findIndex((p) => p.name === item.name);
        if (popupIndex !== -1) {
          highlightCard(popupIndex);
          map.panTo(popUps[popupIndex].position);
        }
      });
    }
    timeline.appendChild(timelineItem);
  });

  if (lines.length > 0 && isPlannerMode) {
    const timelineItems = timeline.querySelectorAll('.timeline-item');
    for (let i = 0; i < timelineItems.length - 1; i++) {
      const currentItem = dayPlanItinerary[i];
      const nextItem = dayPlanItinerary[i + 1];
      const connectingLine = lines.find(
        (line) =>
          line.name.includes(currentItem.name) ||
          line.name.includes(nextItem.name),
      );

      if (
        connectingLine &&
        (connectingLine.transport || connectingLine.travelTime)
      ) {
        const transportItem = document.createElement('div');
        transportItem.className = 'timeline-item transport-item';
        transportItem.innerHTML = `
          <div class="timeline-time"></div>
          <div class="timeline-connector">
            <div class="timeline-dot" style="background-color: #999;"></div>
            <div class="timeline-line"></div>
          </div>
          <div class="timeline-content transport">
            <div class="timeline-title">
              <i class="fas fa-${getTransportIcon(connectingLine.transport || 'travel')}"></i>
              ${connectingLine.transport || 'Seyahat'}
            </div>
            <div class="timeline-description">${connectingLine.name}</div>
            ${connectingLine.travelTime ? `<div class="timeline-duration">${connectingLine.travelTime}</div>` : ''}
          </div>
        `;
        timelineItems[i].after(transportItem);
      }
    }
  }
}

function getTransportIcon(transportType: string): string {
  const type = (transportType || '').toLowerCase();
  if (type.includes('walk') || type.includes('yürü') || type.includes('yaya')) {
    return 'walking';
  }
  if (type.includes('car') || type.includes('driv') || type.includes('araba') || type.includes('otomobil')) {
    return 'car-side';
  }
  if (
    type.includes('bus') ||
    type.includes('transit') ||
    type.includes('public') ||
    type.includes('otobüs') ||
    type.includes('toplu')
  ) {
    return 'bus-alt';
  }
  if (
    type.includes('train') ||
    type.includes('subway') ||
    type.includes('metro') ||
    type.includes('tren') ||
    type.includes('metro')
  ) {
    return 'train';
  }
  if (type.includes('bike') || type.includes('cycl') || type.includes('bisiklet')) {
    return 'bicycle';
  }
  if (type.includes('taxi') || type.includes('cab') || type.includes('taksi')) {
    return 'taxi';
  }
  if (type.includes('boat') || type.includes('ferry') || type.includes('gemi') || type.includes('vapur')) {
    return 'ship';
  }
  if (type.includes('plane') || type.includes('fly') || type.includes('uçak')) {
    return 'plane-departure';
  }
  {
    return 'route';
  } 
}

function getPlaceholderImage(locationName: string): string {
  let hash = 0;
  for (let i = 0; i < locationName.length; i++) {
    hash = locationName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  const saturation = 60 + (hash % 30);
  const lightness = 50 + (hash % 20);
  const letter = locationName.charAt(0).toUpperCase() || '?';

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180">
      <rect width="300" height="180" fill="hsl(${hue}, ${saturation}%, ${lightness}%)" />
      <text x="150" y="95" font-family="Arial, sans-serif" font-size="72" fill="white" text-anchor="middle" dominant-baseline="middle">${letter}</text>
    </svg>
  `)}`;
}

function createLocationCards() {
  if (!cardContainer || !carouselIndicators || popUps.length === 0) return;
  cardContainer.innerHTML = '';
  carouselIndicators.innerHTML = '';
  cardCarousel.style.display = 'block';

  popUps.forEach((location, index) => {
    const card = document.createElement('div');
    card.className = 'location-card';
    if (isPlannerMode) card.classList.add('day-planner-card');
    if (index === 0) card.classList.add('card-active');

    const imageUrl = getPlaceholderImage(location.name);
    let cardContent = `<div class="card-image" style="background-image: url('${imageUrl}')"></div>`;

    if (isPlannerMode) {
      if (location.sequence) {
        cardContent += `<div class="card-sequence-badge">${location.sequence}</div>`;
      }
      if (location.time) {
        cardContent += `<div class="card-time-badge">${location.time}</div>`;
      }
    }

    cardContent += `
      <div class="card-content">
        <h3 class="card-title">${location.name}</h3>
        <p class="card-description">${location.description}</p>
        ${isPlannerMode && location.duration ? `<div class="card-duration">${location.duration}</div>` : ''}
        <div class="card-coordinates">
          ${location.position.lat.toFixed(5)}, ${location.position.lng.toFixed(5)}
        </div>
      </div>
    `;
    card.innerHTML = cardContent;

    card.addEventListener('click', () => {
      highlightCard(index);
      map.panTo(location.position);
      if (isPlannerMode && timeline) highlightTimelineItem(index);
    });

    cardContainer.appendChild(card);

    const dot = document.createElement('div');
    dot.className = 'carousel-dot';
    if (index === 0) dot.classList.add('active');
    carouselIndicators.appendChild(dot);
  });

  if (cardCarousel && popUps.length > 0) {
    cardCarousel.style.display = 'block';
  }
}

function highlightCard(index: number) {
  activeCardIndex = index;
  const cards = cardContainer?.querySelectorAll('.location-card');
  if (!cards) return;

  cards.forEach((card) => card.classList.remove('card-active'));
  if (cards[index]) {
    cards[index].classList.add('card-active');
    const cardElement = cards[index] as HTMLElement;
    const cardWidth = cardElement.offsetWidth;
    const containerWidth = cardContainer.offsetWidth;
    const scrollPosition =
      cardElement.offsetLeft - containerWidth / 2 + cardWidth / 2;
    cardContainer.scrollTo({left: scrollPosition, behavior: 'smooth'});
  }

  const dots = carouselIndicators?.querySelectorAll('.carousel-dot');
  if (dots) {
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }

  markers.forEach((marker) => {
    marker.closePopup();
  });
  
  if (markers[index]) {
    markers[index].openPopup();
  }

  if (isPlannerMode) highlightTimelineItem(index);
}

function highlightTimelineItem(cardIndex: number) {
  if (!timeline) return;
  const timelineItems = timeline.querySelectorAll(
    '.timeline-content:not(.transport)',
  );
  timelineItems.forEach((item) => item.classList.remove('active'));

  const location = popUps[cardIndex];
  for (const item of timelineItems) {
    const title = item.querySelector('.timeline-title');
    if (title && title.textContent === location.name) {
      item.classList.add('active');
      item.scrollIntoView({behavior: 'smooth', block: 'nearest'});
      break;
    }
  }
}

function navigateCards(direction: number) {
  const newIndex = activeCardIndex + direction;
  if (newIndex >= 0 && newIndex < popUps.length) {
    highlightCard(newIndex);
    map.panTo(popUps[newIndex].position);
  }
}

function exportDayPlan() {
  if (!dayPlanItinerary.length) return;
  let content = '# Günlük Planınız\n\n';

  dayPlanItinerary.forEach((item, index) => {
    content += `## ${index + 1}. ${item.name}\n`;
    content += `Saat: ${item.time || 'Esnek'}\n`;
    if (item.duration) content += `Süre: ${item.duration}\n`;
    content += `\n${item.description}\n\n`;

    if (index < dayPlanItinerary.length - 1) {
      const nextItem = dayPlanItinerary[index + 1];
      const connectingLine = lines.find(
        (line) =>
          line.name.includes(item.name) || line.name.includes(nextItem.name),
      );
      if (connectingLine) {
        content += `### ${nextItem.name} için Seyahat\n`;
        content += `Yöntem: ${connectingLine.transport || 'Belirtilmemiş'}\n`;
                  if (connectingLine.travelTime) {
            content += `Süre: ${connectingLine.travelTime}\n`;
          }
        content += `\n`;
      }
    }
  });

  const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gunluk-plan.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function showHelpModal() {
  if (helpModal) {
    helpModal.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }
}

function hideHelpModal() {
  if (helpModal) {
    helpModal.classList.remove('visible');
    document.body.style.overflow = 'auto';
  }
}
