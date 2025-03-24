import Scoreboard from "../Scoreboard";
import ScoreInput from "./ScoreInput";
import CompetitionConfigDisplay from "../CompetitionConfigDisplay";

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
                <button onClick={goToMenu} className="btn info">
                    {t.onBack}
                </button>
            </div>
        </>
    );
};

export default ScoringPhase;