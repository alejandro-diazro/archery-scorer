// src/CookieConsent.js
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
                <h2>Cookie Consent</h2>
                <p>
                    This website uses cookies and local storage to save your competition data and preferences (theme, language, etc.).
                    Do you consent to the use of cookies and local storage?
                </p>
                <div className="cookie-consent-buttons">
                    <button onClick={handleAccept} className="accept-button">
                        Accept
                    </button>
                    <button onClick={handleReject} className="reject-button">
                        Reject
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;