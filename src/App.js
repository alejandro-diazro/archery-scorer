// src/App.js
import React, { useState } from 'react';
import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';
import CookieConsent from './CookieConsent';
import AppContent from './AppContent';
import './App.css';

function App() {
    const [hasConsent, setHasConsent] = useState(null);

    const handleConsent = (consent) => {
        setHasConsent(consent);
    };

    const handleClearCache = () => {
        setHasConsent(null);
    };

    if (hasConsent === null) {
        return <CookieConsent onConsent={handleConsent} />;
    }

    if (!hasConsent) {
        return (
            <div className="App">
                <h1>Cookie Consent Required</h1>
                <p>
                    You have rejected the use of cookies and local storage, which are required to use this application. Please
                    accept cookies to continue.
                </p>
                <button
                    onClick={() => {
                        localStorage.removeItem('cookieConsent');
                        setHasConsent(null);
                    }}
                    className="retry-button"
                >
                    Retry Consent
                </button>
            </div>
        );
    }

    return (
        <ThemeProvider>
            <LanguageProvider>
                <AppContent onClearCache={handleClearCache} />
            </LanguageProvider>
        </ThemeProvider>
    );
}

export default App;