import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const exportToPDF = (competition, t) => {
    const doc = new jsPDF();
    const margin = 20;

    doc.setFontSize(14);
    doc.text(`Archery Scorer (https://alejandro-diazro.github.io/archery-scorer/)`, margin, 15);
    doc.setFontSize(10);
    doc.text(`Competition Name: ${competition.name}`, margin, 25);
    doc.text(`Location: ${competition.location}`, margin, 30);
    doc.text(`Date: ${competition.date}`, margin, 35);
    doc.text(`Rounds per Series: ${competition.rounds}`, margin, 40);
    doc.text(`Arrows per Round: ${competition.arrowsPerRound}`, margin, 45);
    doc.text(`Total Series: ${competition.series}`, margin, 50);

    let yPosition = 60;

    competition.participants.forEach((participant, index) => {
        doc.setFontSize(12);
        doc.text(`${participant.name} (${participant.archerType}, ${participant.targetType})`, margin, yPosition);
        yPosition += 5;

        let grandTotalScore = 0;
        let grandTotalTens = 0;
        let grandTotalNines = 0;

        for (let seriesIndex = 0; seriesIndex < competition.series; seriesIndex++) {
            doc.setFontSize(11);
            doc.text(`Series ${seriesIndex + 1}`, margin, yPosition);
            yPosition += 5;

            let seriesTotalScore = 0;
            let seriesTotalTens = 0;
            let seriesTotalNines = 0;

            let tableData = [];
            let tableHeaders = ['Round'];

            for (let i = 1; i <= parseInt(competition.arrowsPerRound); i++) {
                tableHeaders.push(`Arrow ${i}`);
            }
            tableHeaders.push('Sum', 'Total', participant.targetType === '3D' ? '11s' : '10s', participant.targetType === '3D' ? '10s' : '9s');

            participant.rounds
                .filter((_, roundIndex) => Math.floor(roundIndex / competition.rounds) === seriesIndex)
                .forEach((round, roundIndex) => {
                    const tens = round.scores.filter(score => parseInt(score) === (participant.targetType === '3D' ? 11 : 10)).length;
                    const nines = round.scores.filter(score => parseInt(score) === (participant.targetType === '3D' ? 10 : 9)).length;

                    seriesTotalTens += tens;
                    seriesTotalNines += nines;
                    seriesTotalScore += round.sum || 0;

                    let row = [roundIndex + 1];
                    row.push(...round.scores.map(score => score === '' || score == null || isNaN(parseInt(score)) || parseInt(score) === 0 ? 'M' : score.toString()));
                    row.push(round.sum || 0, seriesTotalScore, tens, nines);
                    tableData.push(row);
                });

            autoTable(doc, {
                startY: yPosition,
                head: [tableHeaders],
                body: tableData,
                theme: 'grid',
                styles: { fontSize: 10, textColor: [0, 0, 0] },
                headStyles: { fillColor: [25, 118, 210] },
                alternateRowStyles: { fillColor: [240, 240, 240] },
                margin: { left: margin, right: margin },
                didParseCell: function (data) {
                    if (data.section === 'body' && data.column.index > 0 && data.column.index <= parseInt(competition.arrowsPerRound)) {
                        let score = parseInt(data.cell.text);
                        if (!isNaN(score)) {
                            if (score >= 9) {
                                data.cell.styles.textColor = [255, 152, 0];
                            } else if (score === 8 || score === 7) {
                                data.cell.styles.textColor = [244, 67, 54];
                            } else if (score === 6 || score === 5) {
                                data.cell.styles.textColor = [33, 150, 243];
                            }
                        } else if (data.cell.text === 'M') {
                            data.cell.styles.textColor = [0, 0, 0];
                        }
                    }
                }
            });

            yPosition = doc.lastAutoTable.finalY + 5;

            doc.setFontSize(10);
            doc.text(
                `Series ${seriesIndex + 1} Total: ${seriesTotalScore} | ` +
                `${participant.targetType === '3D' ? '11s' : '10s'}: ${seriesTotalTens} | ` +
                `${participant.targetType === '3D' ? '10s' : '9s'}: ${seriesTotalNines}`,
                margin, yPosition
            );

            yPosition += 10;

            grandTotalScore += seriesTotalScore;
            grandTotalTens += seriesTotalTens;
            grandTotalNines += seriesTotalNines;
        }

        doc.setFontSize(12);
        doc.text(
            `TOTAL FINAL: ${grandTotalScore} | ` +
            `${participant.targetType === '3D' ? '11s' : '10s'}: ${grandTotalTens} | ` +
            `${participant.targetType === '3D' ? '10s' : '9s'}: ${grandTotalNines}`,
            margin, yPosition
        );

        yPosition += 5;

        if (index < competition.participants.length - 1) {
            doc.setDrawColor(150);
            doc.line(margin, yPosition, 190, yPosition);
            yPosition += 10;
        }
    });

    doc.save(`${competition.name.replace(/\s+/g, '_')}_scores.pdf`);
};

export default exportToPDF;
