import React, { useState, useEffect } from 'react';
import './CookieConsent.css';

const CookieConsent = ({ onConsent }) => {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            setShowBanner(true);
        } else {
            onConsent(consent === 'accepted');
        }
    }, [onConsent]);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setShowBanner(false);
        onConsent(true);
    };

    const handleReject = () => {
        localStorage.setItem('cookieConsent', 'rejected');
        setShowBanner(false);
        onConsent(false);
    };

    if (!showBanner) return null;

    return (
        <div className="cookie-consent-overlay">
            <div className="cookie-consent-banner">
                <div className="cookie-consent-header">
                    <img src="/archery-scorer/logo.png" alt="Archery Scorer Logo" className="cookie-consent-logo" />
                    <span className="cookie-consent-title">Archery Scorer</span>
                </div>
                <h2>Cookie Consent 🍪</h2>
                <p>
                    This website uses cookies and local storage to save your competition data and preferences (theme,
                    language, etc.). Do you consent to the use of cookies and local storage?
                </p>
                <div className="cookie-consent-buttons">
                    <button onClick={handleAccept} className="btn accept">
                        Accept
                    </button>
                    <button onClick={handleReject} className="btn reject">
                        Reject
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;