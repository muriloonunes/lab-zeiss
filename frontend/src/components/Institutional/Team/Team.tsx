import './Team.scss';

export function Team() {
    return (
        <section className="inst-section" id="equipe">
            <div className="inst-container">
                <div className="inst-section-header">
                    <div className="inst-eyebrow">
                        <span className="inst-eyebrow-line"></span>
                        <span className="inst-eyebrow-text">Corpo Técnico</span>
                    </div>
                    <div className="inst-header-split">
                        <h2 className="inst-section-title">
                            Especialistas dedicados à resolução de desafios complexos
                        </h2>
                        <p className="inst-section-desc">
                            Por trás de cada leitura e modelo tridimensional, há um time de engenheiros e técnicos
                            habilitados para interpretar normas e orientar processos fabris.
                        </p></div>
                </div>

                <div className="inst-team-grid">
                    <div className="team-card glass-panel">
                        <div className="team-avatar-placeholder">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                        <h3 className="team-role">Coordenação & Governança do Laboratório</h3>
                        <p className="team-area">Gestão Estratégica e Relações Industriais</p>
                        <p className="team-desc">
                            Responsável pela interface entre as demandas da indústria, as diretrizes do Sistema
                            FIEG/SENAI e o alinhamento de qualidade com a Carl Zeiss.
                        </p>
                    </div>

                    <div className="team-card glass-panel">
                        <div className="team-avatar-placeholder">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                                <polyline points="2 17 12 22 22 17"></polyline>
                                <polyline points="2 12 12 17 22 12"></polyline>
                            </svg>
                        </div>
                        <h3 className="team-role">Especialistas em CMM & GD&T</h3>
                        <p className="team-area">Medição por Coordenadas Tridimensionais</p>
                        <p className="team-desc">
                            Engenheiros focados em planejamento e programação de trajetórias por apalpamento tátil,
                            inspeção de desvios geométricos e emissão de laudos de conformidade dimensional.
                        </p>
                    </div>

                    <div className="team-card glass-panel">
                        <div className="team-avatar-placeholder">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                <path
                                    d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                <circle cx="12" cy="13" r="4"></circle>
                            </svg>
                        </div>
                        <h3 className="team-role">Engenharia Reversa & Digitalização Óptica</h3>
                        <p className="team-area">Escaneamento 3D e Modelagem CAD</p>
                        <p className="team-desc">
                            Especialistas em aquisição óptica sem contato por luz estruturada, geração de malhas de
                            alta densidade e reconstrução de modelos CAD paramétricos para peças sem projeto
                            original.
                        </p>
                    </div>

                    <div className="team-card glass-panel">
                        <div className="team-avatar-placeholder">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                        </div>
                        <h3 className="team-role">Qualidade Assegurada & Relatórios FAI</h3>
                        <p className="team-area">Homologação de Lotes e First Article Inspection</p>
                        <p className="team-desc">
                            Analistas dedicados à inspeção completa de primeiro artigo de usinagem e injeção,
                            elaboração de mapas de cores de desvio e suporte à validação de ferramentas e matrizes.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
