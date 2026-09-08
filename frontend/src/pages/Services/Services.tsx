import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {QuoteButton} from '../../components/QuoteButton/QuoteButton';
import './Services.scss';

export function Services() {
    const {t} = useTranslation();
    const navigate = useNavigate();

    const machinesList = [
        {
            name: "ZEISS PRISMO",
            type: "CMM de Altíssima Exatidão",
            spec: "Referência absoluta para tolerâncias micrométricas críticas"
        },
        {
            name: "ZEISS DuraMax (500)",
            type: "CMM de Chão de Fábrica e Lab",
            spec: "Inspeção dimensional por coordenadas ágil e estável"
        },
        {
            name: "ZEISS O-INSPECT",
            type: "Sistema Multisensor Híbrido",
            spec: "Integração óptica sem contato e apalpamento no mesmo ciclo"
        },
        {
            name: "ZEISS BOSELLO MAX",
            type: "Inspeção NDT por Raio-X",
            spec: "Análise não destrutiva de descontinuidades e vazios internos"
        },
        {
            name: "ZEISS ATOS Q",
            type: "Digitalizador Óptico 3D",
            spec: "Escaneamento por luz azul estruturada e malhas de alta densidade"
        },
        {
            name: "ZEISS T-SCAN Hawk 2",
            type: "Scanner a Laser Portátil",
            spec: "Flexibilidade metrológica e aquisição dimensional de campo"
        },
    ];

    return (
        <div className="services-page">
            <div className="services-blob-container" aria-hidden="true">
                <div className="services-blob services-blob--top"></div>
                <div className="services-blob services-blob--middle"></div>
                <div className="services-blob services-blob--bottom"></div>
            </div>

            <section className="services-hero-section">
                <div className="services-container">
                    <div className="services-hero-content">
                        <div className="services-eyebrow">
                            <span className="services-eyebrow-line"></span>
                            <span className="services-eyebrow-text">Nossos Serviços</span>
                        </div>
                        <h1 className="services-hero-title">Precisão para cada desafio industrial. </h1>
                        <p className="services-hero-description">
                            Soluções de inspeção dimensional, medição óptica, tomografia, digitalização 3D e engenharia
                            reversa realizadas com tecnologia ZEISS e expertise técnica SENAI.
                        </p>
                    </div>
                </div>
            </section>

            <section className="service-row-section">
                <div className="services-container">
                    <div className="service-row-split">
                        <div className="service-text-side">
                            <span className="service-index-num">01</span>
                            <span className="service-category-tag">{t('services.dimensional.category')}</span>
                            <h2 className="service-row-title">{t('services.dimensional.title')}</h2>
                            <p className="service-paragraph">{t('services.dimensional.description')}</p>

                            <div className="service-applications-grid">
                                <div className="app-item"><span className="app-dot"></span>{t('services.dimensional.applications.dimensions')}</div>
                                <div className="app-item"><span className="app-dot"></span>{t('services.dimensional.applications.cad')}</div>
                                <div className="app-item"><span className="app-dot"></span>{t('services.dimensional.applications.wear')}</div>
                                <div className="app-item"><span className="app-dot"></span>{t('services.dimensional.applications.gdt')}</div>
                            </div>

                            <div className="service-meta-footer">
                                <span className="meta-label">Equipamentos:</span>
                                <strong className="meta-value">ZEISS PRISMO • ZEISS DuraMax (500)</strong>
                            </div>
                        </div>

                        <div className="service-visual-side">
                            <div className="service-image-card glass-panel">
                                <div className="service-img-wrapper portrait-3-4">
                                    <img src="/images/Lab-DuraMax.jpg" alt="ZEISS DuraMax e PRISMO" className="service-img" />
                                    <div className="service-img-overlay"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="service-row-section service-row-section--alt">
                <div className="services-container">
                    <div className="service-row-split service-row-split--reverse">
                        <div className="service-text-side">
                            <span className="service-index-num">02</span>
                            <span className="service-category-tag">{t('services.optical.category')}</span>
                            <h2 className="service-row-title">{t('services.optical.title')}</h2>
                            <p className="service-paragraph">{t('services.optical.description')}</p>

                            <div className="service-applications-grid">
                                <div className="app-item"><span className="app-dot"></span>{t('services.optical.applications.nonContact')}</div>
                                <div className="app-item"><span className="app-dot"></span>{t('services.optical.applications.surface')}</div>
                                <div className="app-item"><span className="app-dot"></span>{t('services.optical.applications.fineFeatures')}</div>
                            </div>

                            <div className="service-note-box glass-panel">
                                <span className="note-label">{t('services.optical.exampleLabel')}</span>
                                <strong className="note-title">{t('services.optical.exampleTitle')}</strong>
                                <p className="note-desc">{t('services.optical.exampleDescription')}</p>
                            </div>

                            <div className="service-meta-footer">
                                <span className="meta-label">Equipamento:</span>
                                <strong className="meta-value">ZEISS O-INSPECT</strong>
                            </div>
                        </div>

                        <div className="service-visual-side">
                            <div className="service-image-card glass-panel">
                                <div className="service-img-wrapper portrait-3-4">
                                    <img src="/images/Lab-OInspect.jpg" alt="ZEISS O-INSPECT" className="service-img" />
                                    <div className="service-img-overlay"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="service-row-section">
                <div className="services-container">
                    <div className="service-row-split">
                        <div className="service-text-side">
                            <span className="service-index-num">03</span>
                            <span className="service-category-tag">{t('services.xray.category')}</span>
                            <h2 className="service-row-title">{t('services.xray.title')}</h2>
                            <p className="service-paragraph">{t('services.xray.description')}</p>

                            <div className="service-applications-grid">
                                <div className="app-item"><span className="app-dot"></span>{t('services.xray.applications.cracks')}</div>
                                <div className="app-item"><span className="app-dot"></span>{t('services.xray.applications.voids')}</div>
                                <div className="app-item"><span className="app-dot"></span>{t('services.xray.applications.welding')}</div>
                                <div className="app-item"><span className="app-dot"></span>{t('services.xray.applications.foreign')}</div>
                            </div>

                            <div className="service-note-box glass-panel">
                                <span className="note-label">{t('services.xray.principleLabel')}</span>
                                <p className="note-desc">{t('services.xray.principle')}</p>
                            </div>

                            <div className="service-meta-footer">
                                <span className="meta-label">Equipamento:</span>
                                <strong className="meta-value">ZEISS BOSELLO MAX</strong>
                            </div>
                        </div>

                        <div className="service-visual-side">
                            <div className="service-image-card glass-panel">
                                <div className="service-img-wrapper portrait-3-4">
                                    <img src="/images/Lab-Bosello.jpg" alt="ZEISS BOSELLO MAX" className="service-img" />
                                    <div className="service-img-overlay"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="service-row-section service-row-section--alt">
                <div className="services-container">
                    <div className="service-row-split service-row-split--reverse">
                        <div className="service-text-side">
                            <span className="service-index-num">04</span>
                            <span className="service-category-tag">{t('services.scanning.category')}</span>
                            <h2 className="service-row-title">{t('services.scanning.title')}</h2>
                            <p className="service-paragraph">{t('services.scanning.description')}</p>

                            <div className="scanning-equipments-list">
                                <div className="scan-eq-card glass-panel">
                                    <strong>T-SCAN hawk 2:</strong>
                                    <p>{t('services.scanning.tscan')}</p>
                                </div>
                                <div className="scan-eq-card glass-panel">
                                    <strong>ATOS Q:</strong>
                                    <p>{t('services.scanning.atos')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="service-visual-side">
                            <div className="service-image-card glass-panel">
                                <div className="service-img-wrapper portrait-3-4">
                                    <img src="/images/Lab-Scan3D.jpg" alt="Digitalização 3D ZEISS" className="service-img" />
                                    <div className="service-img-overlay"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="service-workflow-section" id="engenharia-reversa">
                <div className="services-container">
                    <div className="workflow-header">
                        <span className="service-index-num">05</span>
                        <span className="service-category-tag">{t('services.reverse.category')}</span>
                        <h2 className="service-row-title">{t('services.reverse.title')}</h2>
                        <p className="service-paragraph">{t('services.reverse.description')}</p>
                    </div>

                    <div className="workflow-steps-grid">
                        <div className="workflow-step-card glass-panel">
                            <span className="step-badge">Etapa 01</span>
                            <h3 className="step-title">{t('services.reverse.steps.part')}</h3>
                        </div>
                        <div className="workflow-arrow-divider" aria-hidden="true">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </div>
                        <div className="workflow-step-card glass-panel">
                            <span className="step-badge">Etapa 02</span>
                            <h3 className="step-title">{t('services.reverse.steps.scan')}</h3>
                        </div>
                        <div className="workflow-arrow-divider" aria-hidden="true">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </div>
                        <div className="workflow-step-card glass-panel">
                            <span className="step-badge">Etapa 03</span>
                            <h3 className="step-title">{t('services.reverse.steps.cad')}</h3>
                        </div>
                    </div>
                </div>
            </section>

            <section className="selection-guide-section">
                <div className="services-container">
                    <div className="selection-header">
                        <div className="services-eyebrow">
                            <span className="services-eyebrow-line"></span>
                            <span className="services-eyebrow-text">{t('services.selection.eyebrow')}</span>
                        </div>
                        <h2 className="services-section-title">{t('services.selection.title')}</h2>
                        <p className="services-section-desc">{t('services.selection.description')}</p>
                    </div>

                    <div className="selection-grid">
                        <div className="selection-card glass-panel">
                            <h3 className="selection-card-title">{t('services.selection.items.dimensions.title')}</h3>
                            <p className="selection-card-desc">{t('services.selection.items.dimensions.description')}</p>
                        </div>
                        <div className="selection-card glass-panel">
                            <h3 className="selection-card-title">{t('services.selection.items.nonContact.title')}</h3>
                            <p className="selection-card-desc">{t('services.selection.items.nonContact.description')}</p>
                        </div>
                        <div className="selection-card glass-panel">
                            <h3 className="selection-card-title">{t('services.selection.items.internal.title')}</h3>
                            <p className="selection-card-desc">{t('services.selection.items.internal.description')}</p>
                        </div>
                        <div className="selection-card glass-panel">
                            <h3 className="selection-card-title">{t('services.selection.items.scanning.title')}</h3>
                            <p className="selection-card-desc">{t('services.selection.items.scanning.description')}</p>
                        </div>
                        <div className="selection-card glass-panel">
                            <h3 className="selection-card-title">{t('services.selection.items.cad.title')}</h3>
                            <p className="selection-card-desc">{t('services.selection.items.cad.description')}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="services-cta-section">
                <div className="services-container">
                    <div className="services-cta-card glass-panel">
                        <div className="cta-content">
                            <div className="services-eyebrow">
                                <span className="services-eyebrow-line"></span>
                                <span className="services-eyebrow-text">Vamos conversar</span>
                            </div>
                            <h2 className="cta-title">Tem um desafio de medição?</h2>
                            <p className="cta-description">
                                Conte-nos sobre sua peça, aplicação ou necessidade de inspeção. Nossa equipe pode ajudar
                                a definir a abordagem mais adequada. </p>
                        </div>
                        <div className="cta-actions">
                            <QuoteButton onClick={() => navigate('/contato')}>
                                Solicitar Análise Técnica
                            </QuoteButton>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}