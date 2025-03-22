// src/CookieConsentManager.js
import React, { useState, useEffect } from 'react';
import CookieConsent from './CookieConsent';
import './CookieConsent.css';

const CookieConsentManager = ({ children }) => {
    const [hasConsent, setHasConsent] = useState(null);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (consent) {
            setHasConsent(consent === 'accepted');
        }
    }, []);

    const handleConsent = (consent) => {
        setHasConsent(consent);
    };

    const handleRetryConsent = () => {
        localStorage.removeItem('cookieConsent');
        setHasConsent(null);
    };

    if (hasConsent === null) {
        return <CookieConsent onConsent={handleConsent} />;
    }

    if (!hasConsent) {
        return (
            <div className="cookie-consent-overlay">
                <div className="cookie-consent-banner">
                    <div className="cookie-consent-header">
                        <img src="/logo.png" alt="Archery Scorer Logo" className="cookie-consent-logo"/>
                        <span className="cookie-consent-title">Archery Scorer</span>
                    </div>
                    <h2>Cookie Consent Required 😢</h2>
                    <p>
                        You have rejected the use of cookies and local storage, which are required to use this application.
                        <br />
                        Please accept cookies to continue.
                    </p>
                    <div className="cookie-consent-buttons">
                        <button onClick={handleRetryConsent} className="btn warning">
                            Retry Consent
                        </button>
                    </div>
                </div>
            </div>

        )
            ;
    }

    return <>{children}</>;
};

export default CookieConsentManager;