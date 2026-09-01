import './Footer.scss';
import {Link} from 'react-router-dom';
import {useTranslation} from "react-i18next";

export function Footer() {
    const {t} = useTranslation()

    return (
        <footer className="footer-wrapper">
            <div className="footer-container">
                <div className="footer-main-grid">
                    <div className="footer-col brand-col">
                        <img
                            src="/images/cem-logo.png"
                            alt="Centro de Excelência em Metrologia SENAI ZEISS"
                            width="160"
                            height="40"
                            className="footer-logo"
                        />
                        <p className="footer-brand-desc">
                            Inovação, conformidade dimensional e excelência metrológica com tecnologia alemã ZEISS e
                            suporte técnico SENAI.
                        </p>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-col-title">Navegação</h4>
                        <ul className="footer-links">
                            <li><Link to="/institucional">{t('nav.institutional')}</Link></li>
                            <li><Link to="/servicos">{t('nav.services')}</Link></li>
                            <li><Link to="/contato">{t('nav.contact')}</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-col-title">Localização</h4>
                        <address className="footer-address">
                            Faculdade SENAI Ítalo Bologna<br/>
                            Rua Armogaste José da Silveira, 612 <br/>
                            Setor Centro-Oeste — Goiânia, GO, Brasil<br/>
                            <a
                                href="https://maps.app.goo.gl/u1RjodjSAJd9eu6a7"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="maps-external-link"
                            >
                                <span>Ver no Google Maps</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                     strokeLinejoin="round">
                                    <line x1="7" y1="17" x2="17" y2="7"></line>
                                    <polyline points="7 7 17 7 17 17"></polyline>
                                </svg>
                            </a>
                        </address>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-col-title">Contato</h4>
                        <p><strong>Telefone:</strong> (62) 3226-4500</p>
                        <p className="contact-hours">Seg. a Sex. das 08h às 18h</p>
                    </div>
                </div>
                <div className="footer-bottom-bar">
                    <p>© {new Date().getFullYear()} Centro de Excelência em Metrologia SENAI / ZEISS. Todos os direitos reservados.</p>
                    <p className="partnership-tag">Sistema FIEG • SENAI Goiás • Carl Zeiss</p>
                </div>
            </div>
        </footer>
    );
}