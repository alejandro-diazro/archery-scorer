import ParticipantList from "./ParticipantList";
import ParticipantForm from "./ParticipantForm";
import CompetitionConfigDisplay from "../CompetitionConfigDisplay";
import './Participant.css'

const RegistrationPhase = ({
                               competitionConfig,
                               t,
                               addParticipant,
                               handleBackFromRegistration,
                               startScoring,
                               participants,
                               deleteParticipant,
                               resetStorage
                           }) => {
    return (
        <>
            <div className="competition-config-page-wrapper">
                <div className="competition-config-page">
                    <CompetitionConfigDisplay config={competitionConfig}/>
                    <ParticipantForm addParticipant={addParticipant}/>
                    <div className="registration-actions">
                        <button onClick={startScoring} className="btn warning">
                            {t.startScoring}
                        </button>
                    </div>
                    <ParticipantList participants={participants} onDeleteParticipant={deleteParticipant}/>
                    <button onClick={resetStorage} className="btn info">
                        {t.onBack}
                    </button>
                </div>
            </div>
        </>
        );
    };

    export default RegistrationPhase;