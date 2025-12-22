/**
 * Export Utility Functions
 * @module utils/export
 */

import type { Location, Line } from '../types';

/**
 * Metni dosya olarak indirir
 * @param content - Dosya içeriği
 * @param filename - Dosya adı
 * @param mimeType - MIME tipi
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
 * Günlük plan içeriği oluşturur
 * @param itinerary - Günlük plan listesi
 * @param lines - Bağlantı çizgileri
 * @returns Formatlanmış markdown içeriği
 */
export function generatePlanContent(
    itinerary: Location[],
    lines: Line[]
): string {
    if (itinerary.length === 0) {
        return '# Günlük Planınız\n\nHenüz bir plan oluşturulmadı.';
    }

    let content = '# Günlük Planınız\n\n';

    itinerary.forEach((item, index) => {
        content += `## ${index + 1}. ${item.name}\n`;
        content += `Saat: ${item.time || 'Esnek'}\n`;

        if (item.duration) {
            content += `Süre: ${item.duration}\n`;
        }

        content += `\n${item.description}\n\n`;

        // Sonraki lokasyona seyahat bilgisi
        if (index < itinerary.length - 1) {
            const nextItem = itinerary[index + 1];
            const connectingLine = lines.find(
                (line) =>
                    line.name.includes(item.name) || line.name.includes(nextItem.name)
            );

            if (connectingLine) {
                content += `### ${nextItem.name} için Seyahat\n`;
                content += `Yöntem: ${connectingLine.transport || 'Belirtilmemiş'}\n`;

                if (connectingLine.travelTime) {
                    content += `Süre: ${connectingLine.travelTime}\n`;
                }

                content += '\n';
            }
        }
    });

    return content;
}

/**
 * Günlük planı text dosyası olarak indirir
 * @param itinerary - Günlük plan listesi
 * @param lines - Bağlantı çizgileri
 */
export function exportDayPlan(itinerary: Location[], lines: Line[]): void {
    if (itinerary.length === 0) return;

    const content = generatePlanContent(itinerary, lines);
    downloadAsFile(content, 'gunluk-plan.txt');
}

/**
 * JSON olarak export eder
 * @param data - Export edilecek data
 * @param filename - Dosya adı
 */
export function exportAsJson<T>(data: T, filename: string): void {
    const content = JSON.stringify(data, null, 2);
    downloadAsFile(content, filename, 'application/json');
}
