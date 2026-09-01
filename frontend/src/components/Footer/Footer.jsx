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
                        <p className="footer-brand-desc">{t('footer.brandDesc')}</p>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-col-title">{t('footer.navigationTitle')}</h4>
                        <ul className="footer-links">
                            <li><Link to="/institucional">{t('nav.institutional')}</Link></li>
                            <li><Link to="/servicos">{t('nav.services')}</Link></li>
                            <li><Link to="/contato">{t('nav.contact')}</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-col-title">{t('footer.locationTitle')}</h4>
                        <address className="footer-address">
                            {t('footer.facility')}<br/>
                            {t('footer.street')}<br/>
                            {t('footer.city')}<br/>
                            <a
                                href="https://maps.app.goo.gl/u1RjodjSAJd9eu6a7"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="maps-external-link"
                            >
                                <span>{t('footer.viewOnMaps')}</span>
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
                        <h4 className="footer-col-title">{t('footer.contactsTitle')}</h4>

                        <div className="footer-contact-group">
                            <span className="contact-label">{t('footer.labCoordination')}</span>
                            <p className="contact-entry">
                                <strong>{t('footer.techLead')}:</strong>{' '}
                                <a href="tel:+55629XXXXXXXX" className="contact-link">
                                    (62) 9XXXX-XXXX
                                </a>
                            </p>
                            <p className="contact-entry">
                                <strong>{t('footer.email')}:</strong>{' '}
                                <a href="mailto:metrologia.zeiss@senaigo.com.br" className="contact-link">
                                    metrologia.zeiss@senaigo.com.br
                                </a>
                            </p>
                        </div>

                        <div className="footer-contact-group mt-sub">
                            <span className="contact-label">SENAI Ítalo Bologna</span>
                            <p className="contact-entry">
                                <strong>{t('footer.phone')}:</strong>{' '}
                                <a href="tel:+556232264500" className="contact-link">
                                    (62) 3226-4500
                                </a>
                            </p>
                            <p className="contact-entry">
                                <strong>WhatsApp:</strong> {' '}
                                <a href="https://wa.me/556299951773" target="_blank" rel="noopener noreferrer"
                                   className="contact-link">
                                    (62) 9995-1773
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom-bar">
                    <p>© {new Date().getFullYear()} {t('hero.title')}. {t('footer.rights')}</p>
                    <p className="partnership-tag">{t('footer.partnership')}</p>
                </div>
            </div>
        </footer>
    );
}