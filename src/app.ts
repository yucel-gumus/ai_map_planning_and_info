import type { LocationArgs, LineArgs } from './types';
import { initMapContainer } from './components/Map';
import { initSearchBar, showError, clearError } from './components/Search/SearchBar';
import { initModeToggle } from './components/Search/ModeToggle';
import { initTimeline, showTimelineWithContent } from './components/Timeline';
import { initCardCarousel, renderCards, clearCarousel, highlightCard } from './components/Cards';
import { initHelpModal } from './components/Modal';
import { clearMap, addLocation, addRoute } from './hooks/useMap';
import { getDayPlanItinerary, addToDayPlan, clearDayPlan, sortDayPlanItinerary } from './hooks/usePlanner';
import { resetTimeline } from './hooks/useTimeline';
import { getAIService } from './services/ai.service';

let isInitialized = false;

function restart(): void {
    clearMap();
    clearDayPlan();
    clearCarousel();
    resetTimeline();
}

async function handleSearch(query: string, plannerMode: boolean): Promise<void> {
    clearError();
    restart();

    const aiService = getAIService();

    const result = await aiService.generateContent(
        query,
        plannerMode,
        {
            onLocation: async (args: LocationArgs) => {
                const location = await addLocation(args, plannerMode);
                if (plannerMode && args.time) {
                    addToDayPlan(location);
                }
            },
            onLine: async (args: LineArgs) => {
                await addRoute(args, plannerMode);
            },
        }
    );

    if (!result.success) {
        throw new Error(result.error || 'Bir hata oluştu');
    }

    if (plannerMode && getDayPlanItinerary().length > 0) {
        sortDayPlanItinerary();
        showTimelineWithContent();
    }

    renderCards();
}

function handleReset(): void {
    restart();
}

function handleCardHighlight(index: number): void {
    highlightCard(index);
}

export function initApp(): void {
    if (isInitialized) {
        console.warn('App zaten başlatılmış');
        return;
    }

    try {
        getAIService();
        initMapContainer('map');
        initSearchBar(handleSearch, handleReset);
        initModeToggle();
        initTimeline(handleCardHighlight);
        initCardCarousel();
        initHelpModal();

        isInitialized = true;
        console.log('App başarıyla başlatıldı');
    } catch (error) {
        console.error('App başlatma hatası:', error);
        showError(error instanceof Error ? error.message : 'Uygulama başlatılamadı');
    }
}

export function isAppInitialized(): boolean {
    return isInitialized;
}
