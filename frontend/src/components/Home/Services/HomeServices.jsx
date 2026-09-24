import {Link} from "react-router-dom";
import {useTranslation} from "react-i18next";
import "./HomeServices.scss";

export function HomeServices() {
    const {t} = useTranslation()
    const services = [
        {
            id: 'cmm',
            title: t('home.services.items.cmm.title'),
            description: t('home.services.items.cmm.description'),
            link: '/servicos/cmm',
        },
        {
            id: 'reverse',
            title: t('home.services.items.reverse.title'),
            description: t('home.services.items.reverse.description'),
            link: '/servicos/engenharia-reversa',
        },
        {
            id: 'q-control',
            title: t('home.services.items.qcontrol.title'),
            description: t('home.services.items.qcontrol.description'),
            link: '/servicos/digitalizacao-3d',
        },
        {
            id: 'prototyping',
            title: t('home.services.items.prototyping.title'),
            description: t('home.services.items.prototyping.description'),
            link: '/servicos/engenharia-reversa',
        },
        {
            id: 'mro',
            title: t('home.services.items.mro.title'),
            description: t('home.services.items.mro.description'),
            link: '/servicos/confiabilidade-mro',
        },
        {
            id: 'training',
            title: t('home.services.items.training.title'),
            description: t('home.services.items.training.description'),
            link: '/servicos/confiabilidade-mro',
        },
    ];

    return (
        <section className="services-section home-section" id="servicos">
            <div className="home-services-container home-container">
                <div className="section-header">
                    <div className="section-eyebrow">
                        <span className="eyebrow-line"></span>
                        <span className="section-sub">{t('home.services.subtitle')}</span>
                    </div>
                    <h2 className="section-title">{t('home.services.mainTitle')}</h2>
                </div>

                <div className="services-grid">
                    {services.map((item) => (
                        <article key={item.id} className="technical-service-card home-frosted-card">
                            <div className="card-content">
                                <div className="card-header">
                                    <h3 className="service-title">{item.title}</h3>
                                </div>
                                <p className="service-description">{item.description}</p>
                            </div>

                            <div className="card-bottom">
                                <Link to={item.link} className="service-link">
                                    <span>{t('home.services.learnMore')}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                                         viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                         className="link-icon">
                                        <line x1="7" y1="17" x2="17" y2="7"></line>
                                        <polyline points="7 7 17 7 17 17"></polyline>
                                    </svg>
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}