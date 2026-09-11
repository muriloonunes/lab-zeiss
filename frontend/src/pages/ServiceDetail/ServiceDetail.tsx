import {useScrollToTop} from "../../hooks/useScrollToTop";
import {Link, Navigate, useNavigate, useParams} from "react-router-dom";
import {servicesData} from "../../data/ServicesData";
import {ImageCarousel} from "../../components/ImageCarousel/ImageCarousel";
import {QuoteButton} from "../../components/QuoteButton/QuoteButton";
import "./ServiceDetail.scss"
import {useTranslation} from "react-i18next";

export function ServiceDetail() {
    useScrollToTop()
    const {serviceId} = useParams<{ serviceId: string }>()
    const navigate = useNavigate()
    const {t} = useTranslation()

    const service = serviceId ? servicesData[serviceId] : null

    if (!service) {
        return <Navigate to="/services" replace/>
    }

    return (
        <div className="service-detail-page">
            <div className="detail-blob-container" aria-hidden="true">
                <div className="detail-blob detail-blob--top"></div>
                <div className="detail-blob detail-blob--bottom"></div>
            </div>

            <section className="detail-hero-section">
                <div className="detail-container">
                    <div className="detail-breadcrumb">
                        <Link to="/servicos">Serviços</Link>
                        <span>/</span>
                        <span className="current">{service.title}</span>
                    </div>

                    <div className="detail-hero-grid">
                        <div className="detail-hero-content">
                            <span className="detail-tag">{service.categoryTag}</span>
                            <h1 className="detail-title">{service.title}</h1>
                            <p className="detail-headline">{service.headline}</p>
                            <p className="detail-overview">{service.overview}</p>
                            <div className="detail-hero-actions">
                                <QuoteButton onClick={() => navigate('/contato')}>
                                    Solicitar Cotação para este Serviço
                                </QuoteButton>
                                <a href="#especificacoes" className="btn-mais">
                                    <span>Ver Especificações Técnicas</span>
                                </a>
                            </div>
                        </div>

                        <div className="detail-hero-visual">
                            <div className="detail-carousel-card glass-panel">
                                <ImageCarousel images={service.galleryImages}/>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="detail-scope-section">
                <div className="detail-container">
                    <div className="scope-cards-grid">
                        <div className="scope-card glass-panel">
                            <h3 className="scope-title">Público-Alvo & Segmentos</h3>
                            <ul className="scope-list">
                                {service.targetAudience.map((item, i) => (
                                    <li key={i}><span className="scope-dot"></span>{item}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="scope-card glass-panel">
                            <h3 className="scope-title">Aplicações Típicas</h3>
                            <ul className="scope-list">
                                {service.applications.map((item, i) => (
                                    <li key={i}><span className="scope-dot"></span>{item}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="scope-card glass-panel">
                            <h3 className="scope-title">Entregáveis ao Cliente</h3>
                            <ul className="scope-list">
                                {service.deliverables.map((item, i) => (
                                    <li key={i}><span className="scope-dot"></span>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="detail-tech-section" id="especificacoes">
                <div className="detail-container">
                    <div className="section-header-detail">
                        <span className="detail-tag">Capacidade Instalada</span>
                        <h2 className="detail-tech-title">Especificações do Equipamento Homologado ZEISS</h2>
                        <p className="detail-tech-desc">
                            Dados técnicos de bancada e parâmetros operacionais garantidos no laboratório climatizado da Faculdade SENAI Ítalo Bologna.
                        </p>
                    </div>

                    <div className="machines-specs-list">
                        {service.machines.map((mach, idx) => (
                            <article key={idx} className="machine-spec-card glass-panel">
                                <div className="machine-header-strip">
                                    <div className="machine-title-group">
                                        <h3 className="machine-name">{mach.name}</h3>
                                        <span className="machine-cat">{mach.category}</span>
                                    </div>
                                </div>

                                <div className="specs-parameters-grid">
                                    <div className="param-item">
                                        <span className="param-label">Volume de Medição (X/Y/Z)</span>
                                        <strong className="param-value">{mach.volume}</strong>
                                    </div>
                                    <div className="param-item">
                                        <span className="param-label">Exatidão / Resolução (ISO 10360)</span>
                                        <strong className="param-value">{mach.accuracy}</strong>
                                    </div>
                                    <div className="param-item">
                                        <span className="param-label">Sistema Sensor / Apalpador</span>
                                        <strong className="param-value">{mach.sensor}</strong>
                                    </div>
                                    <div className="param-item">
                                        <span className="param-label">Software Metrológico</span>
                                        <strong className="param-value">{mach.software}</strong>
                                    </div>
                                </div>

                                <div className="machine-features-strip">
                                    <span className="features-label">Diferenciais Operacionais:</span>
                                    <ul className="features-list">
                                        {mach.features.map((feat, fIdx) => (
                                            <li key={fIdx}>{feat}</li>
                                        ))}
                                    </ul>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
