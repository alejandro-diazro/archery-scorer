import Scoreboard from "../Scoreboard";
import ScoreInput from "./ScoreInput";
import CompetitionConfigDisplay from "../CompetitionConfigDisplay";
import {useState} from "react";
import ScoringKeyboard from "./ScoringKeyboard";

const ScoringPhase = ({
                          competitionConfig,
                          t,
                          participants,
                          currentSeries,
                          goToPreviousSeries,
                          goToNextSeries,
                          updateScores,
                          handleBackFromScoring,
                          goToMenu,
                          resetStorage
                      }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [tempScores, setTempScores] = useState([]);
    const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0);

    const handleMenu = () => {
        if (!isMenuOpen) {
            setCurrentParticipantIndex(0);
            setTempScores([]);
            setIsMenuOpen(true);
        } else {
            setIsMenuOpen(false);
            setTempScores([]);
        }
    }

    const getFirstEmptyRoundIndex = (participantIndex) => {
        if (participants.length === 0 || participantIndex >= participants.length) return -1;
        const participant = participants[participantIndex];
        return participant.rounds.findIndex(round =>
            round.scores.every(score => score === '' || score === null || score === undefined)
        );
    };

    const handleScoreInput = (value) => {
        if (participants.length === 0 || tempScores.length >= parseInt(competitionConfig.arrowsPerRound)) return;

        const scoreValue = value === 'M' ? 0 : parseInt(value);
        const newTempScores = [...tempScores, scoreValue];
        setTempScores(newTempScores);

        const emptyRoundIndex = getFirstEmptyRoundIndex(currentParticipantIndex);
        if (emptyRoundIndex !== -1 && newTempScores.length === parseInt(competitionConfig.arrowsPerRound)) {
            const newRounds = [...participants[currentParticipantIndex].rounds];
            newRounds[emptyRoundIndex] = {
                scores: newTempScores,
                sum: newTempScores.reduce((acc, val) => acc + val, 0)
            };
            updateScores(currentParticipantIndex, newRounds);

            let nextIndex = currentParticipantIndex + 1;
            let nextEmptyRound = getFirstEmptyRoundIndex(nextIndex);
            while (nextIndex < participants.length && nextEmptyRound === -1) {
                nextIndex++;
                nextEmptyRound = getFirstEmptyRoundIndex(nextIndex);
            }

            if (nextIndex < participants.length && nextEmptyRound !== -1) {
                setCurrentParticipantIndex(nextIndex);
                setTempScores([]);
            } else {
                setTempScores([]);
                setIsMenuOpen(false);
            }
        }
    };

    return (
        <>
            <CompetitionConfigDisplay config={competitionConfig} />
            <div className="series-navigation">
                <button
                    onClick={goToPreviousSeries}
                    disabled={currentSeries === 0}
                    className="btn"
                >
                    {t.previousSeries}
                </button>
                <span>Serie {currentSeries + 1} / {competitionConfig.series}</span>
                <button
                    onClick={goToNextSeries}
                    disabled={currentSeries === parseInt(competitionConfig.series) - 1}
                    className="btn"
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
                <button onClick={handleBackFromScoring} className="btn warning">
                    {t.configMenu}
                </button>
                <button onClick={handleMenu} className="btn">
                    {t.scorePhase}
                </button>
                <button onClick={goToMenu} className="btn info">
                    {t.onBack}
                </button>
            </div>
            {isMenuOpen && (
                <div className="menu-overlay">
                    <div className="menu-content">
                        <h3>{t.menuTitle || "Score Entry"}</h3>
                        {participants.length > 0 && currentParticipantIndex < participants.length ? (
                            <>
                                <p>{t.firstArcher || "Current Archer"}: {participants[currentParticipantIndex].name}</p>
                                <p>
                                    {t.currentRound || "Scoring Round"}: {getFirstEmptyRoundIndex(currentParticipantIndex) + 1 >= 0 ? getFirstEmptyRoundIndex(currentParticipantIndex) + 1 : t.allRoundsFilled || "All rounds filled"}
                                </p>
                                <p>{t.scores || "Scores"}: {tempScores.length > 0 ? tempScores.join(', ') : t.noScoresYet || "None yet"}</p>
                                {getFirstEmptyRoundIndex(currentParticipantIndex) !== -1 && (
                                    <ScoringKeyboard
                                        targetType={participants[currentParticipantIndex].targetType}
                                        onScoreSelect={handleScoreInput}
                                    />
                                )}
                            </>
                        ) : (
                            <p>{t.noParticipants || "No participants available or all scored"}</p>
                        )}
                        <button onClick={handleMenu} className="btn close">
                            {t.close || "Close"}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ScoringPhase;