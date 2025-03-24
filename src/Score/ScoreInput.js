import React, { useContext, useState } from 'react';
import { LanguageContext } from '../LanguageContext';
import './Score.css'

const ScoreInput = ({ participant, onScoreUpdate, arrowsPerRound, roundsPerSeries, series, currentSeries }) => {
    const { t } = useContext(LanguageContext);

    const [tempScores, setTempScores] = useState(
        participant.rounds.map((round) =>
            round.scores.map((score) => (score === '' || score == null ? '' : score.toString()))
        )
    );
    const [activeInput, setActiveInput] = useState(null);

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

        const newRounds = [...participant.rounds];
        newRounds[roundIndex].scores[scoreIndex] = value === '' ? '' : parseInt(value);
        newRounds[roundIndex].sum = newRounds[roundIndex].scores.reduce(
            (acc, score) => acc + (parseInt(score) || 0),
            0
        );

        onScoreUpdate(newRounds);

        const nextScoreIndex = scoreIndex + 1;
        if (nextScoreIndex < arrowsPerRound) {
            setActiveInput({ roundIndex, scoreIndex: nextScoreIndex });
        } else {
            setActiveInput(null);
        }
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
        let highScore1 = 0;
        let highScore2 = 0;
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
        let highScore1 = 0;
        let highScore2 = 0;
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

    const CustomKeyboard = ({ roundIndex, scoreIndex }) => (
        <div
            style={{
                position: 'fixed',
                bottom: '10px',
                left: 0,
                right: 0,
                background: 'var(--background-primary)',
                padding: '10px',
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                maxWidth: '90%',
                margin: '0 auto',
            }}
        >
            <button
                onClick={() => handleScoreChange(roundIndex, scoreIndex, 'M')}
                style={{
                    margin: '5px',
                    padding: '10px 15px',
                    fontSize: '16px',
                    background: 'var(--background-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    minWidth: '50px',
                }}
            >
                M
            </button>
            {constraints.allowed.filter((score) => score !== 0).map((score) => (
                <button
                    key={score}
                    onClick={() => handleScoreChange(roundIndex, scoreIndex, score.toString())}
                    style={{
                        margin: '5px',
                        padding: '10px 15px',
                        fontSize: '16px',
                        background: 'var(--background-tertiary)',
                        color: 'var(--text-primary)',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        minWidth: '50px',
                    }}
                >
                    {score}
                </button>
            ))}

            <button
                onClick={() => setActiveInput(null)}
                style={{
                    margin: '5px',
                    padding: '10px 15px',
                    fontSize: '16px',
                    background: 'var(--background-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    minWidth: '50px',
                }}
            >
                Cerrar
            </button>
        </div>
    );

    const handleInputFocus = (roundIndex, scoreIndex) => {
        if (activeInput?.roundIndex === roundIndex && activeInput?.scoreIndex === scoreIndex) {
            return;
        }

        setActiveInput({ roundIndex, scoreIndex });
    };

    const startRound = currentSeries * roundsPerSeries;
    const endRound = (currentSeries + 1) * roundsPerSeries;
    const seriesRounds = participant.rounds.slice(startRound, endRound);

    return (
        <div className="score-input">
            <h3>{participant.name}</h3>
            <p>
                {t.targetType}: {participant.targetType} | {t.archerType}: {participant.archerType}
            </p>
            <div>
                <h4>
                    {t.seriesLabel} {currentSeries + 1}
                </h4>
                <div className="table-wrapper">
                    <table>
                        <thead>
                        <tr>
                            <th></th>
                            {Array.from({length: arrowsPerRound}, (_, i) => (
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
                            const {highScore1, highScore2} = getRoundHighScores(round);
                            return (
                                <tr key={globalRoundIndex}>
                                    <td>{roundIndex + 1}</td>
                                    {round.scores.map((score, scoreIndex) => (
                                        <td key={scoreIndex}>
                                            <input
                                                type="text"
                                                value={tempScores[globalRoundIndex][scoreIndex]}
                                                placeholder=""
                                                readOnly
                                                onFocus={() => handleInputFocus(globalRoundIndex, scoreIndex)}
                                                style={{width: '30px', textAlign: 'center'}}
                                            />
                                            {activeInput?.roundIndex === globalRoundIndex &&
                                                activeInput?.scoreIndex === scoreIndex && (
                                                    <CustomKeyboard
                                                        roundIndex={globalRoundIndex}
                                                        scoreIndex={scoreIndex}
                                                    />
                                                )}
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
                                <td colSpan={arrowsPerRound + 1}>
                                    Subtotal {t.seriesLabel} {currentSeries + 1}
                                </td>
                                <td>{getSeriesSubtotal(currentSeries)}</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
                </div>
            </div>
            );
            };

            export default ScoreInput;