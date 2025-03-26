// src/CompetitionConfigDisplay.js
import React, { useContext } from 'react';
import { LanguageContext } from './LanguageContext';

const CompetitionConfigDisplay = ({ config }) => {
    const { t } = useContext(LanguageContext);

    return (
        <div>
            <h3>{t.competitionConfig}</h3>
            <p>{t.competitionName}: {config.name}</p>
            <p>{t.location}: {config.location}</p>
            <p>{t.date}: {config.date}</p>
            <p>{t.roundsPerSeries}: {config.rounds} | {t.arrowsPerRound}: {config.arrowsPerRound} | {t.series}: {config.series}</p>
            <p>{config.teamMode ? "Modo por equipos: Si": ""} </p>
        </div>
    );
};

export default CompetitionConfigDisplay;