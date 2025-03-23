import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../ThemeContext';
import { LanguageContext } from '../LanguageContext';
import "./LandingPage.css"
import {FaGlobe, FaMoon, FaShareAlt, FaSun} from "react-icons/fa";
import queryString from 'query-string';
import Footer from "../Footer/footer";

const LandingPage = ({ onCreateCompetition, savedCompetitions, onLoadCompetition, onDeleteCompetition, onClearCache, onExportToPDF }) => {
    const { theme, setTheme } = useContext(ThemeContext);
    const { language, setLanguage, t } = useContext(LanguageContext);
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
    const [sharedCompetitionMessage, setSharedCompetitionMessage] = useState(null);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const toggleLanguageDropdown = () => {
        setShowLanguageDropdown(!showLanguageDropdown);
    };

    const selectLanguage = (lang) => {
        setLanguage(lang);
        setShowLanguageDropdown(false);
    };

    const shareCompetition = (index) => {
        const competition = savedCompetitions[index];
        const encodedCompetition = btoa(JSON.stringify(competition));
        const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodedCompetition}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Share URL copied to clipboard: ' + shareUrl);
        });
    };

    const handleClearCache = () => {
        const confirmMessage = t.clearCacheConfirm || "Are you sure you want to clear the cache? This action is irreversible and will delete all saved competitions.";
        const userConfirmed = window.confirm(confirmMessage);

        if (userConfirmed) {
            onClearCache();
        }
    };

    useEffect(() => {
        const params = queryString.parse(window.location.search);
        if (params.share) {
            try {
                const decodedCompetition = JSON.parse(atob(params.share));
                const existingCompetitions = JSON.parse(localStorage.getItem('competitions')) || [];
                const competitionExists = existingCompetitions.some(
                    (comp) =>
                        comp.name === decodedCompetition.name &&
                        comp.location === decodedCompetition.location &&
                        comp.date === decodedCompetition.date
                );
                if (!competitionExists) {
                    const updatedCompetitions = [...existingCompetitions, decodedCompetition];
                    localStorage.setItem('competitions', JSON.stringify(updatedCompetitions));
                    setSharedCompetitionMessage('Shared competition has been saved! You can now load it from the list below.');
                } else {
                    setSharedCompetitionMessage('This competition is already in your saved competitions.');
                }
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
                console.error('Error decoding shared competition:', error);
                setSharedCompetitionMessage('Error loading shared competition. The URL may be invalid.');
            }
        }
    }, []);

    return (
        <div className="landing-page-wrapper">
            <div className="landing-page">
                <div className="landing-page-header">
                    <img src="/archery-scorer/logo.png" alt="Archery Scorer Logo" className="landing-page-logo" />
                    <span className="landing-page-title">Archery Scorer</span>
                </div>
                <div className="settings-bar">
                    <button className="btn-icon" onClick={toggleTheme} title={t.theme}>
                        {theme === 'light' ? <FaSun/> : <FaMoon/>}
                    </button>
                    <div className="language-toggle-wrapper">
                        <button className="btn-icon" onClick={toggleLanguageDropdown} title="Language">
                            <FaGlobe/>
                        </button>
                        {showLanguageDropdown && (
                            <div className="language-dropdown">
                                <button onClick={() => selectLanguage('en')}>English</button>
                                <button onClick={() => selectLanguage('es')}>Español</button>
                            </div>
                        )}
                    </div>
                </div>
                {sharedCompetitionMessage && (
                    <div className="shared-competition-message">
                        <p>{sharedCompetitionMessage}</p>
                    </div>
                )}
                <h2>{t.savedCompetitions}</h2>
                <div className="saved-competitions-section">
                    {savedCompetitions.length === 0 ? (
                        <p>{t.noSavedCompetitions}</p>
                    ) : (
                        <ul>
                            {savedCompetitions.map((comp, index) => (
                                <li key={index}>
                                    {comp.name} - {comp.location} - {comp.date} (Archers: {comp.participants.length})
                                    <div className="competition-actions">
                                        <button onClick={() => onLoadCompetition(index)} className="btn info">
                                            {t.load}
                                        </button>
                                        <button onClick={() => onDeleteCompetition(index)} className="btn reject">
                                            {t.delete}
                                        </button>
                                        <button onClick={() => onExportToPDF(index)} className="btn success">
                                            PDF
                                        </button>
                                        <button onClick={() => shareCompetition(index)} className="share-button">
                                            <FaShareAlt/> {t.share}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button onClick={handleClearCache} className="btn reject">
                    {t.clearCache}
                </button>
                <span> </span>
                <button onClick={onCreateCompetition} className="btn info">
                    {t.createNewCompetition}
                </button>

                <Footer></Footer>
            </div>
        </div>
    );
};

export default LandingPage;