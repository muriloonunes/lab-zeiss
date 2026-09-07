import './History.scss';

export function History() {
    return (
        <section className="inst-section" id="historia">
            <div className="inst-container">
                <div className="inst-header-center">
                    <div className="inst-eyebrow">
                        <span className="inst-eyebrow-line"></span>
                        <span className="inst-eyebrow-text">Nossa Trajetória</span>
                    </div>
                    <h2 className="inst-section-title">
                        Construindo uma referência internacional em metrologia
                    </h2>
                    <p className="inst-section-desc">
                        Os marcos que transformaram a Faculdade SENAI Ítalo Bologna em sede de um dos centros
                        metrológicos mais avançados do planeta.
                    </p>
                </div>

                <div className="inst-timeline">
                    <div className="timeline-track" aria-hidden="true"></div>

                    <div className="timeline-item">
                        <div className="timeline-marker">
                            <span className="timeline-year">Expansão FIEG</span>
                        </div>
                        <div className="timeline-card glass-panel">
                            <h3 className="timeline-title">Plano Estratégico de Modernização da Rede</h3>
                            <p className="timeline-text">
                                Inserção do projeto no programa macro de modernização e ampliação da rede de ensino
                                da Federação das Indústrias do Estado de Goiás (FIEG), com previsão de aportes de R$
                                1 bilhão até 2026 nas unidades SESI e SENAI.
                            </p>
                        </div>
                    </div>

                    <div className="timeline-item">
                        <div className="timeline-marker">
                            <span className="timeline-year">25/11</span>
                        </div>
                        <div className="timeline-card glass-panel">
                            <h3 className="timeline-title">Inauguração do 1º Centro de Excelência ZEISS no
                                Brasil</h3>
                            <p className="timeline-text">
                                Instalação oficial do complexo na Faculdade SENAI Ítalo Bologna, em Goiânia —
                                unidade pioneira da instituição na capital. Aporte inicial de R$ 40 milhões em
                                instrumentação óptica, eletrônica, mecânica de precisão e ensaios por Raio-X.
                            </p>
                        </div>
                    </div>

                    <div className="timeline-item">
                        <div className="timeline-marker">
                            <span className="timeline-year">Padrão Global</span>
                        </div>
                        <div className="timeline-card glass-panel">
                            <h3 className="timeline-title">Integração ao Eixo Tecnológico Restrito</h3>
                            <p className="timeline-text">
                                Goiânia passa a integrar o seleto grupo de polos internacionais com essa
                                configuração de metrologia avançada, antes restrita aos Estados Unidos, Alemanha e
                                China, encerrando a necessidade de envio de ferramentais ao exterior para análises
                                críticas.
                            </p>
                        </div>
                    </div>

                    <div className="timeline-item">
                        <div className="timeline-marker">
                            <span className="timeline-year">2025 — 2030</span>
                        </div>
                        <div className="timeline-card glass-panel">
                            <h3 className="timeline-title">Operação Contínua & Formação da Nova Geração</h3>
                            <p className="timeline-text">
                                Meta de atendimento a mais de 300 indústrias em Goiás e no Brasil, aliada ao
                                compromisso de atualização contínua de softwares da Carl Zeiss pelos próximos 5 anos
                                e formação técnica de operadores especializados.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
