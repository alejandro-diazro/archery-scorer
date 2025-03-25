// src/AppContent.js
import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from './LanguageContext';
import jsPDF from 'jspdf';
import LandingPage from './Home/LandingPage';
import CompetitionConfigForm from './CompetitionConfig/CompetitionConfigForm';
import RegistrationPhase from "./Participant/RegistrationPhase";
import ScoringPhase from "./Score/ScoringPhase";
import exportToPDF from "./PDF/exportPDF";

const AppContent = ({ onClearCache }) => {
    const { t } = useContext(LanguageContext);

    // Estados principales
    const [competitionConfig, setCompetitionConfig] = useState(() => {
        const savedConfig = localStorage.getItem('archeryCompetitionConfig');
        return savedConfig
            ? JSON.parse(savedConfig)
            : { name: '', location: '', date: '2025-03-21', rounds: '', arrowsPerRound: '', series: '', isConfigured: false };
    });
    const [participants, setParticipants] = useState(() => {
        const saved = localStorage.getItem('archeryParticipants');
        return saved ? JSON.parse(saved) : [];
    });
    const [phase, setPhase] = useState('landing');
    const [savedCompetitions, setSavedCompetitions] = useState(() => {
        const saved = localStorage.getItem('savedCompetitions');
        return saved ? JSON.parse(saved) : [];
    });
    const [hasSavedCompetition, setHasSavedCompetition] = useState(false);
    const [currentSeries, setCurrentSeries] = useState(0);
    const updateSavedCompetitions = (newCompetitions) => {
        setSavedCompetitions(newCompetitions);
    };
    // Guardar datos en localStorage cuando cambian
    useEffect(() => {
        localStorage.setItem('archeryCompetitionConfig', JSON.stringify(competitionConfig));
        localStorage.setItem('archeryParticipants', JSON.stringify(participants));
        localStorage.setItem('savedCompetitions', JSON.stringify(savedCompetitions));
    }, [competitionConfig, participants, savedCompetitions]);

    // Guardar la competición en savedCompetitions cuando se completa la configuración
    useEffect(() => {
        if (
            competitionConfig.isConfigured &&
            participants.length > 0 &&
            phase === 'scoring' &&
            !hasSavedCompetition
        ) {
            const newCompetition = {
                name: competitionConfig.name,
                location: competitionConfig.location,
                date: competitionConfig.date,
                rounds: competitionConfig.rounds,
                arrowsPerRound: competitionConfig.arrowsPerRound,
                series: competitionConfig.series,
                participants: participants,
            };

            const competitionExists = savedCompetitions.some(
                (comp) =>
                    comp.name === newCompetition.name &&
                    comp.location === newCompetition.location &&
                    comp.date === newCompetition.date
            );

            if (!competitionExists) {
                const updatedSavedCompetitions = [...savedCompetitions, newCompetition];
                setSavedCompetitions(updatedSavedCompetitions);
                setHasSavedCompetition(true);
            }
        }
    }, [competitionConfig, participants, phase, savedCompetitions, hasSavedCompetition]);

    // Funciones de navegación
    const handleConfigSubmit = (newConfig) => {
        setCompetitionConfig({ ...newConfig, isConfigured: true });
        setPhase('registration');
    };

    const handleBackFromConfig = () => {
        setPhase('landing');
    };

    const handleBackFromRegistration = () => {
        setPhase('config');
    };

    const handleBackFromScoring = () => {
        setPhase('registration');
        setCurrentSeries(0);
    };

    const createNewCompetition = () => {
        localStorage.removeItem('archeryCompetitionConfig');
        localStorage.removeItem('archeryParticipants');

        const today = new Date().toISOString().split('T')[0];

        setCompetitionConfig({
            name: '',
            location: '',
            date: today,
            rounds: '',
            arrowsPerRound: '',
            series: '',
            isConfigured: false,
        });
        setParticipants([]);
        setHasSavedCompetition(false);
        setPhase('config');
        setCurrentSeries(0);
    };

    const startScoring = () => {
        if (participants.length > 0) {
            setPhase('scoring');
            setCurrentSeries(0);
        } else {
            alert(t.noArchers);
        }
    };

    const goToPreviousSeries = () => {
        if (currentSeries > 0) {
            setCurrentSeries(currentSeries - 1);
        }
    };

    const goToNextSeries = () => {
        const totalSeries = parseInt(competitionConfig.series);
        if (currentSeries < totalSeries - 1) {
            setCurrentSeries(currentSeries + 1);
        }
    };

    const goToMenu = () => {
        setPhase('landing');
        setCurrentSeries(0);
    };

    // Funciones de manejo de participantes y puntuaciones
    const addParticipant = (name, targetType, archerType) => {
        const maxRounds = parseInt(competitionConfig.rounds) * parseInt(competitionConfig.series);
        const arrowsPerRound = parseInt(competitionConfig.arrowsPerRound);
        const initialRounds = Array.from({ length: maxRounds }, () => ({
            scores: Array(arrowsPerRound).fill(''),
            sum: 0,
        }));
        setParticipants([...participants, { name, targetType, archerType, rounds: initialRounds, total: 0 }]);
    };

    const deleteParticipant = (index) => {
        const updatedParticipants = participants.filter((_, i) => i !== index);
        setParticipants(updatedParticipants);
    };

    const updateScores = (index, newRounds) => {
        const updatedParticipants = [...participants];
        updatedParticipants[index].rounds = newRounds;

        const total = newRounds.reduce((acc, round) => acc + (round.sum || 0), 0);
        updatedParticipants[index].total = total;

        setParticipants(updatedParticipants);

        // Actualizar savedCompetitions con las nuevas puntuaciones
        const updatedSavedCompetitions = savedCompetitions.map((comp) => {
            if (
                comp.name === competitionConfig.name &&
                comp.location === competitionConfig.location &&
                comp.date === competitionConfig.date
            ) {
                return {
                    ...comp,
                    participants: updatedParticipants,
                };
            }
            return comp;
        });
        setSavedCompetitions(updatedSavedCompetitions);
    };

    // Funciones de manejo de almacenamiento
    const resetStorage = () => {
        localStorage.removeItem('archeryCompetitionConfig');
        localStorage.removeItem('archeryParticipants');
        setCompetitionConfig({
            name: '',
            location: '',
            date: '2025-03-21',
            rounds: '',
            arrowsPerRound: '',
            series: '',
            isConfigured: false,
        });
        setParticipants([]);
        setPhase('landing');
        setHasSavedCompetition(false);
        setCurrentSeries(0);
    };

    const clearCache = () => {
        localStorage.clear();
        setCompetitionConfig({
            name: '',
            location: '',
            date: '2025-03-21',
            rounds: '',
            arrowsPerRound: '',
            series: '',
            isConfigured: false,
        });
        setParticipants([]);
        setSavedCompetitions([]);
        setPhase('landing');
        setHasSavedCompetition(false);
        setCurrentSeries(0);
        onClearCache();
    };

    const loadCompetition = (index) => {
        const competition = savedCompetitions[index];
        setCompetitionConfig({
            name: competition.name,
            location: competition.location,
            date: competition.date,
            rounds: competition.rounds,
            arrowsPerRound: competition.arrowsPerRound,
            series: competition.series,
            isConfigured: true,
        });
        setParticipants(competition.participants);

        const hasScores = competition.participants.some((participant) =>
            participant.rounds.some((round) => round.scores.some((score) => score !== ''))
        );
        setPhase(hasScores ? 'scoring' : 'registration');
        setHasSavedCompetition(true);
        setCurrentSeries(0);
    };

    const deleteCompetition = (index) => {
        const updatedSavedCompetitions = savedCompetitions.filter((_, i) => i !== index);
        setSavedCompetitions(updatedSavedCompetitions);
    };

    // Renderizado de las vistas
    return (
        <div className="App">
            {phase === 'landing' ? (
                <LandingPage
                    onCreateCompetition={createNewCompetition}
                    savedCompetitions={savedCompetitions}
                    onLoadCompetition={loadCompetition}
                    onDeleteCompetition={deleteCompetition}
                    onClearCache={clearCache}
                    onExportToPDF={(index) => exportToPDF(savedCompetitions[index], t)}
                    updateSavedCompetitions={updateSavedCompetitions}
                />
            ) : phase === 'config' ? (
                <CompetitionConfigForm
                    onConfigSubmit={handleConfigSubmit}
                    onBack={handleBackFromConfig}
                    initialConfig={competitionConfig}
                />
            ) : phase === 'registration' ? (
                <RegistrationPhase
                    competitionConfig={competitionConfig}
                    t={t}
                    addParticipant={addParticipant}
                    handleBackFromRegistration={handleBackFromRegistration}
                    startScoring={startScoring}
                    participants={participants}
                    deleteParticipant={deleteParticipant}
                    resetStorage={resetStorage}
                />
            ) : (
                <ScoringPhase
                    competitionConfig={competitionConfig}
                    t={t}
                    participants={participants}
                    currentSeries={currentSeries}
                    goToPreviousSeries={goToPreviousSeries}
                    goToNextSeries={goToNextSeries}
                    updateScores={updateScores}
                    handleBackFromScoring={handleBackFromScoring}
                    goToMenu={goToMenu}
                    resetStorage={resetStorage}
                />
            )}
        </div>
    );
};

export default AppContent;