import {useTranslation} from "react-i18next";
import './Hero.scss';

export function HeroSection() {
    const {t} = useTranslation()

    return (
        <section className="hero-section">
            <div className="blob-container" aria-hidden="true">
                <div className="blob blob--right"></div>
                <div className="blob blob--left"></div>
            </div>
            <div className="hero-container">
                <div className="hero-content">
                    <h1 className="hero-title">
                        <span className="title-sub">{t('hero.welcome')}</span>
                        <span className="title-main">{t('hero.title')}</span>
                    </h1>
                    <p className="hero-description">
                        {t('hero.description')}
                    </p>
                    <div className="hero-actions">
                        <button type="button" className="btn-orcamento">
                            <span>{t('nav.requestQuote')}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                 fill="none"
                                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                 strokeLinejoin="round" className="btn-icon">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </button>
                        <button type="button" className="btn-mais">
                            <span>{t('hero.exploreServices')}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                 fill="none"
                                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                 strokeLinejoin="round" className="btn-icon">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <polyline points="19 12 12 19 5 12"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="glass-image-wrapper">
                        <img
                            src="/images/Senai-Laboratorio-2.jpg"
                            alt="Laboratório de Metrologia SENAI e ZEISS"
                            width="640"
                            height="460"
                            className="hero-image"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}