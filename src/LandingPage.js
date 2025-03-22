// src/LandingPage.js
import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import { LanguageContext } from './LanguageContext';

const LandingPage = ({ onCreateCompetition, savedCompetitions, onLoadCompetition, onDeleteCompetition, onClearCache, onExportToPDF }) => {
    const { theme, setTheme } = useContext(ThemeContext);
    const { language, setLanguage, t } = useContext(LanguageContext);

    return (
        <div className="landing-page">
            <h1>{t.welcome}</h1>
            <div className="theme-toggle">
                <label>{t.theme}: </label>
                <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                    <option value="light">{t.light}</option>
                    <option value="dark">{t.dark}</option>
                </select>
            </div>
            <div className="language-toggle">
                <label>Language: </label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                </select>
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
                                    <button onClick={() => onLoadCompetition(index)} className="load-button">
                                        {t.load}
                                    </button>
                                    <button onClick={() => onDeleteCompetition(index)} className="delete-button">
                                        {t.delete}
                                    </button>
                                    <button onClick={() => onExportToPDF(index)} className="export-pdf-button">
                                        Export to PDF
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <button onClick={onClearCache} className="clear-cache-button">
                Clear All Cache
            </button>
            <button onClick={onCreateCompetition} className="create-button">
                {t.createNewCompetition}
            </button>
        </div>
    );
};

export default LandingPage;