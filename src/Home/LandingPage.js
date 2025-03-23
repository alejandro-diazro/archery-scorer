import React, {useContext, useState} from 'react';
import { ThemeContext } from '../ThemeContext';
import { LanguageContext } from '../LanguageContext';
import "./LandingPage.css"
import {FaGlobe, FaMoon, FaSun} from "react-icons/fa";
import Footer from "../Footer/footer";

const LandingPage = ({ onCreateCompetition, savedCompetitions, onLoadCompetition, onDeleteCompetition, onClearCache, onExportToPDF }) => {
    const { theme, setTheme } = useContext(ThemeContext);
    const { language, setLanguage, t } = useContext(LanguageContext);
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

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
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button onClick={onClearCache} className="btn reject">
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