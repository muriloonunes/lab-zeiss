import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QuoteButton } from "../../QuoteButton/QuoteButton.jsx";
import "./CTA.scss";

export function CTA() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <section className="cta-section home-section" id="orcamento" aria-labelledby="cta-heading">
            <div className="blob-container" aria-hidden="true">
                <div className="blob blob--cta"></div>
            </div>
            <div className="cta-container home-container">
                <article className="cta-card home-frosted-card">
                    <div className="cta-content">
                        <h2 id="cta-heading" className="cta-title">{t('cta.title')}</h2>
                        <p className="cta-description">{t('cta.description')}</p>
                    </div>

                    <div className="cta-actions">
                        <QuoteButton onClick={() => navigate('/contato')}>
                            {t('cta.requestQuote')}
                        </QuoteButton>
                        <Link to="/servicos" className="btn-mais">
                            <span>{t('cta.exploreServices')}</span>
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
                </article>
            </div>
        </section>
    );
}