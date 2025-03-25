import React, {useContext, useEffect, useState} from 'react';
import { LanguageContext } from '../LanguageContext';
import './Score.css'
import ScoringKeyboard, {getScoreConstraints} from "./ScoringKeyboard";

const ScoreInput = ({ participant, onScoreUpdate, arrowsPerRound, roundsPerSeries, series, currentSeries }) => {
    const { t } = useContext(LanguageContext);

    const [tempScores, setTempScores] = useState(
        participant.rounds.map((round) =>
            round.scores.map((score) => (score === '' || score == null ? '' : score.toString()))
        )
    );

    const [activeInput, setActiveInput] = useState(null);

    const constraints = getScoreConstraints(participant.targetType);

    useEffect(() => {
        setTempScores(
            participant.rounds.map((round) =>
                round.scores.map((score) => (score === '' || score == null ? '' : score.toString()))
            )
        );
    }, [participant.rounds]);

    const handleScoreChange = (roundIndex, scoreIndex, value) => {
        const newTempScores = [...tempScores];
        newTempScores[roundIndex][scoreIndex] = value === 'M' ? '0' : value;
        setTempScores(newTempScores);

        const newRounds = [...participant.rounds];
        newRounds[roundIndex].scores[scoreIndex] = value === 'M' ? 0 : (value === '' ? '' : parseInt(value));
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

    const handleInputFocus = (roundIndex, scoreIndex) => {
        if (activeInput?.roundIndex === roundIndex && activeInput?.scoreIndex === scoreIndex) {
            return;
        }
        setActiveInput({ roundIndex, scoreIndex });
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
                                                    <ScoringKeyboard
                                                        targetType={participant.targetType}
                                                        onScoreSelect={(value) => handleScoreChange(globalRoundIndex, scoreIndex, value)}
                                                        onClose={() => setActiveInput(null)}
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