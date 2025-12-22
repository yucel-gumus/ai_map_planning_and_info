/**
 * Main Entry Point
 * @description Uygulamanın giriş noktası
 */

import './styles/index.css';
import { initApp } from './app';

// DOM hazır olduğunda uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
