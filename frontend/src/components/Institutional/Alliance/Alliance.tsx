import './Alliance.scss';

export function Alliance() {
    return (
        <section className="inst-section" id="alianca">
            <div className="inst-container">
                <div className="inst-split-grid">
                    <div className="inst-alliance-visual">
                        <div className="alliance-image-card glass-panel">
                            <div className="alliance-img-wrapper">
                                <img
                                    src="/images/Logo-Zeiss-OInspect-Cortada.png"
                                    alt="Visão geral do Laboratório de Metrologia SENAI ZEISS"
                                    className="alliance-img"
                                />
                                <div className="alliance-overlay-gradient"></div>
                            </div>
                        </div>
                    </div>
                    <div className="inst-alliance-content">
                        <div className="inst-eyebrow">
                            <span className="inst-eyebrow-line"></span>
                            <span className="inst-eyebrow-text">Aliança Estratégica</span>
                        </div>
                        <h2 className="inst-section-title">
                            A convergência entre padrão global e vocação industrial.
                        </h2>
                        <p className="inst-paragraph">
                            O CEM nasceu da necessidade de suprir uma demanda crítica da indústria moderna: o acesso
                            a medições de exatidão micrométrica e validação técnica em conformidade com as normas
                            internacionais mais rigorosas.
                        </p>
                        <p className="inst-paragraph">
                            A cooperação técnica une o pioneirismo óptico e metrológico da alemã Carl Zeiss —
                            referência mundial nessa indústria — à infraestrutura, corpo docente e
                            capacidade de formação do SENAI. Esta sinergia permite que indústrias aeroespaciais,
                            automotivas, de saúde e metalmecânica encontrem no Brasil suporte técnico do mesmo nível
                            dos principais polos industriais da Europa.
                        </p>
                    </div>
                </div>

                <div className="governance-strip glass-panel">
                    <div className="governance-col">
                        <div className="gov-header">
                            <span className="gov-dot"></span>
                            <strong className="gov-entity">Carl Zeiss (Alemanha / Brasil)</strong>
                        </div>
                        <p className="gov-desc">
                            Homologação técnica de maquinários, calibrações de fábrica e licenças atualizadas das
                            suítes CALYPSO, PiWeb e ZEISS INSPECT.
                        </p>
                    </div>

                    <div className="governance-col">
                        <div className="gov-header">
                            <span className="gov-dot"></span>
                            <strong className="gov-entity">SENAI Goiás & Faculdade Ítalo Bologna</strong>
                        </div>
                        <p className="gov-desc">
                            Gestão operacional, responsabilidade técnica pelos ensaios, infraestrutura física do
                            laboratório e difusão de conhecimento industrial.
                        </p>
                    </div>

                    <div className="governance-col">
                        <div className="gov-header">
                            <span className="gov-dot"></span>
                            <strong className="gov-entity">Sistema FIEG</strong>
                        </div>
                        <p className="gov-desc">
                            Articulação institucional para o fortalecimento da competitividade e conformidade de
                            fornecedores de cadeias produtivas no país.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
