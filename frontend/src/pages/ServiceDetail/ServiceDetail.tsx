import {MouseEvent} from "react";
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

    const handleScrollToSpecs = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const element = document.getElementById('especificacoes');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

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

            <section className="detail-hero-section">
                <div className="detail-container">
                    <nav className="detail-breadcrumb" aria-label="Breadcrumb">
                        <Link to="/">{t('nav.home', 'Início')}</Link>
                        <span className="separator">/</span>
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
                                <QuoteButton onClick={() => navigate(`/contato?service=${serviceId}`, { state: { serviceId } })}>
                                    {t('serviceDetail.actions.requestQuote', 'Solicitar Cotação para este Serviço')}
                                </QuoteButton>
                                <a href="#especificacoes" onClick={handleScrollToSpecs} className="btn-mais">
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

            <section className="detail-info-section">
                <div className="detail-container">
                    <div className="detail-info-grid">
                        <div className="info-column glass-panel">
                            <div className="info-column-header">
                                <div className="info-icon-badge" aria-hidden="true">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                </div>
                                <h2 className="info-column-title">{t('serviceDetail.sections.targetAudience', 'Para quem é indicado')}</h2>
                            </div>
                            <ul className="info-pills-list">
                                {targetAudience.map((item, idx) => (
                                    <li key={idx} className="info-pill-item">
                                        <span className="pill-dot"></span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="info-column glass-panel">
                            <div className="info-column-header">
                                <div className="info-icon-badge" aria-hidden="true">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                    </svg>
                                </div>
                                <h2 className="info-column-title">{t('serviceDetail.sections.applications', 'Aplicações Típicas')}</h2>
                            </div>
                            <ul className="info-pills-list">
                                {applications.map((item, idx) => (
                                    <li key={idx} className="info-pill-item">
                                        <span className="pill-dot"></span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="info-column glass-panel highlight-column">
                            <div className="info-column-header">
                                <div className="info-icon-badge accent" aria-hidden="true">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                </div>
                                <h2 className="info-column-title">{t('serviceDetail.sections.deliverables', 'Entregáveis & Relatórios')}</h2>
                            </div>
                            <ul className="info-pills-list">
                                {deliverables.map((item, idx) => (
                                    <li key={idx} className="info-pill-item">
                                        <span className="pill-check">✓</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="detail-specs-section" id="especificacoes">
                <div className="detail-container">
                    <div className="detail-specs-header">
                        <div className="specs-eyebrow">
                            <span className="specs-eyebrow-line"></span>
                            <span className="specs-eyebrow-text">{t('serviceDetail.sections.specsEyebrow', 'Capacidade Tecnológica')}</span>
                        </div>
                        <h2 className="detail-specs-title">{t('serviceDetail.sections.specsTitle', 'Equipamentos e Especificações do Laboratório')}</h2>
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
