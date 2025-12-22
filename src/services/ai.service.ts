import type { LocationArgs, LineArgs, GenerateResult } from '../types';
import { SYSTEM_INSTRUCTIONS, API_URL } from '../constants';

interface FunctionCallHandler {
    onLocation: (args: LocationArgs) => Promise<void>;
    onLine: (args: LineArgs) => Promise<void>;
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

    private preparePrompt(prompt: string, isPlannerMode: boolean): string {
        if (isPlannerMode) {
            return `${prompt} day trip`;
        }
        return prompt;
    }

    async generateContent(
        prompt: string,
        isPlannerMode: boolean,
        handlers: FunctionCallHandler
    ): Promise<GenerateResult> {
        const result: GenerateResult = {
            success: false,
            locations: [],
            lines: [],
        };

        try {
            const finalPrompt = this.preparePrompt(prompt, isPlannerMode);
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
