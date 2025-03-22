// src/Scoreboard.js
import React, { useContext } from 'react';
import { LanguageContext } from './LanguageContext';

const Scoreboard = ({ participants }) => {
    const { t } = useContext(LanguageContext);

    return (
        <div>
            <h2>{t.results}</h2>
            {participants.length === 0 ? (
                <p>{t.noArchers}</p>
            ) : (
                <ul>
                    {participants.map((participant, index) => (
                        <li key={index}>
                            {participant.name} ({participant.archerType}, {participant.targetType}) - Total: {participant.total}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Scoreboard;