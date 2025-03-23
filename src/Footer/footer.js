import "./footer.css"

function Footer() {

    const { version } = require('../../package.json');

    return (
        <div className="footer">
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
        </div>
    );
}

export default Footer;