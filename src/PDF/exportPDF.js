import jsPDF from 'jspdf';

const exportToPDF = (competition, t) => {
    const doc = new jsPDF();
    const pageHeight = 297;
    const pageWidth = 210;
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    doc.setFontSize(18);
    doc.text(`${competition.name} - Scores`, margin, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.text(`Location: ${competition.location}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Date: ${competition.date}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Rounds per Series: ${competition.rounds}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Arrows per Round: ${competition.arrowsPerRound}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Series: ${competition.series}`, margin, yPosition);
    yPosition += 5;

    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    competition.participants.forEach((participant) => {
        if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = margin;
        }

        doc.setFontSize(14);
        const participantHeader = `${participant.name} (${participant.archerType}, ${participant.targetType})`;
        const participantLines = doc.splitTextToSize(participantHeader, maxWidth);
        doc.text(participantLines, margin, yPosition);
        yPosition += participantLines.length * 7;

        const maxRounds = parseInt(competition.rounds) * parseInt(competition.series);
        const roundsPerSeries = parseInt(competition.rounds);
        const seriesCount = parseInt(competition.series);

        for (let seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
            if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = margin;
            }

            const startRound = seriesIndex * roundsPerSeries;
            const endRound = (seriesIndex + 1) * roundsPerSeries;
            const seriesRounds = participant.rounds.slice(startRound, endRound);

            if (seriesRounds.length > 0) {
                doc.setFontSize(12);
                doc.text(`Series ${seriesIndex + 1}`, margin, yPosition);
                yPosition += 5;

                let tableHeader = 'Round | ';
                for (let i = 1; i <= parseInt(competition.arrowsPerRound); i++) {
                    tableHeader += `Arrow ${i} | `;
                }
                tableHeader += `Sum | Total | ${participant.targetType === '3D' ? '11s' : '10s'} | ${participant.targetType === '3D' ? '10s' : '9s'}`;
                const headerLines = doc.splitTextToSize(tableHeader, maxWidth);
                doc.text(headerLines, margin, yPosition);
                yPosition += headerLines.length * 5;

                seriesRounds.forEach((round, roundIndex) => {
                    if (yPosition > pageHeight - 20) {
                        doc.addPage();
                        yPosition = margin;
                    }

                    const globalRoundIndex = startRound + roundIndex;
                    const tens = round.scores.filter((score) => parseInt(score) === (participant.targetType === '3D' ? 11 : 10)).length;
                    const nines = round.scores.filter((score) => parseInt(score) === (participant.targetType === '3D' ? 10 : 9)).length;
                    const seriesTotal = participant.rounds
                        .slice(startRound, globalRoundIndex + 1)
                        .reduce((acc, r) => acc + (r.sum || 0), 0);

                    let rowText = `${roundIndex + 1}     | `;
                    round.scores.forEach((score) => {
                        const displayScore = score === '' ? 'M' : score.toString();
                        rowText += `${displayScore.padStart(2, ' ')}       | `;
                    });
                    rowText += `${(round.sum || 0).toString().padStart(3, ' ')} | ${seriesTotal.toString().padStart(5, ' ')} | ${tens}   | ${nines}`;
                    const rowLines = doc.splitTextToSize(rowText, maxWidth);
                    doc.text(rowLines, margin, yPosition);
                    yPosition += rowLines.length * 5;
                });

                if (yPosition > pageHeight - 20) {
                    doc.addPage();
                    yPosition = margin;
                }
                const seriesSubtotal = seriesRounds.reduce((acc, round) => acc + (round.sum || 0), 0);
                const subtotalText = `Subtotal Series ${seriesIndex + 1}: ${seriesSubtotal}`;
                const subtotalLines = doc.splitTextToSize(subtotalText, maxWidth);
                doc.text(subtotalLines, margin, yPosition);
                yPosition += subtotalLines.length * 5 + 5;
            }
        }

        if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = margin;
        }
        const totalHighScore1 = participant.rounds.reduce((acc, round) => acc + round.scores.filter((score) => parseInt(score) === (participant.targetType === '3D' ? 11 : 10)).length, 0);
        const totalHighScore2 = participant.rounds.reduce((acc, round) => acc + round.scores.filter((score) => parseInt(score) === (participant.targetType === '3D' ? 10 : 9)).length, 0);
        doc.setFontSize(12);
        const totalText = `Total: ${participant.total || 0} | ${participant.targetType === '3D' ? '11s' : '10s'}: ${totalHighScore1} | ${participant.targetType === '3D' ? '10s' : '9s'}: ${totalHighScore2}`;
        const totalLines = doc.splitTextToSize(totalText, maxWidth);
        doc.text(totalLines, margin, yPosition);
        yPosition += totalLines.length * 5 + 5;

        if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = margin;
        }
        doc.setLineWidth(0.2);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
    });

    doc.save(`${competition.name.replace(/\s+/g, '_')}_scores.pdf`);
};

export default exportToPDF;