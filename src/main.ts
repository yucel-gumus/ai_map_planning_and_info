/**
 * Main Entry Point
 * @description Uygulamanın giriş noktası
 */

import './styles/index.css';
import { setupMapsNetworkInterceptor } from './utils/mapsInterceptor';
import { initApp } from './app';

// Activate Network Security Interceptor
setupMapsNetworkInterceptor();

// DOM hazır olduğunda uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
