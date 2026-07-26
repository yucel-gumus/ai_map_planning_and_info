/**
 * Export Utility Functions (High-End PDF & Printable Travel Brochure Generator)
 * @module utils/export
 */

import type { Location, Line } from '../types';
import { getTransportIcon } from '../constants/map.constants';

/**
 * Downloads plain text file
 */
export function downloadAsFile(
    content: string,
    filename: string,
    mimeType: string = 'text/plain;charset=utf-8'
): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

/**
 * Generates a modern HTML printable brochure document for PDF export
 */
export function generatePrintableHtml(itinerary: Location[], lines: Line[]): string {
    const title = itinerary[0] ? `${itinerary[0].name.split(' ')[0]} Seyahat ve Rota Rehberi` : 'Görsel Seyahat ve Rota Rehberi';
    const totalDays = Array.from(new Set(itinerary.map(i => i.day || 1))).length;
    const dateStr = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    // Group itinerary items by day
    const dayGroups = new Map<number, Location[]>();
    itinerary.forEach(item => {
        const day = item.day || 1;
        if (!dayGroups.has(day)) dayGroups.set(day, []);
        dayGroups.get(day)!.push(item);
    });

    let daysHtml = '';
    dayGroups.forEach((items, dayNum) => {
        daysHtml += `
        <div class="day-section">
          <div class="day-title"><i class="fas fa-calendar-day"></i> ${dayNum}. GÜN PROGRAMI</div>
          <div class="card-grid">
        `;

        items.forEach((item, idx) => {
            const imgStyle = item.imageUrl ? `background-image: url('${item.imageUrl}')` : 'background-color: #E28B7B';
            daysHtml += `
            <div class="pdf-card">
              <div class="pdf-card-img" style="${imgStyle}"></div>
              <div class="pdf-card-body">
                <div class="pdf-card-title">${item.sequence ? `${item.sequence}. ` : ''}${item.name}</div>
                <div class="pdf-card-meta">
                  ${item.time ? `<span><i class="fas fa-clock"></i> ${item.time}</span>` : ''}
                  ${item.duration ? `<span><i class="fas fa-hourglass-half"></i> ${item.duration}</span>` : ''}
                </div>
                <div class="pdf-card-desc">${item.description}</div>
                <div class="pdf-card-coords"><i class="fas fa-location-dot"></i> ${item.position.lat.toFixed(4)}, ${item.position.lng.toFixed(4)}</div>
              </div>
            </div>
            `;

            // Transport connection to next item in same day
            if (idx < items.length - 1) {
                const nextItem = items[idx + 1];
                const connectingLine = lines.find(
                    l => l.name.includes(item.name) || l.name.includes(nextItem.name)
                );
                if (connectingLine && (connectingLine.transport || connectingLine.travelTime)) {
                    const icon = getTransportIcon(connectingLine.transport || 'travel');
                    daysHtml += `
                    <div class="transport-bar">
                      <i class="fas fa-${icon}"></i>
                      <span>${connectingLine.transport || 'Seyahat'}: ${connectingLine.name}</span>
                      ${connectingLine.travelTime ? `<strong>(${connectingLine.travelTime})</strong>` : ''}
                    </div>
                    `;
                }
            }
        });

        daysHtml += `
          </div>
        </div>
        `;
    });

    return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background-color: #F8ECE0; color: #193630; padding: 40px; }
    
    .guide-header {
      background: linear-gradient(135deg, #E28B7B, #4F9D88);
      padding: 32px;
      border-radius: 20px;
      margin-bottom: 32px;
      color: #193630;
      box-shadow: 0 10px 30px rgba(45, 25, 20, 0.2);
      border: 3px solid #193630;
    }

    .guide-header h1 { font-size: 32px; font-weight: 800; margin-bottom: 8px; }
    .guide-header p { font-size: 15px; opacity: 0.95; font-weight: 600; }

    .stats-row {
      display: flex;
      gap: 12px;
      margin-top: 18px;
    }

    .stat-badge {
      background: #193630;
      color: #F5E1C8;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .day-section { margin-bottom: 40px; page-break-inside: avoid; }
    .day-title {
      font-size: 20px;
      font-weight: 800;
      background: #193630;
      color: #F5E1C8;
      display: inline-block;
      padding: 8px 20px;
      border-radius: 14px;
      margin-bottom: 20px;
    }

    .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    
    .pdf-card {
      background: #FFFFFF;
      border: 2px solid #4F9D88;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(0,0,0,0.06);
      display: flex;
      flex-direction: column;
    }

    .pdf-card-img {
      height: 170px;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      border-bottom: 2px solid #4F9D88;
    }

    .pdf-card-body { padding: 18px; flex: 1; display: flex; flex-direction: column; }
    .pdf-card-title { font-size: 17px; font-weight: 800; color: #193630; margin-bottom: 6px; }
    .pdf-card-meta { font-size: 12px; font-weight: 800; color: #193630; margin-bottom: 10px; display: flex; gap: 12px; background: rgba(79,157,136,0.3); padding: 4px 10px; border-radius: 8px; width: fit-content; }
    .pdf-card-desc { font-size: 13px; line-height: 1.5; color: #3B211C; margin-bottom: 12px; flex: 1; }
    .pdf-card-coords { font-size: 11px; font-weight: 700; color: #193630; opacity: 0.8; }

    .transport-bar {
      grid-column: 1 / -1;
      background: rgba(226, 139, 123, 0.25);
      border: 2px dashed #E28B7B;
      padding: 10px 18px;
      border-radius: 12px;
      margin: 4px 0 12px 0;
      font-size: 13px;
      font-weight: 700;
      color: #193630;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .no-print-bar {
      position: fixed;
      top: 20px;
      right: 20px;
      display: flex;
      gap: 12px;
      z-index: 1000;
    }

    .btn-print {
      background: #193630;
      color: #F5E1C8;
      border: 2px solid #F5E1C8;
      padding: 12px 24px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: transform 0.2s;
    }

    .btn-print:hover { transform: scale(1.05); }

    @media print {
      body { padding: 0; background: #fff; }
      .no-print-bar { display: none !important; }
      .pdf-card { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <button class="btn-print" onclick="window.print()"><i class="fas fa-file-pdf"></i> PDF Olarak Kaydet / Yazdır</button>
  </div>

  <div class="guide-header">
    <h1>${title}</h1>
    <p>Yapay zekâ tarafından hazırlanan özel gezi ve durak rehberiniz.</p>
    <div class="stats-row">
      <span class="stat-badge"><i class="fas fa-calendar"></i> ${totalDays} Günlük Rota</span>
      <span class="stat-badge"><i class="fas fa-map-pin"></i> ${itinerary.length} Harika Mekan</span>
      <span class="stat-badge"><i class="fas fa-clock"></i> ${dateStr}</span>
    </div>
  </div>

  ${daysHtml}
</body>
</html>`;
}

/**
 * Open interactive PDF Printable Brochure view in new tab & trigger PDF export
 */
export function exportDayPlan(itinerary: Location[], lines: Line[]): void {
    if (itinerary.length === 0) return;

    const htmlContent = generatePrintableHtml(itinerary, lines);
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Auto trigger print after render
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
            }, 400);
        };
    }
}
