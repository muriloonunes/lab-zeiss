import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { contarPendentesValidacao } from '../../../services/licaoService';
import { listarServicos } from '../../../services/servicoService';
import { obterDadosDashboard, DadosDashboard } from '../../../services/estatisticaServiceMock';
import './Dashboard.scss';

export const Dashboard: React.FC = () => {
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const [totalPendentes, setTotalPendentes] = useState<number>(0);
    const [totalDevolvidas, setTotalDevolvidas] = useState<number>(0);
    const [dadosDashboard, setDadosDashboard] = useState<DadosDashboard | null>(null);
    const [carregandoDashboard, setCarregandoDashboard] = useState(true);

    // Preferência de Modo de Demonstração (Mock vs Real) persistida no localStorage
    const [incluirMock, setIncluirMock] = useState<boolean>(() => {
        const salvo = localStorage.getItem('assistente_incluir_mock');
        return salvo !== null ? salvo === 'true' : true;
    });

    const isValidadorOuAdmin = usuario?.tipo === 'VALIDADOR' || usuario?.tipo === 'ADMINISTRADOR';

    const handleToggleMock = (usarMock: boolean) => {
        setIncluirMock(usarMock);
        localStorage.setItem('assistente_incluir_mock', String(usarMock));
    };

    useEffect(() => {
        let isMounted = true;

        if (isValidadorOuAdmin) {
            contarPendentesValidacao()
                .then((resp) => {
                    if (isMounted) setTotalPendentes(resp.totalPendentes);
                })
                .catch(() => {});
        }

        // Verifica lições devolvidas atribuídas ao técnico ou no acervo
        listarServicos()
            .then((servicos) => {
                if (isMounted) {
                    const devolvidas = servicos.filter(
                        (s) =>
                            s.status === 'CONCLUIDO' &&
                            s.blocoAprendizado?.statusLicao === 'RASCUNHO' &&
                            Boolean(s.blocoAprendizado?.motivoRejeicao)
                    );
                    setTotalDevolvidas(devolvidas.length);
                }
            })
            .catch(() => {});

        return () => {
            isMounted = false;
        };
    }, [isValidadorOuAdmin]);

    // Carrega dados de inteligência acumulada (KPIs e gráficos)
    useEffect(() => {
        let isMounted = true;
        setCarregandoDashboard(true);

        obterDadosDashboard(incluirMock)
            .then((dados) => {
                if (isMounted) {
                    setDadosDashboard(dados);
                    setCarregandoDashboard(false);
                }
            })
            .catch(() => {
                if (isMounted) setCarregandoDashboard(false);
            });

        return () => {
            isMounted = false;
        };
    }, [incluirMock]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    const primeiroNome = usuario?.nome ? usuario.nome.split(' ')[0] : 'Usuário';

    // Cálculo do valor máximo para escala do gráfico de barras mensal
    const maxHorasMensal = React.useMemo(() => {
        if (!dadosDashboard || dadosDashboard.historicoMensal.length === 0) return 100;
        let max = 0;
        dadosDashboard.historicoMensal.forEach((h) => {
            if (h.horasOrcadas > max) max = h.horasOrcadas;
            if (h.horasRealizadas > max) max = h.horasRealizadas;
        });
        return Math.max(max * 1.15, 50);
    }, [dadosDashboard]);

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1 className="dashboard-greeting">
                    {getGreeting()}, {primeiroNome}!
                </h1>
            </div>

            {totalDevolvidas > 0 && (
                <div className="dashboard-alert-banner alert-warning">
                    <div className="alert-content">
                        <div className="alert-icon warning">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </div>
                        <div className="alert-text">
                            <strong>Você tem {totalDevolvidas} {totalDevolvidas === 1 ? 'lição devolvida' : 'lições devolvidas'} para correção</strong>
                            <p>
                                O validador técnico solicitou ajustes e complementações nos relatos de aprendizado das ordens de serviço.
                            </p>
                        </div>
                    </div>
                    <button
                        className="btn-alert-action btn-alert-warning"
                        onClick={() => navigate('/interno/servicos?filtro=devolvidas')}
                    >
                        <span>Corrigir Lições</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Alerta de Validações Pendentes para Validador / Admin */}
            {isValidadorOuAdmin && totalPendentes > 0 && (
                <div className="dashboard-alert-banner">
                    <div className="alert-content">
                        <div className="alert-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <div className="alert-text">
                            <strong>{totalPendentes} {totalPendentes === 1 ? 'lição aguarda' : 'lições aguardam'} validação técnica</strong>
                            <p>
                                Ordens de serviço concluídas submeteram novos aprendizados que necessitam de moderação para formalização no acervo.
                            </p>
                        </div>
                    </div>
                    <button
                        className="btn-alert-action"
                        onClick={() => navigate('/interno/licoes?aba=validacao')}
                    >
                        <span>Revisar Lições</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </button>
                </div>
            )}
            <div className="dashboard-intelligence-section">
                {carregandoDashboard || !dadosDashboard ? (
                    <div className="dashboard-loading-card">
                        <span className="loading-spinner" />
                        <span>Calculando indicadores de assertividade e métricas históricas...</span>
                    </div>
                ) : (
                    <>
                        {/* 1. Os 3 Cards de Indicadores (KPIs) */}
                        <div className="kpis-grid">
                            {/* KPI 1: Assertividade */}
                            <div className="kpi-card assertividade">
                                <div className="kpi-header">
                                    <span className="kpi-title">Índice de Assertividade</span>
                                    <div className="kpi-icon-pill icon-success">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="kpi-body">
                                    <div className="kpi-value-row">
                                        <span className="kpi-value">{dadosDashboard.indicadores.indiceAssertividade}%</span>
                                        <span className="kpi-status-badge badge-green">Meta: ≥ 80%</span>
                                    </div>
                                    <p className="kpi-desc">
                                        Ordens de serviço finalizadas dentro da margem de esforço planejada (desvio ≤ ±15%).
                                    </p>
                                </div>
                            </div>

                            {/* KPI 2: Desvio Médio */}
                            <div className="kpi-card desvio">
                                <div className="kpi-header">
                                    <span className="kpi-title">Desvio Médio de Esforço</span>
                                    <div className="kpi-icon-pill icon-warning">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="kpi-body">
                                    <div className="kpi-value-row">
                                        <span className="kpi-value">
                                            {dadosDashboard.indicadores.desvioMedioEsforco > 0
                                                ? `+${dadosDashboard.indicadores.desvioMedioEsforco}%`
                                                : `${dadosDashboard.indicadores.desvioMedioEsforco}%`}
                                        </span>
                                        <span className="kpi-status-badge badge-amber">Tendência Adicional</span>
                                    </div>
                                    <p className="kpi-desc">
                                        Variação de horas reais na bancada versus o tempo previsto nas estimativas iniciais.
                                    </p>
                                </div>
                            </div>

                            {/* KPI 3: Margem Realizada */}
                            <div className="kpi-card margem">
                                <div className="kpi-header">
                                    <span className="kpi-title">Margem Orçada vs Realizada</span>
                                    <div className="kpi-icon-pill icon-primary">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="12" y1="1" x2="12" y2="23"/>
                                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className="kpi-body">
                                    <div className="kpi-value-row">
                                        <span className="kpi-value">{dadosDashboard.indicadores.margemOrcadaVsRealizada}%</span>
                                        <span className="kpi-status-badge badge-blue">Rentabilidade Média</span>
                                    </div>
                                    <p className="kpi-desc">
                                        Margem operacional efetiva apurada após apropriação dos custos reais de execução.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Faixa Complementar de Totais do Acervo */}
                        <div className="metricas-resumo-strip">
                            <div className="strip-item">
                                <span className="strip-label">OSs Concluídas no Acervo:</span>
                                <strong className="strip-value">{dadosDashboard.indicadores.totalOSConcluidas}</strong>
                            </div>
                            <div className="strip-divider" />
                            <div className="strip-item">
                                <span className="strip-label">Lições de Aprendizado Formalizadas:</span>
                                <strong className="strip-value">{dadosDashboard.indicadores.licoesFormalizadas}</strong>
                            </div>
                            <div className="strip-divider" />
                            <div className="strip-item">
                                <span className="strip-label">Média de Horas / OS:</span>
                                <strong className="strip-value">{dadosDashboard.indicadores.mediaHorasPorOS}h</strong>
                            </div>
                        </div>

                        {/* 2. Os 2 Gráficos de Inteligência Histórica */}
                        <div className="charts-grid">
                            {/* Gráfico 1: Evolução Mensal de Horas */}
                            <div className="chart-card">
                                <div className="chart-header">
                                    <div>
                                        <h3 className="chart-title">Horas Orçadas vs Horas Realizadas</h3>
                                        <span className="chart-sub">Evolução do esforço planejado versus esforço apontado</span>
                                    </div>
                                    <div className="chart-legend">
                                        <div className="legend-item">
                                            <span className="legend-box orcadas" />
                                            <span>Orçadas</span>
                                        </div>
                                        <div className="legend-item">
                                            <span className="legend-box realizadas" />
                                            <span>Realizadas</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="chart-body bar-chart-container">
                                    <div className="bar-chart-plot">
                                        {dadosDashboard.historicoMensal.map((item, idx) => {
                                            const alturaOrcadas = Math.round((item.horasOrcadas / maxHorasMensal) * 100);
                                            const alturaRealizadas = Math.round((item.horasRealizadas / maxHorasMensal) * 100);

                                            return (
                                                <div key={idx} className="bar-group">
                                                    <div className="bars-pair">
                                                        <div
                                                            className="bar bar-orcadas"
                                                            style={{ height: `${alturaOrcadas}%` }}
                                                            title={`Orçadas: ${item.horasOrcadas}h`}
                                                        >
                                                            <span className="bar-tooltip">{item.horasOrcadas}h</span>
                                                        </div>
                                                        <div
                                                            className="bar bar-realizadas"
                                                            style={{ height: `${alturaRealizadas}%` }}
                                                            title={`Realizadas: ${item.horasRealizadas}h`}
                                                        >
                                                            <span className="bar-tooltip">{item.horasRealizadas}h</span>
                                                        </div>
                                                    </div>
                                                    <span className="bar-label-month">{item.mes}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Gráfico 2: Causas Raiz Mais Frequentes */}
                            <div className="chart-card">
                                <div className="chart-header">
                                    <div>
                                        <h3 className="chart-title">Causas Raiz de Desvio Mais Frequentes</h3>
                                        <span className="chart-sub">Taxonomia controlada apontada no encerramento das OSs</span>
                                    </div>
                                </div>

                                <div className="chart-body causas-list-container">
                                    <div className="causas-list">
                                        {dadosDashboard.causasFrequentes.map((causa, idx) => (
                                            <div key={idx} className="causa-row">
                                                <div className="causa-info">
                                                    <span className="causa-nome">{causa.causa}</span>
                                                    <span className="causa-stats">
                                                        <strong>{causa.quantidade} {causa.quantidade === 1 ? 'OS' : 'OSs'}</strong>
                                                        <span className="causa-perc">({causa.percentual}%)</span>
                                                    </span>
                                                </div>
                                                <div className="causa-progress-track">
                                                    <div
                                                        className="causa-progress-fill"
                                                        style={{
                                                            width: `${Math.min(causa.percentual, 100)}%`,
                                                            backgroundColor: causa.cor
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rodapé discreto com controle de demonstração */}
                        <div className="section-footer-toggle">
                            <label className="toggle-mock-label" title="Marque para incluir dados simulados de teste ou desmarque para computar apenas OSs reais">
                                <input
                                    type="checkbox"
                                    checked={incluirMock}
                                    onChange={(e) => handleToggleMock(e.target.checked)}
                                />
                                <span>Incluir dados simulados de teste (Mock)</span>
                            </label>
                        </div>
                    </>
                )}
            </div>

            {/* Acesso rápido às áreas do sistema */}
            <div className="dashboard-grid">
                <div className="dashboard-card" onClick={() => navigate('/interno/servicos')}>
                    <div className="card-header-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                        </svg>
                    </div>
                    <h3>Ordens de Serviço</h3>
                    <p>Acompanhe orçamentos com o Assistente Inteligente, execução e encerramento de OSs de metrologia.</p>
                    <span className="card-link">Acessar OSs →</span>
                </div>

                <div className="dashboard-card" onClick={() => navigate('/interno/licoes')}>
                    <div className="card-header-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                            <path d="M6 6h10"/>
                            <path d="M6 10h10"/>
                        </svg>
                    </div>
                    <h3>Lições Aprendidas</h3>
                    <p>Consulte a base de conhecimento institucional, causas de desvio e boas práticas operacionais.</p>
                    <span className="card-link">Explorar Acervo →</span>
                </div>

                <div className="dashboard-card" onClick={() => navigate('/interno/vocabulario')}>
                    <div className="card-header-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>
                        </svg>
                    </div>
                    <h3>Vocabulário Controlado</h3>
                    <p>Padronização de termos, máquinas, causas de desvio e taxonomia do laboratório.</p>
                    <span className="card-link">Gerenciar Termos →</span>
                </div>
            </div>
        </div>
    );
};
