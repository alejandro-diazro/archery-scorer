// src/App.js
import React, { useState } from 'react';
import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';
import AppContent from './AppContent';
import './App.css';
import Footer from "./Footer/footer";
import CookieConsentManager from "./Cookies/CokieConsentManager";

function App() {
    const handleClearCache = () => {
        localStorage.removeItem('cookieConsent');
        window.location.reload();
    };

    return (
        <CookieConsentManager>
        <ThemeProvider>
            <LanguageProvider>
                <AppContent onClearCache={handleClearCache}/>
            </LanguageProvider>
        </ThemeProvider>
        </CookieConsentManager>
    );
}

export default App;