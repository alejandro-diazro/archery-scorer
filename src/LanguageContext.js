// src/LanguageContext.js
import React, { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

const translations = {
    en: {
        welcome: "Welcome to Archery Scorer",
        theme: "Theme",
        light: "Light",
        dark: "Dark",
        savedCompetitions: "Saved Competitions",
        noSavedCompetitions: "No saved competitions.",
        createNewCompetition: "Create New Competition",
        load: "Load",
        delete: "Delete",
        configureCompetition: "Configure Competition",
        competitionName: "Competition Name",
        location: "Location",
        date: "Date",
        roundsPerSeries: "Rounds per Series",
        arrowsPerRound: "Arrows per Round",
        series: "Series",
        saveConfiguration: "Save Configuration",
        competitionConfig: "Competition Configuration",
        addArcher: "Add Archer",
        archerName: "Archer Name",
        targetType: "Target Type",
        select: "Select",
        archerType: "Archer Type",
        add: "Add",
        registeredArchers: "Registered Archers",
        noArchers: "No archers registered yet.",
        startScoring: "Start Scoring",
        seriesLabel: "Series",
        sum: "Sum",
        total: "Tot",
        totalFinal: "Total Final",
        results: "Results",
        resetAll: "Reset All",
        previousSeries: "Previous Series",
        nextSeries: "Next Series",
    },
    es: {
        welcome: "Bienvenido a Archery Scorer",
        theme: "Tema",
        light: "Claro",
        dark: "Oscuro",
        savedCompetitions: "Partidas Guardadas",
        noSavedCompetitions: "No hay partidas guardadas.",
        createNewCompetition: "Crear Nueva Partida",
        load: "Cargar",
        delete: "Eliminar",
        configureCompetition: "Configurar Tirada",
        competitionName: "Nombre de la Competición",
        location: "Lugar",
        date: "Fecha",
        roundsPerSeries: "Rondas por Serie",
        arrowsPerRound: "Flechas por Ronda",
        series: "Series",
        saveConfiguration: "Guardar Configuración",
        competitionConfig: "Configuración de la Tirada",
        addArcher: "Añadir Arquero",
        archerName: "Nombre del Arquero",
        targetType: "Tipo de Diana",
        select: "Selecciona",
        archerType: "Tipo de Arquero",
        add: "Añadir",
        registeredArchers: "Arqueros Registrados",
        noArchers: "No hay arqueros registrados aún.",
        startScoring: "Comenzar Puntuación",
        seriesLabel: "Serie",
        sum: "Suma",
        total: "Tot",
        totalFinal: "Total Final",
        results: "Resultados",
        resetAll: "Resetear Todo",
        previousSeries: "Serie Anterior",
        nextSeries: "Serie Siguiente",
    },
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        const savedLanguage = localStorage.getItem('language');
        return savedLanguage || 'es';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
            {children}
        </LanguageContext.Provider>
    );
};