// src/AppContent.js
import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from './LanguageContext';
import LandingPage from './Home/LandingPage';
import CompetitionConfigForm from './CompetitionConfig/CompetitionConfigForm';
import RegistrationPhase from "./Participant/RegistrationPhase";
import ScoringPhase from "./Score/ScoringPhase";
import exportToPDF from "./PDF/exportPDF";

const AppContent = ({ onClearCache }) => {
    const { t } = useContext(LanguageContext);

    const [competitionConfig, setCompetitionConfig] = useState(() => {
        const savedConfig = localStorage.getItem('archeryCompetitionConfig');
        return savedConfig
            ? JSON.parse(savedConfig)
            : { name: '', location: '', date: '2025-03-21', rounds: '', arrowsPerRound: '', series: '', teamMode: false, eliminationMode: false, isConfigured: false };
    });
    const [participants, setParticipants] = useState(() => {
        const saved = localStorage.getItem('archeryParticipants');
        return saved ? JSON.parse(saved) : [];
    });
    const [teams, setTeams] = useState([]);
    const [phase, setPhase] = useState('landing');
    const [savedCompetitions, setSavedCompetitions] = useState(() => {
        const saved = localStorage.getItem('savedCompetitions');
        return saved ? JSON.parse(saved) : [];
    });
    const [hasSavedCompetition, setHasSavedCompetition] = useState(false);
    const [currentSeries, setCurrentSeries] = useState(0);
    const [eliminationPhase, setEliminationPhase] = useState(false);

    const updateSavedCompetitions = (newCompetitions) => {
        setSavedCompetitions(newCompetitions);
    };

    useEffect(() => {
        localStorage.setItem('archeryCompetitionConfig', JSON.stringify(competitionConfig));
        localStorage.setItem('archeryParticipants', JSON.stringify(participants));
        localStorage.setItem('savedCompetitions', JSON.stringify(savedCompetitions));
    }, [competitionConfig, participants, savedCompetitions]);

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
                teamMode: competitionConfig.teamMode,
                eliminationMode: competitionConfig.eliminationMode,
                participants: participants,
                teams: teams,
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

    const handleConfigSubmit = (newConfig) => {
        setCompetitionConfig((prevConfig) => ({
            ...prevConfig,
            ...newConfig,
            isConfigured: true
        }));
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
            teamMode: false,
            eliminationMode: false,
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

    const startEliminations = () => {
        if (competitionConfig.eliminationMode && participants.length > 1) {
            setEliminationPhase(true);
            setPhase('elimination');
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

    const addParticipant = (name, targetType, archerType, teamName = '') => {
        const maxRounds = parseInt(competitionConfig.rounds) * parseInt(competitionConfig.series);
        const arrowsPerRound = parseInt(competitionConfig.arrowsPerRound);
        const initialRounds = Array.from({ length: maxRounds }, () => ({
            scores: Array(arrowsPerRound).fill(''),
            sum: 0,
        }));
        const newParticipant = { name, targetType, archerType, teamName, rounds: initialRounds, total: 0 };
        setParticipants([...participants, newParticipant]);

        if (competitionConfig.teamMode && teamName) {
            console.log("hola");
            const teamIndex = teams.findIndex((team) => team.name === teamName);
            if (teamIndex === -1) {
                setTeams([...teams, { name: teamName, members: [newParticipant] }]);
            } else {
                const updatedTeams = [...teams];
                updatedTeams[teamIndex].members.push(newParticipant);
                setTeams(updatedTeams);
            }
        }
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

        if (competitionConfig.teamMode) {
            const updatedTeams = teams.map((team) => {
                const teamMembers = updatedParticipants.filter((p) => p.teamName === team.name);
                const teamTotal = teamMembers.reduce((acc, member) => acc + member.total, 0);
                return { ...team, members: teamMembers, total: teamTotal };
            });
            setTeams(updatedTeams);
        }

        const updatedSavedCompetitions = savedCompetitions.map((comp) => {
            if (
                comp.name === competitionConfig.name &&
                comp.location === competitionConfig.location &&
                comp.date === competitionConfig.date
            ) {
                return {
                    ...comp,
                    participants: updatedParticipants,
                    teams: competitionConfig.teamMode ? teams : [],
                };
            }
            return comp;
        });
        setSavedCompetitions(updatedSavedCompetitions);
    };

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
            teamMode: competition.teamMode || false,
            eliminationMode: competition.eliminationMode || false,
            isConfigured: true,
        });
        setParticipants(competition.participants);
        setTeams(competition.teams || []);

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

    const renderEliminationPhase = () => {
        const sortedParticipants = [...participants].sort((a, b) => b.total - a.total);
        const topParticipants = sortedParticipants.slice(0, Math.min(8, sortedParticipants.length)); // Ejemplo: top 8
        return (
            <div>
                <h2>{t.eliminationPhase}</h2>
                <ul>
                    {topParticipants.map((p, index) => (
                        <li key={index}>{p.name} - Total: {p.total}</li>
                    ))}
                </ul>
                <button onClick={goToMenu}>{t.backToMenu}</button>
            </div>
        );
    };

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
                    deleteParticipant={(index) => setParticipants(participants.filter((_, i) => i !== index))}
                    resetStorage={() => {
                        localStorage.clear();
                        setCompetitionConfig({ ...competitionConfig, isConfigured: false });
                        setParticipants([]);
                        setTeams([]);
                        setPhase('landing');
                    }}
                />
            ) : phase === 'scoring' ? (
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
                    resetStorage={() => {
                        localStorage.clear();
                        setCompetitionConfig({ ...competitionConfig, isConfigured: false });
                        setParticipants([]);
                        setTeams([]);
                        setPhase('landing');
                    }}
                    startEliminations={startEliminations}
                />
            ) : phase === 'elimination' ? (
                renderEliminationPhase()
            ) : null}
        </div>
    );
};

export default AppContent;