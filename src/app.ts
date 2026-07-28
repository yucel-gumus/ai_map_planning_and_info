import type { LocationArgs, LineArgs } from './types';
import { initMapContainer } from './components/Map';
import { initSearchBar, showError, clearError, showLoading, hideLoading } from './components/Search/SearchBar';
import { initModeToggle } from './components/Search/ModeToggle';
import { initTimeline, showTimelineWithContent } from './components/Timeline';
import { initCardCarousel, renderCards, clearCarousel, highlightCard } from './components/Cards';
import { initHelpModal } from './components/Modal';
import { clearMap, addLocation, addRoute } from './hooks/useMap';
import {
    getDayPlanItinerary,
    addToDayPlan,
    clearDayPlan,
    sortDayPlanItinerary,
    setNoticeMessage,
} from './hooks/usePlanner';
import { resetTimeline } from './hooks/useTimeline';
import { getAIService } from './services/ai.service';

let isInitialized = false;
let currentQuery = '';
let currentPlannerMode = false;

function restart(): void {
    clearMap();
    clearDayPlan();
    clearCarousel();
    resetTimeline();
}

async function handleSearch(
    query: string,
    plannerMode: boolean,
    excludedLocations: string[] = []
): Promise<void> {
    clearError();
    currentQuery = query;
    currentPlannerMode = plannerMode;

    restart();

    const aiService = getAIService();

    const result = await aiService.generateContent(
        query,
        {
            isPlannerMode: plannerMode,
            excludedLocations: excludedLocations
        },
        {
            onLocation: async (args: LocationArgs) => {
                const location = await addLocation(args, plannerMode);
                if (plannerMode && (args.time || args.day)) {
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

    if (result.noticeMessage) {
        setNoticeMessage(result.noticeMessage);
    }

    if (plannerMode && getDayPlanItinerary().length > 0) {
        sortDayPlanItinerary();
        showTimelineWithContent();
    }

    renderCards();
}

function handleRePlan(excludedLocations: string[]): void {
    if (!currentQuery) return;
    showLoading();
    handleSearch(currentQuery, currentPlannerMode, excludedLocations)
        .catch(err => {
            showError(err instanceof Error ? err.message : 'Plan güncellenemedi');
        })
        .finally(() => {
            hideLoading();
        });
}

function handleReset(): void {
    currentQuery = '';
    restart();
}

function handleCardHighlight(index: number): void {
    highlightCard(index);
}

export async function initApp(): Promise<void> {
    if (isInitialized) {
        console.warn('App zaten başlatılmış');
        return;
    }

    try {
        getAIService();
        await initMapContainer('map');
        initSearchBar(handleSearch, handleReset);
        initModeToggle();
        initTimeline(handleCardHighlight, handleRePlan);
        initCardCarousel();
        initHelpModal();

        isInitialized = true;
        console.log('App (Google Maps Platform) başarıyla başlatıldı');
    } catch (error) {
        console.error('App başlatma hatası:', error);
        showError(error instanceof Error ? error.message : 'Uygulama başlatılamadı');
    }
}

export function isAppInitialized(): boolean {
    return isInitialized;
}
