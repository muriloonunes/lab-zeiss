import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { contarPendentesValidacao } from '../../../services/licaoService';
import { listarServicos } from '../../../services/servicoService';
import {
    obterDadosDashboard,
    DadosDashboard,
    isModoDemoAtivo,
    setModoDemoAtivo
} from '../../../services/estatisticaServiceMock';
import './Dashboard.scss';

export const Dashboard: React.FC = () => {
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const [totalPendentes, setTotalPendentes] = useState<number>(0);
    const [totalDevolvidas, setTotalDevolvidas] = useState<number>(0);

    // Dados de Inteligência e Orçamento
    const [dadosDashboard, setDadosDashboard] = useState<DadosDashboard | null>(null);
    const [carregandoDados, setCarregandoDados] = useState<boolean>(true);
    const [modoDemo, setModoDemo] = useState<boolean>(isModoDemoAtivo());

    const isValidadorOuAdmin = usuario?.tipo === 'VALIDADOR' || usuario?.tipo === 'ADMINISTRADOR';

    // Sincroniza estado de modo de demonstração via eventos globais
    useEffect(() => {
        const handleDemoAlterado = (e: Event) => {
            const custom = e as CustomEvent<{ ativo: boolean }>;
            setModoDemo(custom.detail?.ativo ?? isModoDemoAtivo());
        };

        window.addEventListener('zeiss-modo-demo-alterado', handleDemoAlterado);
        return () => {
            window.removeEventListener('zeiss-modo-demo-alterado', handleDemoAlterado);
        };
    }, []);

    // Carrega pendências e alertas
    useEffect(() => {
        let isMounted = true;

        if (isValidadorOuAdmin) {
            contarPendentesValidacao()
                .then((resp) => {
                    if (isMounted) setTotalPendentes(resp.totalPendentes);
                })
                .catch(() => {});
        }

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

    // Carrega dados analíticos do Dashboard unificado
    useEffect(() => {
        let isMounted = true;
        setCarregandoDados(true);

        obterDadosDashboard()
            .then((dados) => {
                if (isMounted) {
                    setDadosDashboard(dados);
                }
            })
            .catch((err) => {
                console.error('Erro ao carregar dados analíticos do dashboard:', err);
            })
            .finally(() => {
                if (isMounted) {
                    setCarregandoDados(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [modoDemo]);

    const handleAlternarDemo = () => {
        const novo = !modoDemo;
        setModoDemo(novo);
        setModoDemoAtivo(novo);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    const primeiroNome = usuario?.nome ? usuario.nome.split(' ')[0] : 'Usuário';

    // Determina o valor máximo de horas para normalização do gráfico de barras
    const maxHorasMensal = dadosDashboard?.historicoMensal.reduce((max, h) => {
        return Math.max(max, h.horasOrcadas, h.horasRealizadas);
    }, 100) || 500;

    return (
        <div className="dashboard-page">
            {/* Header com Saudação e Toggle de Demonstração */}
            <div className="dashboard-header-container">
                <div className="dashboard-header">
                    <h1 className="dashboard-greeting">
                        {getGreeting()}, {primeiroNome}!
                    </h1>
                    <p className="dashboard-sub">
                        Gestão do Conhecimento em Orçamentação e Desempenho Operacional do Laboratório
                    </p>
                </div>

                <div className="dashboard-top-actions">
                    <button
                        type="button"
                        className={`btn-toggle-demo-header ${modoDemo ? 'ativo' : ''}`}
                        onClick={handleAlternarDemo}
                        title="Alternar entre base estrita da API ou base expandida de demonstração"
                    >
                        <span className="dot"></span>
                        <span className="label-demo">
                            {modoDemo ? 'Dados de Demonstração: Ligado' : 'Apenas Dados Reais da API'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Alerta de Lições Devolvidas para o Técnico */}
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

            {/* SEÇÃO ANALÍTICA: KPIS DE ORÇAMENTAÇÃO & APRENDIZADO */}
            <div className="dashboard-kpi-grid">
                {/* KPI 1: Assertividade */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">Assertividade de Orçamento</span>
                        <div className="kpi-icon-box">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="12" r="6" />
                                <circle cx="12" cy="12" r="2" />
                            </svg>
                        </div>
                    </div>
                    <div className="kpi-value-row">
                        <span className="kpi-value">
                            {carregandoDados ? '—' : `${dadosDashboard?.indicadores.indiceAssertividade}%`}
                        </span>
                    </div>
                    <span className="kpi-footer-text">
                        Serviços executados dentro da tolerância de ±15%
                    </span>
                </div>

                {/* KPI 2: Desvio Médio de Esforço */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">Desvio Médio de Esforço</span>
                        <div className="kpi-icon-box">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                        </div>
                    </div>
                    <div className="kpi-value-row">
                        <span className="kpi-value">
                            {carregandoDados
                                ? '—'
                                : `${(dadosDashboard?.indicadores.desvioMedioEsforco ?? 0) > 0 ? '+' : ''}${dadosDashboard?.indicadores.desvioMedioEsforco}%`}
                        </span>
                    </div>
                    <span className="kpi-footer-text">
                        Variação histórica média entre horas reais e orçadas
                    </span>
                </div>

                {/* KPI 3: Margem Realizada */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">Margem Média Realizada</span>
                        <div className="kpi-icon-box">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="1" x2="12" y2="23"/>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                        </div>
                    </div>
                    <div className="kpi-value-row">
                        <span className="kpi-value">
                            {carregandoDados ? '—' : `${dadosDashboard?.indicadores.margemOrcadaVsRealizada}%`}
                        </span>
                    </div>
                    <span className="kpi-footer-text">
                        Contribuição média após encerramento financeiro
                    </span>
                </div>

                {/* KPI 4: Conhecimento Formalizado */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">Lições Formalizadas</span>
                        <div className="kpi-icon-box">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10 9 9 9 8 9"/>
                            </svg>
                        </div>
                    </div>
                    <div className="kpi-value-row">
                        <span className="kpi-value">
                            {carregandoDados
                                ? '—'
                                : `${dadosDashboard?.indicadores.licoesFormalizadas} / ${dadosDashboard?.indicadores.totalOSConcluidas}`}
                        </span>
                    </div>
                    <span className="kpi-footer-text">
                        Aprendizados validados ativos no Assistente
                    </span>
                </div>
            </div>

            {/* SEÇÃO DE GRÁFICOS: COMPARATIVO MENSAL E CAUSAS FREQUENTES */}
            {dadosDashboard && (
                <div className="dashboard-charts-grid">
                    {/* Gráfico 1: Comparativo Mensal de Horas */}
                    <div className="chart-card">
                        <div className="chart-header">
                            <div className="chart-title-area">
                                <h3>Horas Orçadas vs. Realizadas</h3>
                                <p>Histórico mensal comparativo de esforço metrológico</p>
                            </div>
                            <div className="chart-legenda">
                                <span className="legenda-item">
                                    <span className="cor-dot orcadas"></span> Orçadas
                                </span>
                                <span className="legenda-item">
                                    <span className="cor-dot realizadas"></span> Realizadas
                                </span>
                            </div>
                        </div>

                        {dadosDashboard.historicoMensal.length === 0 ? (
                            <div className="chart-vazio">Sem dados de histórico mensal no período selecionado.</div>
                        ) : (
                            <div className="bar-chart-container">
                                {dadosDashboard.historicoMensal.map((item, idx) => {
                                    const alturaOrcada = Math.round((item.horasOrcadas / maxHorasMensal) * 100);
                                    const alturaRealizada = Math.round((item.horasRealizadas / maxHorasMensal) * 100);

                                    return (
                                        <div key={idx} className="bar-group">
                                            <div className="bars-pair">
                                                <div
                                                    className="bar bar-orcada"
                                                    style={{ height: `${alturaOrcada}%` }}
                                                    title={`Orçado: ${item.horasOrcadas}h`}
                                                >
                                                    <span className="bar-tooltip">{item.horasOrcadas}h</span>
                                                </div>
                                                <div
                                                    className="bar bar-realizada"
                                                    style={{ height: `${alturaRealizada}%` }}
                                                    title={`Realizado: ${item.horasRealizadas}h`}
                                                >
                                                    <span className="bar-tooltip">{item.horasRealizadas}h</span>
                                                </div>
                                            </div>
                                            <span className="bar-label">{item.mes}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Gráfico 2: Causas Mais Frequentes de Desvio */}
                    <div className="chart-card">
                        <div className="chart-header">
                            <div className="chart-title-area">
                                <h3>Principais Causas de Desvio</h3>
                                <p>Fatores que mais impactaram o tempo de execução</p>
                            </div>
                        </div>

                        {dadosDashboard.causasFrequentes.length === 0 ? (
                            <div className="chart-vazio">Nenhum desvio registrado até o momento.</div>
                        ) : (
                            <div className="causas-lista">
                                {dadosDashboard.causasFrequentes.map((c, idx) => (
                                    <div key={idx} className="causa-row">
                                        <div className="causa-info">
                                            <span className="causa-nome">{c.causa}</span>
                                            <span className="causa-stats">
                                                <strong>{c.quantidade}</strong> ({c.percentual}%)
                                            </span>
                                        </div>
                                        <div className="causa-progress-bg">
                                            <div
                                                className="causa-progress-fill"
                                                style={{
                                                    width: `${c.percentual}%`,
                                                    backgroundColor: c.cor || '#141e8c'
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

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
                    <p>Acompanhe orçamentos, execução de serviços e encerramento de OSs de metrologia.</p>
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
