// src/AppContent.js
import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from './LanguageContext';
import jsPDF from 'jspdf';
import LandingPage from './LandingPage';
import CompetitionConfigForm from './CompetitionConfigForm';
import CompetitionConfigDisplay from './CompetitionConfigDisplay';
import ParticipantForm from './ParticipantForm';
import ParticipantList from './ParticipantList';
import ScoreInput from './ScoreInput';
import Scoreboard from './Scoreboard';

const AppContent = ({ onClearCache }) => {
    const { t } = useContext(LanguageContext);

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

    const exportToPDF = (index) => {
        const competition = savedCompetitions[index];
        const doc = new jsPDF();
        const pageHeight = 297; // Altura de una página A4 en mm
        const pageWidth = 210; // Ancho de una página A4 en mm
        const margin = 20; // Margen en mm
        const maxWidth = pageWidth - 2 * margin; // Ancho máximo para el texto
        let yPosition = margin;

        // Título y detalles de la partida
        doc.setFontSize(18);
        doc.text(`${competition.name} - Scores`, margin, yPosition);
        yPosition += 10;

        doc.setFontSize(12);
        doc.text(`Location: ${competition.location}`, margin, yPosition);
        yPosition += 5;
        doc.text(`Date: ${competition.date}`, margin, yPosition);
        yPosition += 5;
        doc.text(`Rounds per Series: ${competition.rounds}`, margin, yPosition);
        yPosition += 5;
        doc.text(`Arrows per Round: ${competition.arrowsPerRound}`, margin, yPosition);
        yPosition += 5;
        doc.text(`Series: ${competition.series}`, margin, yPosition);
        yPosition += 5;

        // Separador
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;

        // Puntuaciones de los arqueros
        competition.participants.forEach((participant, participantIndex) => {
            // Verificar si hay espacio suficiente para el siguiente bloque
            if (yPosition > pageHeight - 40) { // 40 mm de margen inferior
                doc.addPage();
                yPosition = margin;
            }

            doc.setFontSize(14);
            const participantHeader = `${participant.name} (${participant.archerType}, ${participant.targetType})`;
            const participantLines = doc.splitTextToSize(participantHeader, maxWidth);
            doc.text(participantLines, margin, yPosition);
            yPosition += participantLines.length * 7; // Ajustar según el número de líneas

            const maxRounds = parseInt(competition.rounds) * parseInt(competition.series);
            const roundsPerSeries = parseInt(competition.rounds);
            const seriesCount = parseInt(competition.series);

            // Iterar por series
            for (let seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
                if (yPosition > pageHeight - 40) {
                    doc.addPage();
                    yPosition = margin;
                }

                const startRound = seriesIndex * roundsPerSeries;
                const endRound = (seriesIndex + 1) * roundsPerSeries;
                const seriesRounds = participant.rounds.slice(startRound, endRound);

                if (seriesRounds.length > 0) {
                    doc.setFontSize(12);
                    doc.text(`Series ${seriesIndex + 1}`, margin, yPosition);
                    yPosition += 5;

                    // Encabezado de la tabla
                    let tableHeader = 'Round | ';
                    for (let i = 1; i <= parseInt(competition.arrowsPerRound); i++) {
                        tableHeader += `Arrow ${i} | `;
                    }
                    tableHeader += `Sum | Total | ${participant.targetType === '3D' ? '11s' : '10s'} | ${participant.targetType === '3D' ? '10s' : '9s'}`;
                    const headerLines = doc.splitTextToSize(tableHeader, maxWidth);
                    doc.text(headerLines, margin, yPosition);
                    yPosition += headerLines.length * 5;

                    // Contenido de la tabla
                    seriesRounds.forEach((round, roundIndex) => {
                        if (yPosition > pageHeight - 20) {
                            doc.addPage();
                            yPosition = margin;
                        }

                        const globalRoundIndex = startRound + roundIndex;
                        const tens = round.scores.filter((score) => parseInt(score) === (participant.targetType === '3D' ? 11 : 10)).length;
                        const nines = round.scores.filter((score) => parseInt(score) === (participant.targetType === '3D' ? 10 : 9)).length;
                        const seriesTotal = participant.rounds
                            .slice(startRound, globalRoundIndex + 1)
                            .reduce((acc, r) => acc + (r.sum || 0), 0);

                        let rowText = `${roundIndex + 1}     | `;
                        round.scores.forEach((score) => {
                            const displayScore = score === '' ? 'M' : score.toString();
                            rowText += `${displayScore.padStart(2, ' ')}       | `;
                        });
                        rowText += `${(round.sum || 0).toString().padStart(3, ' ')} | ${seriesTotal.toString().padStart(5, ' ')} | ${tens}   | ${nines}`;
                        const rowLines = doc.splitTextToSize(rowText, maxWidth);
                        doc.text(rowLines, margin, yPosition);
                        yPosition += rowLines.length * 5;
                    });

                    // Subtotal de la serie
                    if (yPosition > pageHeight - 20) {
                        doc.addPage();
                        yPosition = margin;
                    }
                    const seriesSubtotal = seriesRounds.reduce((acc, round) => acc + (round.sum || 0), 0);
                    const subtotalText = `Subtotal Series ${seriesIndex + 1}: ${seriesSubtotal}`;
                    const subtotalLines = doc.splitTextToSize(subtotalText, maxWidth);
                    doc.text(subtotalLines, margin, yPosition);
                    yPosition += subtotalLines.length * 5 + 5;
                }
            }

            // Total final del arquero
            if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = margin;
            }
            const totalHighScore1 = participant.rounds.reduce((acc, round) => acc + round.scores.filter((score) => parseInt(score) === (participant.targetType === '3D' ? 11 : 10)).length, 0);
            const totalHighScore2 = participant.rounds.reduce((acc, round) => acc + round.scores.filter((score) => parseInt(score) === (participant.targetType === '3D' ? 10 : 9)).length, 0);
            doc.setFontSize(12);
            const totalText = `Total: ${participant.total || 0} | ${participant.targetType === '3D' ? '11s' : '10s'}: ${totalHighScore1} | ${participant.targetType === '3D' ? '10s' : '9s'}: ${totalHighScore2}`;
            const totalLines = doc.splitTextToSize(totalText, maxWidth);
            doc.text(totalLines, margin, yPosition);
            yPosition += totalLines.length * 5 + 5;

            // Separador entre arqueros
            if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = margin;
            }
            doc.setLineWidth(0.2);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 5;
        });

        // Guardar el PDF
        doc.save(`${competition.name.replace(/\s+/g, '_')}_scores.pdf`);
    };

    const handleConfigSubmit = (newConfig) => {
        setCompetitionConfig({ ...newConfig, isConfigured: true });
        setPhase('registration');
    };

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

    const goToMenu = () => {
        setPhase('landing');
        setCurrentSeries(0);
    };

    const createNewCompetition = () => {
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
        setHasSavedCompetition(false);
        setPhase('config');
        setCurrentSeries(0);
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
                    onExportToPDF={exportToPDF}
                />
            ) : phase === 'config' ? (
                <CompetitionConfigForm onConfigSubmit={handleConfigSubmit} initialConfig={competitionConfig} />
            ) : (
                <>
                    <CompetitionConfigDisplay config={competitionConfig} />
                    {phase === 'registration' ? (
                        <>
                            <ParticipantForm addParticipant={addParticipant} />
                            <button onClick={startScoring} className="start-scoring-button">
                                {t.startScoring}
                            </button>
                            <ParticipantList participants={participants} onDeleteParticipant={deleteParticipant} />
                        </>
                    ) : (
                        <>
                            <div className="series-navigation">
                                <button
                                    onClick={goToPreviousSeries}
                                    disabled={currentSeries === 0}
                                    className="nav-series-button"
                                >
                                    {t.previousSeries}
                                </button>
                                <span>Serie {currentSeries + 1} / {competitionConfig.series}</span>
                                <button
                                    onClick={goToNextSeries}
                                    disabled={currentSeries === parseInt(competitionConfig.series) - 1}
                                    className="nav-series-button"
                                >
                                    {t.nextSeries}
                                </button>
                            </div>
                            {participants.map((participant, index) => (
                                <ScoreInput
                                    key={index}
                                    participant={participant}
                                    onScoreUpdate={(newRounds) => updateScores(index, newRounds)}
                                    arrowsPerRound={parseInt(competitionConfig.arrowsPerRound)}
                                    roundsPerSeries={parseInt(competitionConfig.rounds)}
                                    series={parseInt(competitionConfig.series)}
                                    currentSeries={currentSeries}
                                />
                            ))}
                            <Scoreboard participants={participants} />
                            <div className="scoring-actions">
                                <button onClick={goToMenu} className="back-to-menu-button">
                                    Back to Menu
                                </button>
                                <button onClick={resetStorage} className="reset-button">
                                    {t.resetAll}
                                </button>
                            </div>
                        </>
                    )}
                    {phase !== 'scoring' && (
                        <button onClick={resetStorage} className="reset-button">
                            {t.resetAll}
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

export default AppContent;