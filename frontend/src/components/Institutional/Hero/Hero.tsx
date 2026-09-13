import { useTranslation } from 'react-i18next';
import './Hero.scss';

export function Hero() {
    const { t } = useTranslation();

    return (
        <section className="inst-hero-section">
            <div className="inst-container">
                <div className="inst-hero-grid">
                    <div className="inst-hero-content">
                        <h1 className="inst-hero-title">
                            {t('institutional.hero.title')}
                        </h1>
                        <p className="inst-hero-description">
                            {t('institutional.hero.description')}
                        </p>
                    </div>

                    <div className="inst-hero-visual">
                        <div className="inst-facade-card glass-panel">
                            <div className="facade-image-wrapper">
                                <img
                                    src="/images/Lab-Fachada-3.jpg"
                                    alt={t('institutional.hero.imageAlt')}
                                    width="580"
                                    height="400"
                                    className="facade-img"
                                />
                                <div className="facade-overlay-gradient"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
