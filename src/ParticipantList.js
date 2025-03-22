// src/ParticipantList.js
import React, { useContext } from 'react';
import { LanguageContext } from './LanguageContext';

const ParticipantList = ({ participants, onDeleteParticipant }) => {
    const { t } = useContext(LanguageContext);

    return (
        <div>
            <h3>{t.registeredArchers}</h3>
            {participants.length === 0 ? (
                <p>{t.noArchers}</p>
            ) : (
                <ul>
                    {participants.map((participant, index) => (
                        <li key={index}>
                            {participant.name} ({participant.archerType}, {participant.targetType})
                            <button
                                onClick={() => onDeleteParticipant(index)}
                                className="delete-participant-button"
                            >
                                {t.delete}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ParticipantList;