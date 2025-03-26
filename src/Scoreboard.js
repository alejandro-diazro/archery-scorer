import React, { useContext } from 'react';
import { LanguageContext } from './LanguageContext';

const Scoreboard = ({ participants, teamMode }) => {
    const { t } = useContext(LanguageContext);

    const teams = teamMode
        ? participants.reduce((acc, participant) => {
            const teamName = participant.teamName || 'Sin equipo';
            if (!acc[teamName]) {
                acc[teamName] = {
                    name: teamName,
                    total: 0,
                    members: [],
                };
            }
            acc[teamName].members.push(participant);
            acc[teamName].total += participant.total;
            return acc;
        }, {})
        : null;

    return (
        <div>
            <h2>{t.results}</h2>
            {participants.length === 0 ? (
                <p>{t.noArchers}</p>
            ) : teamMode ? (
                <ul>
                    {Object.values(teams).map((team, index) => (
                        <li key={index}>
                            <strong>{team.name} - Total: {team.total}</strong>
                            <ul>
                                {team.members.map((member, mIndex) => (
                                    <li key={mIndex}>
                                        {member.name} ({member.archerType}, {member.targetType}) - {member.total}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            ) : (
                <ul>
                    {participants.map((participant, index) => (
                        <li key={index}>
                            {participant.name} ({participant.archerType}, {participant.targetType}) - Total:{' '}
                            {participant.total}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Scoreboard;