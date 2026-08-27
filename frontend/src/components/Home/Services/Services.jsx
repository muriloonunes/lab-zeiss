import {Link} from "react-router-dom";
import {useTranslation} from "react-i18next";

export function Services() {
    const {t} = useTranslation()
    const services = [
        {
            id: 'cmm',
            title: t('services.items.cmm.title'),
            description: t('services.items.cmm.description'),
        },
        {
            id: 'reverse',
            title: t('services.items.reverse.title'),
            description: t('services.items.reverse.description'),
        },
        {
            id: 'q-control',
            title: t('services.items.qcontrol.title'),
            description: t('services.items.qcontrol.description'),
        },
    ];

    const renderIcon = (id) => {
        switch (id) {
            case 'cmm':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path
                            d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        <circle cx="12" cy="12" r="2" fill="currentColor"></circle>
                    </svg>
                );
            case 'reverse':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                        <polyline points="2 17 12 22 22 17"></polyline>
                        <polyline points="2 12 12 17 22 12"></polyline>
                        <path d="M12 2v20"></path>
                    </svg>
                );
            case 'q-control':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="22" y1="12" x2="18" y2="12"></line>
                        <line x1="6" y1="12" x2="2" y2="12"></line>
                        <line x1="12" y1="6" x2="12" y2="2"></line>
                        <line x1="12" y1="22" x2="12" y2="18"></line>
                        <polyline points="9 12 11 14 15 10"></polyline>
                    </svg>
                );
            default:
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                );
        }
    };

    return (
        <section className="services-section" id="servicos">
            <div className="services-container">
                <div className="section-header">
                    <h2 className="section-sub">{t('services.subtitle')}</h2>
                    <p className="section-title">{t('services.mainTitle')}</p>
                </div>
                <div className="services-grid">
                    {services.map((item) => (
                        <article key={item.id} className="glass-card service-card">
                            <div className="service-card-header">
                                <div className="service-icon-box">
                                    {renderIcon(item.id)}
                                </div>
                            </div>
                            <div className="service-card-body">
                                <h3 className="service-title">{item.title}</h3>
                                <p className="service-description">{item.description}</p>
                            </div>
                            <div className="service-card-footer">
                                <Link to="/servicos" className="service-link">
                                    <span>{t('services.learnMore')}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                         viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                         strokeLinejoin="round" className="link-icon">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
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