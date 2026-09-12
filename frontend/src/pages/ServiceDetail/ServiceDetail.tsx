import {useScrollToTop} from "../../hooks/useScrollToTop";
import {Link, Navigate, useNavigate, useParams} from "react-router-dom";
import {servicesData} from "../../data/ServicesData";
import {ImageCarousel} from "../../components/ImageCarousel/ImageCarousel";
import {QuoteButton} from "../../components/QuoteButton/QuoteButton";
import "./ServiceDetail.scss";
import {useTranslation} from "react-i18next";

export function ServiceDetail() {
    useScrollToTop();
    const {serviceId} = useParams<{ serviceId: string }>();
    const navigate = useNavigate();
    const {t} = useTranslation();

    const serviceData = serviceId ? servicesData[serviceId] : null;

    if (!serviceData || !serviceId) {
        return <Navigate to="/servicos" replace/>;
    }

    const title = t(`serviceDetail.services.${serviceId}.title`, {defaultValue: serviceData.title});
    const categoryTag = t(`serviceDetail.services.${serviceId}.categoryTag`, {defaultValue: serviceData.categoryTag});
    const headline = t(`serviceDetail.services.${serviceId}.headline`, {defaultValue: serviceData.headline});
    const overview = t(`serviceDetail.services.${serviceId}.overview`, {defaultValue: serviceData.overview});

    const targetAudience = t(`serviceDetail.services.${serviceId}.targetAudience`, {
        returnObjects: true,
        defaultValue: serviceData.targetAudience
    }) as string[];

    const applications = t(`serviceDetail.services.${serviceId}.applications`, {
        returnObjects: true,
        defaultValue: serviceData.applications
    }) as string[];

    const deliverables = t(`serviceDetail.services.${serviceId}.deliverables`, {
        returnObjects: true,
        defaultValue: serviceData.deliverables
    }) as string[];

    const machines = t(`serviceDetail.services.${serviceId}.machines`, {
        returnObjects: true,
        defaultValue: serviceData.machines
    }) as Array<{
        name: string;
        category: string;
        volume: string;
        accuracy: string;
        sensor: string;
        software: string;
        features: string[];
    }>;

    return (
        <div className="service-detail-page">
            <div className="detail-blob-container" aria-hidden="true">
                <div className="detail-blob detail-blob--top"></div>
                <div className="detail-blob detail-blob--bottom"></div>
            </div>

            {/* Hero */}
            <section className="detail-hero-section">
                <div className="detail-container">
                    <nav className="detail-breadcrumb" aria-label="Breadcrumb">
                        <Link to="/servicos">{t('serviceDetail.breadcrumb', 'Serviços')}</Link>
                        <span className="separator">/</span>
                        <span className="current">{title}</span>
                    </nav>

                    <div className="detail-hero-grid">
                        <div className="detail-hero-content">
                            <span className="detail-tag">{categoryTag}</span>
                            <h1 className="detail-title">{title}</h1>
                            <p className="detail-headline">{headline}</p>
                            <p className="detail-overview">{overview}</p>

                            <div className="detail-hero-actions">
                                <QuoteButton onClick={() => navigate('/contato')}>
                                    {t('serviceDetail.actions.requestQuote', 'Solicitar Cotação para este Serviço')}
                                </QuoteButton>
                                <a href="#especificacoes" className="btn-mais">
                                    <span>{t('serviceDetail.actions.viewSpecs', 'Ver Especificações Técnicas')}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon" aria-hidden="true">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <polyline points="19 12 12 19 5 12"></polyline>
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div className="detail-hero-visual">
                            <div className="detail-carousel-card glass-panel">
                                <ImageCarousel images={serviceData.galleryImages}/>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Scope (3 Colunas) */}
            <section className="detail-scope-section">
                <div className="detail-container">
                    <div className="scope-cards-grid">
                        <div className="scope-card glass-panel">
                            <div className="scope-card-header">
                                <span className="scope-icon-wrap" aria-hidden="true">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                </span>
                                <h2 className="scope-title">{t('serviceDetail.sections.audienceTitle', 'Público-Alvo & Segmentos')}</h2>
                            </div>
                            <ul className="scope-list">
                                {targetAudience.map((item, i) => (
                                    <li key={i}><span className="scope-dot"></span><span>{item}</span></li>
                                ))}
                            </ul>
                        </div>

                        <div className="scope-card glass-panel">
                            <div className="scope-card-header">
                                <span className="scope-icon-wrap" aria-hidden="true">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                                        <polyline points="2 17 12 22 22 17"></polyline>
                                        <polyline points="2 12 12 17 22 12"></polyline>
                                    </svg>
                                </span>
                                <h2 className="scope-title">{t('serviceDetail.sections.applicationsTitle', 'Aplicações Típicas')}</h2>
                            </div>
                            <ul className="scope-list">
                                {applications.map((item, i) => (
                                    <li key={i}><span className="scope-dot"></span><span>{item}</span></li>
                                ))}
                            </ul>
                        </div>

                        <div className="scope-card glass-panel">
                            <div className="scope-card-header">
                                <span className="scope-icon-wrap" aria-hidden="true">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                </span>
                                <h2 className="scope-title">{t('serviceDetail.sections.deliverablesTitle', 'Entregáveis ao Cliente')}</h2>
                            </div>
                            <ul className="scope-list">
                                {deliverables.map((item, i) => (
                                    <li key={i}><span className="scope-dot"></span><span>{item}</span></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Seção de Máquinas / Specs */}
            <section className="detail-tech-section" id="especificacoes">
                <div className="detail-container">
                    <div className="section-header-detail">
                        <span className="detail-tag">{t('serviceDetail.sections.installedCapacity', 'Capacidade Instalada')}</span>
                        <h2 className="detail-tech-title">{t('serviceDetail.sections.specsTitle', 'Especificações do Equipamento Homologado ZEISS')}</h2>
                        <p className="detail-tech-desc">
                            {t('serviceDetail.sections.specsDesc', 'Dados técnicos de bancada e parâmetros operacionais garantidos no laboratório climatizado da Faculdade SENAI Ítalo Bologna.')}
                        </p>
                    </div>

                    <div className="machines-specs-list">
                        {machines.map((mach, idx) => (
                            <article key={idx} className="machine-spec-card glass-panel">
                                <div className="machine-header-strip">
                                    <div className="machine-title-group">
                                        <h3 className="machine-name">{mach.name}</h3>
                                        <span className="machine-cat-badge">{mach.category}</span>
                                    </div>
                                </div>

                                <div className="specs-parameters-grid">
                                    <div className="param-item">
                                        <span className="param-label">{t('serviceDetail.specLabels.volume', 'Volume de Medição (X/Y/Z)')}</span>
                                        <strong className="param-value">{mach.volume}</strong>
                                    </div>
                                    <div className="param-item">
                                        <span className="param-label">{t('serviceDetail.specLabels.accuracy', 'Exatidão / Resolução (ISO 10360)')}</span>
                                        <strong className="param-value">{mach.accuracy}</strong>
                                    </div>
                                    <div className="param-item">
                                        <span className="param-label">{t('serviceDetail.specLabels.sensor', 'Sistema Sensor / Apalpador')}</span>
                                        <strong className="param-value">{mach.sensor}</strong>
                                    </div>
                                    <div className="param-item">
                                        <span className="param-label">{t('serviceDetail.specLabels.software', 'Software Metrológico')}</span>
                                        <strong className="param-value">{mach.software}</strong>
                                    </div>
                                </div>

                                <div className="machine-features-strip">
                                    <span className="features-label">{t('serviceDetail.sections.operationalDifferentiators', 'Diferenciais Operacionais:')}</span>
                                    <ul className="features-list">
                                        {mach.features.map((feat, fIdx) => (
                                            <li key={fIdx}>
                                                <span className="feature-check-icon" aria-hidden="true">✓</span>
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
