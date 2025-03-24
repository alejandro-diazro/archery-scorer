// src/ScoreInput.js
import React, { useContext, useState } from 'react';
import { LanguageContext } from './LanguageContext';

const ScoreInput = ({ participant, onScoreUpdate, arrowsPerRound, roundsPerSeries, series, currentSeries }) => {
    const { t } = useContext(LanguageContext);

    // Estado temporal para los valores de los inputs
    const [tempScores, setTempScores] = useState(
        participant.rounds.map((round) => round.scores.map((score) => score === '' ? '' : score.toString()))
    );

    // Definir los rangos de puntuación según el tipo de diana
    const getScoreConstraints = (targetType) => {
        switch (targetType) {
            case 'FITA 80cm (reducida)':
                return { min: 0, max: 10, allowed: [0, 5, 6, 7, 8, 9, 10] }; // 0, 5 a 10
            case 'FITA Triple Vertical':
                return { min: 0, max: 10, allowed: [0, 6, 7, 8, 9, 10] }; // 0, 6 a 10
            case '3D':
                return { min: 0, max: 11, allowed: [0, 5, 8, 10, 11] }; // 0, 5, 8, 10, 11
            case 'FITA 60cm (completa)':
            case 'FITA 80cm (completa)':
            case 'FITA 122cm':
            case 'FITA 40cm (completa)':
            default:
                return { min: 0, max: 10, allowed: Array.from({ length: 11 }, (_, i) => i) }; // 0 a 10
        }
    };

    const constraints = getScoreConstraints(participant.targetType);

    const handleScoreChange = (roundIndex, scoreIndex, value) => {
        const newTempScores = [...tempScores];
        newTempScores[roundIndex][scoreIndex] = value;
        setTempScores(newTempScores);
    };

    const handleScoreBlur = (roundIndex, scoreIndex) => {
        const newRounds = [...participant.rounds];
        let value = tempScores[roundIndex][scoreIndex];
        let numScore;

        if (value === '' || value.toUpperCase() === 'M') {
            numScore = '';
        } else {
            numScore = parseInt(value);
            if (isNaN(numScore)) {
                console.log(`Valor no numérico ingresado: ${value}`);
                numScore = '';
            } else if (!constraints.allowed.includes(numScore)) {
                console.log(`Puntaje no permitido: ${numScore} para ${participant.targetType}. Permitidos: ${constraints.allowed}`);
                numScore = '';
            }
        }

        newRounds[roundIndex].scores[scoreIndex] = numScore;
        newRounds[roundIndex].sum = newRounds[roundIndex].scores.reduce((acc, score) => acc + (parseInt(score) || 0), 0);

        const newTempScores = [...tempScores];
        newTempScores[roundIndex][scoreIndex] = numScore === '' ? '' : numScore.toString();
        setTempScores(newTempScores);

        onScoreUpdate(newRounds);
    };

    const getRoundHighScores = (round) => {
        let highScore1 = 0; // 10s para dianas normales, 11s para 3D
        let highScore2 = 0; // 9s para dianas normales, 10s para 3D
        round.scores.forEach((score) => {
            const numScore = parseInt(score) || 0;
            if (participant.targetType === '3D') {
                if (numScore === 11) highScore1 += 1;
                if (numScore === 10) highScore2 += 1;
            } else {
                if (numScore === 10) highScore1 += 1;
                if (numScore === 9) highScore2 += 1;
            }
        });
        return { highScore1, highScore2 };
    };

    const getSeriesSubtotal = (seriesIndex) => {
        const start = seriesIndex * roundsPerSeries;
        const end = start + roundsPerSeries;
        return participant.rounds.slice(start, end).reduce((acc, round) => acc + (round.sum || 0), 0);
    };

    const getSeriesTotal = (seriesIndex, roundIndexInSeries) => {
        const start = seriesIndex * roundsPerSeries;
        const end = start + roundIndexInSeries + 1;
        return participant.rounds.slice(start, end).reduce((acc, round) => acc + (round.sum || 0), 0);
    };

    const getTotalHighScores = () => {
        let highScore1 = 0; // 10s para dianas normales, 11s para 3D
        let highScore2 = 0; // 9s para dianas normales, 10s para 3D
        participant.rounds.forEach((round) => {
            round.scores.forEach((score) => {
                const numScore = parseInt(score) || 0;
                if (participant.targetType === '3D') {
                    if (numScore === 11) highScore1 += 1;
                    if (numScore === 10) highScore2 += 1;
                } else {
                    if (numScore === 10) highScore1 += 1;
                    if (numScore === 9) highScore2 += 1;
                }
            });
        });
        return { highScore1, highScore2 };
    };

    // Mostrar solo la serie actual
    const startRound = currentSeries * roundsPerSeries;
    const endRound = (currentSeries + 1) * roundsPerSeries;
    const seriesRounds = participant.rounds.slice(startRound, endRound);

    return (
        <div className="score-input">
            <h3>{participant.name}</h3>
            <p>{t.targetType}: {participant.targetType} | {t.archerType}: {participant.archerType}</p>
            <div>
                <h4>{t.seriesLabel} {currentSeries + 1}</h4>
                <table>
                    <thead>
                    <tr>
                        <th></th>
                        {Array.from({ length: arrowsPerRound }, (_, i) => (
                            <th key={i}>{i + 1}</th>
                        ))}
                        <th>{t.sum}</th>
                        <th>{t.total}</th>
                        <th>{participant.targetType === '3D' ? '11' : '10'}</th>
                        <th>{participant.targetType === '3D' ? '10' : '9'}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {seriesRounds.map((round, roundIndex) => {
                        const globalRoundIndex = startRound + roundIndex;
                        const { highScore1, highScore2 } = getRoundHighScores(round);
                        return (
                            <tr key={globalRoundIndex}>
                                <td>{roundIndex + 1}</td>
                                {round.scores.map((score, scoreIndex) => (
                                    <td key={scoreIndex}>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={tempScores[globalRoundIndex][scoreIndex]}
                                            placeholder="M"
                                            onChange={(e) => handleScoreChange(globalRoundIndex, scoreIndex, e.target.value)}
                                            onBlur={() => handleScoreBlur(globalRoundIndex, scoreIndex)}
                                            style={{ width: '40px', textAlign: 'center' }}
                                        />
                                    </td>
                                ))}
                                <td>{round.sum || 0}</td>
                                <td>{getSeriesTotal(currentSeries, roundIndex)}</td>
                                <td>{highScore1 || 0}</td>
                                <td>{highScore2 || 0}</td>
                            </tr>
                        );
                    })}
                    {seriesRounds.length > 0 && seriesRounds.length === roundsPerSeries && (
                        <tr>
                            <td colSpan={arrowsPerRound + 1}>Subtotal {t.seriesLabel} {currentSeries + 1}</td>
                            <td>{getSeriesSubtotal(currentSeries)}</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ScoreInput;