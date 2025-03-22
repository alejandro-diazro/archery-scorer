import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';
import AppContent from './AppContent';
import './App.css';

function Footer() {

    const { version } = require('../package.json');

    return (
        <footer className="app-footer">
            <p>
                Made by{' '}
                <a
                    href="https://x.com/DiazroDev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-link"
                >
                    DiazroDev
                </a>{' '}
                | Version {version}
            </p>
        </footer>
    );
}

export default Footer;