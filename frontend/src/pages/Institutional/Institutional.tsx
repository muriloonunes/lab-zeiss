import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {QuoteButton} from '../../components/QuoteButton/QuoteButton';
import './Institutional.scss';

export function Institutional() {
    const navigate = useNavigate();
    return (
        <div className="institutional-page">
            <div className="inst-blob-container" aria-hidden="true">
                <div className="inst-blob inst-blob--hero"></div>
                <div className="inst-blob inst-blob--middle"></div>
                <div className="inst-blob inst-blob--bottom"></div>
            </div>
            <section className="inst-hero-section">
                <div className="inst-container">
                    <div className="inst-hero-grid">
                        <div className="inst-hero-content">
                            <h1 className="inst-hero-title">
                                Precisão alemã e expertise técnica brasileira a serviço da indústria de alta exigência.
                            </h1>
                            <p className="inst-hero-description">
                                Instalado na Faculdade SENAI Ítalo Bologna, em Goiânia, o Centro de Excelência em
                                Metrologia é resultado de uma aliança estratégica entre o Sistema FIEG / SENAI Goiás e a
                                Carl Zeiss. Atuamos como um dos cinco centros globais com esta capacidade para oferecer
                                soluções completas em medição tridimensional, engenharia reversa e conformidade
                                dimensional.
                            </p>
                        </div>

                        <div className="inst-hero-visual">
                            <div className="inst-facade-card glass-panel">
                                <div className="facade-image-wrapper">
                                    <img
                                        src="/images/Lab-Fachada-3.jpg"
                                        alt="Fachada do Laboratório"
                                        width="580"
                                        height="400"
                                        className="facade-img"
                                    />
                                    <div className="facade-overlay-gradient"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

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
                        <div className="inst-split-text">
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

            <section className="inst-section" id="liderancas">
                <div className="inst-container">
                    <div className="inst-header-center">
                        <div className="inst-eyebrow">
                            <span className="inst-eyebrow-line"></span>
                            <span className="inst-eyebrow-text">Chancela Institucional</span>
                        </div>
                        <h2 className="inst-section-title">A visão dos realizadores da aliança</h2>
                        <p className="inst-section-desc">
                            Compromisso firmado entre o Sistema Indústria e a multinacional Carl Zeiss com a
                            produtividade e competitividade fabril.
                        </p>
                    </div>

                    <div className="inst-quotes-grid">
                        <article className="quote-card glass-panel">
                            <p className="quote-text">
                                “A implantação do primeiro Centro de Excelência da Carl Zeiss no Brasil é um marco
                                histórico. A iniciativa visa impulsionar a formação profissional, além de promover o
                                avanço em pesquisa, desenvolvimento e inovação, atendendo às crescentes demandas da
                                indústria nacional por inovação e precisão.”
                            </p>
                            <div className="quote-author">
                                <strong>Sandro Mabel</strong>
                                <span>Ex-Presidente da FIEG e dos Conselhos Regionais do SESI e SENAI</span>
                            </div>
                        </article>

                        <article className="quote-card glass-panel">
                            <p className="quote-text">
                                “Estamos tendo a oportunidade de trazer nossa tecnologia de ponta para um novo
                                público-alvo. Apenas Estados Unidos, Alemanha e China têm um complexo similar. Juntos,
                                vamos ensinar a próxima geração a usar soluções inovadoras para alavancar a
                                produtividade e a qualidade dos produtos.”
                            </p>
                            <div className="quote-author">
                                <strong>Jochen Weinisch</strong>
                                <span>Vice-Presidente de Vendas (América Latina, Oriente Médio e África) — Carl Zeiss</span>
                            </div>
                        </article>

                        <article className="quote-card glass-panel">
                            <p className="quote-text">
                                “Além de beneficiar a indústria goiana, o complexo terá impacto nacional, tornando-se
                                referência em qualificação profissional e suporte técnico para o setor produtivo,
                                fortalecendo a relação entre educação e chão de fábrica.”
                            </p>
                            <div className="quote-author">
                                <strong>Dario Queija</strong>
                                <span>Diretor da Faculdade SENAI Ítalo Bologna</span>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

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

            <section className="inst-section" id="equipe">
                <div className="inst-container">
                    <div className="inst-header-center">
                        <div className="inst-eyebrow">
                            <span className="inst-eyebrow-line"></span>
                            <span className="inst-eyebrow-text">Corpo Técnico</span>
                        </div>
                        <h2 className="inst-section-title">
                            Especialistas dedicados à resolução de desafios complexos
                        </h2>
                        <p className="inst-section-desc">
                            Por trás de cada leitura e modelo tridimensional, há um time de engenheiros e técnicos
                            habilitados para interpretar normas e orientar processos fabris.
                        </p>
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

            {/* 7. CTA INSTITUCIONAL */}
            <section className="inst-section inst-cta-section">
                <div className="inst-container">
                    <div className="inst-cta-card glass-panel">
                        <div className="inst-cta-content">
                            <div className="inst-eyebrow">
                                <span className="inst-eyebrow-line"></span>
                                <span className="inst-eyebrow-text">Agende uma Visita Técnica</span>
                            </div>
                            <h2 className="inst-cta-title">
                                Conheça a infraestrutura do laboratório na Faculdade SENAI Ítalo Bologna.
                            </h2>
                            <p className="inst-cta-desc">
                                Nossa equipe técnica está à disposição para avaliar suas necessidades em medição
                                tridimensional, digitalização ou validação dimensional.
                            </p>
                        </div>
                        <div className="inst-cta-actions">
                            <QuoteButton onClick={() => navigate('/contato')}>
                                Solicitar Contato Técnico
                            </QuoteButton>
                            <Link to="/servicos" className="btn-mais">
                                <span>Explorar Catálogo de Serviços</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="btn-icon"
                                    aria-hidden="true"
                                >
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}