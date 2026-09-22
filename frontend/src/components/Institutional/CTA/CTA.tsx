import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QuoteButton } from '../../QuoteButton/QuoteButton';
import './CTA.scss';

export function CTA() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <section className="inst-section inst-cta-section">
            <div className="inst-container">
                <div className="inst-cta-card glass-panel">
                    <div className="inst-cta-content">
                        <div className="inst-eyebrow">
                            <span className="inst-eyebrow-line"></span>
                            <span className="inst-eyebrow-text">{t('institutional.cta.eyebrow')}</span>
                        </div>
                        <h2 className="inst-cta-title">
                            {t('institutional.cta.title')}
                        </h2>
                        <p className="inst-cta-desc">
                            {t('institutional.cta.description')}
                        </p>
                    </div>
                    <div className="inst-cta-actions">
                        <QuoteButton onClick={() => navigate('/contato')}>
                            {t('institutional.cta.requestContact')}
                        </QuoteButton>
                        <Link to="/servicos" className="btn-mais">
                            <span>{t('institutional.cta.exploreServices')}</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="btn-icon"
                                aria-hidden="true"
                            >
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
