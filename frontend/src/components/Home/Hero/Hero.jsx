import {useTranslation} from "react-i18next";
import './Hero.scss';
import {QuoteButton} from '../../QuoteButton/QuoteButton.jsx';

export function HeroSection() {
    const {t} = useTranslation();

    const handleScrollToServices = () => {
        const servicesSection = document.getElementById('servicos');
        if (servicesSection) {
            servicesSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="hero-section" id="hero">
            <div className="blob-container" aria-hidden="true">
                <div className="blob blob--right"></div>
                <div className="blob blob--left"></div>
            </div>
            <div className="hero-container">
                <div className="hero-content">
                    <h1 className="hero-title">
                        <span className="title-sub">{t('home.hero.welcome')}</span>
                        <span className="title-main">{t('home.hero.title')}</span>
                    </h1>
                    <p className="hero-description">
                        {t('home.hero.description')}
                    </p>
                    <div className="hero-actions">
                        <QuoteButton />
                        <button type="button" className="btn-mais" onClick={handleScrollToServices}>
                            <span>{t('home.hero.exploreServices')}</span>
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