import React, { useState, useContext } from 'react';
import { LanguageContext } from '../LanguageContext';
import './CompetitionConfig.css'

const CompetitionConfigForm = ({ onConfigSubmit,onBack, initialConfig }) => {
    const { t } = useContext(LanguageContext);
    const [name, setName] = useState(initialConfig.name);
    const [location, setLocation] = useState(initialConfig.location);
    const [date, setDate] = useState(initialConfig.date);
    const [rounds, setRounds] = useState(initialConfig.rounds);
    const [arrowsPerRound, setArrowsPerRound] = useState(initialConfig.arrowsPerRound);
    const [series, setSeries] = useState(initialConfig.series);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name && location && date && rounds > 0 && arrowsPerRound > 0 && series > 0) {
            onConfigSubmit({ name, location, date, rounds, arrowsPerRound, series });
        }
    };

    return (
        <div className="competition-config-page-wrapper">
            <div className="competition-config-page">
                <form onSubmit={handleSubmit}>
                    <h2>{t.configureCompetition}</h2>
                    <div>
                        <label>{t.competitionName}: </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: GPC"
                        />
                    </div>
                    <div>
                        <label>{t.location}: </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Ej: La Laguna"
                        />
                    </div>
                    <div>
                        <label>{t.date}: </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>{t.roundsPerSeries}: </label>
                        <input
                            type="number"
                            value={rounds}
                            onChange={(e) => setRounds(e.target.value)}
                            min="1"
                            placeholder="Ej: 10"
                        />
                    </div>
                    <div>
                        <label>{t.arrowsPerRound}: </label>
                        <input
                            type="number"
                            value={arrowsPerRound}
                            onChange={(e) => setArrowsPerRound(e.target.value)}
                            min="1"
                            placeholder="Ej: 3"
                        />
                    </div>
                    <div>
                        <label>{t.series}: </label>
                        <input
                            type="number"
                            value={series}
                            onChange={(e) => setSeries(e.target.value)}
                            min="1"
                            placeholder="Ej: 2"
                        />
                    </div>
                    <div className="actions-competition">
                        <button type="button" onClick={onBack} className="btn reject">
                            {t.onBack}
                        </button>
                        <button type="submit" className={"btn accept"}>{t.saveConfiguration}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompetitionConfigForm;