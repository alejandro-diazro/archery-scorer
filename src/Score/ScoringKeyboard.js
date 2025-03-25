import './Score.css'
export const getScoreConstraints = (targetType) => {
    switch (targetType) {
        case 'FITA 80cm (reducida)':
            return { min: 0, max: 10, allowed: [0, 5, 6, 7, 8, 9, 10] };
        case 'FITA Triple Vertical':
            return { min: 0, max: 10, allowed: [0, 6, 7, 8, 9, 10] };
        case '3D':
            return { min: 0, max: 11, allowed: [0, 5, 8, 10, 11] };
        case 'FITA 60cm (completa)':
        case 'FITA 80cm (completa)':
        case 'FITA 122cm':
        case 'FITA 40cm (completa)':
        default:
            return { min: 0, max: 10, allowed: Array.from({ length: 11 }, (_, i) => i) };
    }
};

export const getButtonClassName = (score) => {
    const numScore = score === 'M' ? 0 : parseInt(score); // Treat 'M' as 0 for color
    switch (numScore) {
        case 11:
        case 10:
        case 9:
            return 'score-button yellow';
        case 8:
        case 7:
            return 'score-button red';
        case 6:
        case 5:
            return 'score-button blue';
        case 4:
        case 3:
            return 'score-button black';
        case 2:
        case 1:
        case 0: // 'M' falls here
            return 'score-button white';
        default:
            return 'score-button';
    }
};

const ScoringKeyboard = ({ targetType, onScoreSelect, onClose }) => {
    const constraints = getScoreConstraints(targetType);

    return (
        <div className="custom-keyboard">
            {constraints.allowed
                .filter((score) => score !== 0)
                .sort((a, b) => b - a)
                .map((score) => (
                    <button
                        key={score}
                        onClick={() => onScoreSelect(score.toString())}
                        className={getButtonClassName(score)}
                    >
                        {score}
                    </button>
                ))}
            <button
                onClick={() => onScoreSelect('M')}
                className={getButtonClassName('M')}
            >
                M
            </button>
            {onClose && (
                <button onClick={onClose} className="score-button close">
                    Cerrar
                </button>
            )}
        </div>
    );
};

export default ScoringKeyboard;