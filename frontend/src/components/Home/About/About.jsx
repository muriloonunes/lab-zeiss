import './About.scss';
import {useTranslation} from "react-i18next";

export function About() {
    const {t} = useTranslation();

    const highlights = [
        {
            value: t('whyUs.highlights.exclusivity.value'),
            label: t('whyUs.highlights.exclusivity.label'),
            detail: t('whyUs.highlights.exclusivity.detail')
        },
        {
            value: t('whyUs.highlights.accessibility.value'),
            label: t('whyUs.highlights.accessibility.label'),
            detail: t('whyUs.highlights.accessibility.detail')
        },
        {
            value: t('whyUs.highlights.standard.value'),
            label: t('whyUs.highlights.standard.label'),
            detail: t('whyUs.highlights.standard.detail')
        },
        {
            value: t('whyUs.highlights.accuracy.value'),
            label: t('whyUs.highlights.accuracy.label'),
            detail: t('whyUs.highlights.accuracy.detail')
        }
    ];

    return (
        <section className="about-section home-section" id="sobre">
            <div className="blob-container" aria-hidden="true">
                <div className="blob blob--about"></div>
            </div>
            <div className="about-container home-container">
                <div className="section-header">
                    <div className="section-eyebrow">
                        <span className="eyebrow-line"></span>
                        <span className="section-sub">{t('whyUs.subtitle')}</span>
                    </div>
                    <div className="about-header-content section-header-split">
                        <h2 className="section-title">{t('whyUs.mainTitle')}</h2>
                        <p className="about-description section-description">{t('whyUs.description')}</p>
                    </div>
                </div>

                <div className="about-metrics-grid">
                    {highlights.map((item, index) => (
                        <article key={index} className="about-metric-card home-frosted-card">
                            <div className="metric-header">
                                <span className="metric-value">{item.value}</span>
                            </div>
                            <div className="card-content">
                                <h3 className="metric-label">{item.label}</h3>
                                <p className="metric-detail">{item.detail}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}