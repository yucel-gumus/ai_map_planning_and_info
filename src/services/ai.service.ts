import type { LocationArgs, LineArgs, GenerateResult } from '../types';
import { SYSTEM_INSTRUCTIONS, API_URL } from '../constants';

interface FunctionCallHandler {
    onLocation: (args: LocationArgs) => Promise<void>;
    onLine: (args: LineArgs) => Promise<void>;
}

export interface GenerateOptions {
    isPlannerMode: boolean;
    excludedLocations?: string[];
}

interface ApiResponse {
    success: boolean;
    functionCalls?: Array<{
        name: string;
        args: Record<string, unknown>;
    }>;
    text?: string;
    error?: string;
}

export class AIService {
    private apiUrl: string;

    constructor(apiUrl: string = API_URL) {
        this.apiUrl = apiUrl;
    }

    private getSystemInstructions(isPlannerMode: boolean): string {
        return SYSTEM_INSTRUCTIONS.replace(
            'DAY_PLANNER_MODE',
            isPlannerMode ? 'true' : 'false'
        );
    }

    private preparePrompt(prompt: string, isPlannerMode: boolean, excludedLocations: string[] = []): string {
        let finalPrompt = prompt;

        if (isPlannerMode && !/günlük|gün/i.test(prompt)) {
            finalPrompt = `${prompt} seyahat planı`;
        }

        if (excludedLocations && excludedLocations.length > 0) {
            finalPrompt += `\n\n[ÖNEMLİ KISITLAMA] Daha önce gidilen veya kesinlikle plana eklenmesi istenmeyen mekanlar: ${excludedLocations.join(', ')}. Bu mekanları kesinlikle plana veya haritaya DAHİL ETME. Bunların yerine alternatif harika yerler öner.`;
        }

        return finalPrompt;
    }

    async generateContent(
        prompt: string,
        options: boolean | GenerateOptions,
        handlers: FunctionCallHandler
    ): Promise<GenerateResult> {
        const isPlannerMode = typeof options === 'boolean' ? options : options.isPlannerMode;
        const excludedLocations = typeof options === 'object' && options.excludedLocations ? options.excludedLocations : [];

        const result: GenerateResult = {
            success: false,
            locations: [],
            lines: [],
        };

        try {
            const finalPrompt = this.preparePrompt(prompt, isPlannerMode, excludedLocations);
            const systemInstructions = this.getSystemInstructions(isPlannerMode);

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: finalPrompt,
                    systemInstructions: systemInstructions,
                    isPlannerMode: isPlannerMode,
                }),
            });

            if (!response.ok) {
                throw new Error(`API hatası: ${response.status} ${response.statusText}`);
            }

            const data: ApiResponse = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'API yanıtı başarısız');
            }

            let hasResults = false;

            if (data.functionCalls && data.functionCalls.length > 0) {
                for (const fn of data.functionCalls) {
                    if (fn.name === 'location') {
                        await handlers.onLocation(fn.args as unknown as LocationArgs);
                        hasResults = true;
                    }
                    if (fn.name === 'line') {
                        await handlers.onLine(fn.args as unknown as LineArgs);
                        hasResults = true;
                    }
                }
            }

            if (!hasResults) {
                throw new Error(
                    'Herhangi bir sonuç üretilemedi. Tekrar deneyin veya farklı bir sorgu deneyin.'
                );
            }

            result.success = true;
            result.textResponse = data.text;
            if (data.text && (data.text.includes('ideal') || data.text.includes('günlük') || data.text.includes('uyarı'))) {
                result.noticeMessage = data.text;
            }
        } catch (error) {
            result.success = false;
            result.error = error instanceof Error
                ? error.message
                : 'Beklenmeyen bir hata oluştu';
        }

        return result;
    }
}

let aiServiceInstance: AIService | null = null;

export function getAIService(apiUrl?: string): AIService {
    if (!aiServiceInstance) {
        aiServiceInstance = new AIService(apiUrl);
    }
    return aiServiceInstance;
}

export function resetAIService(): void {
    aiServiceInstance = null;
}
