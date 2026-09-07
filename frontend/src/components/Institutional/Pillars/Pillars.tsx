import './Pillars.scss';

export function Pillars() {
    return (
        <section className="inst-section" id="pilares">
            <div className="inst-container">
                <div className="inst-header-center">
                    <div className="inst-eyebrow">
                        <span className="inst-eyebrow-line"></span>
                        <span className="inst-eyebrow-text">Princípios & Valores</span>
                    </div>
                    <h2 className="inst-section-title">
                        Os pilares que sustentam cada relatório emitido
                    </h2>
                    <p className="inst-section-desc">
                        Metrologia é a ciência da confiança. Nossos compromissos operacionais garantem segurança
                        jurídica e técnica para o produto final.
                    </p>
                </div>

                <div className="inst-pillars-grid">
                    <div className="pillar-card glass-panel">
                        <div className="pillar-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="22" y1="12" x2="18" y2="12"></line>
                                <line x1="6" y1="12" x2="2" y2="12"></line>
                                <line x1="12" y1="6" x2="12" y2="2"></line>
                                <line x1="12" y1="22" x2="12" y2="18"></line>
                            </svg>
                        </div>
                        <h3 className="pillar-card-title">Rigor & Toleranciamento GD&T</h3>
                        <p className="pillar-card-desc">
                            Aplicação estrita dos conceitos de Dimensionamento Geométrico e Toleranciamento (GD&T)
                            conforme as normas ISO 1101 e ASME Y14.5, eliminando interpretações dúbias e garantindo
                            repetibilidade metrológica.
                        </p>
                    </div>

                    <div className="pillar-card glass-panel">
                        <div className="pillar-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path
                                    d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                        </div>
                        <h3 className="pillar-card-title">Acessibilidade à Manufatura</h3>
                        <p className="pillar-card-desc">
                            Tornar a instrumentação e a consultoria dimensional acessíveis não apenas para
                            megacorporações, mas para pequenas e médias indústrias que buscam se qualificar para
                            mercados de exportação.
                        </p>
                    </div>

                    <div className="pillar-card glass-panel">
                        <div className="pillar-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon
                                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                        </div>
                        <h3 className="pillar-card-title">Transferência Tecnológica</h3>
                        <p className="pillar-card-desc">
                            Ir além da prestação de serviços: difundir a cultura de precisão através da capacitação
                            técnica contínua e da formação de novos especialistas para o parque fabril.
                        </p>
                    </div>

                    <div className="pillar-card glass-panel">
                        <div className="pillar-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                        <h3 className="pillar-card-title">Sigilo & Custódia de Dados</h3>
                        <p className="pillar-card-desc">
                            Compromisso inegociável de confidencialidade com relação a modelos CAD proprietários,
                            geometrias patentes, protótipos industriais e laudos técnicos de inspeção.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
