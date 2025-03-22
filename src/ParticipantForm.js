// src/ParticipantForm.js
import React, { useState, useContext } from 'react';
import { LanguageContext } from './LanguageContext';

const ParticipantForm = ({ addParticipant }) => {
    const { t } = useContext(LanguageContext);
    const [name, setName] = useState('');
    const [targetType, setTargetType] = useState('');
    const [archerType, setArcherType] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim() && targetType && archerType) {
            addParticipant(name, targetType, archerType);
            setName('');
            setTargetType('');
            setArcherType('');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>{t.addArcher}</h2>
            <div>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.archerName}
                />
            </div>
            <div>
                <label>{t.targetType}: </label>
                <select value={targetType} onChange={(e) => setTargetType(e.target.value)}>
                    <option value="">{t.select}</option>
                    <option value="FITA 60cm (completa)">FITA 60cm (completa)</option>
                    <option value="FITA 80cm (reducida)">FITA 80cm (reducida)</option>
                    <option value="FITA 80cm (completa)">FITA 80cm (completa)</option>
                    <option value="FITA 122cm">FITA 122cm</option>
                    <option value="FITA Triple Vertical">FITA Triple Vertical</option>
                    <option value="FITA 40cm (completa)">FITA 40cm (completa)</option>
                    <option value="3D">3D</option>
                </select>
            </div>
            <div>
                <label>{t.archerType}: </label>
                <select value={archerType} onChange={(e) => setArcherType(e.target.value)}>
                    <option value="">{t.select}</option>
                    <option value="Tradicional">Tradicional</option>
                    <option value="Olímpico">Olímpico</option>
                    <option value="Compuesto">Compuesto</option>
                    <option value="Longbow">Longbow</option>
                    <option value="Desnudo">Desnudo</option>
                </select>
            </div>
            <button type="submit">{t.add}</button>
        </form>
    );
};

export default ParticipantForm;