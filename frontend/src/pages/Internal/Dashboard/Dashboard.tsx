import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { contarPendentesValidacao } from '../../../services/licaoService';
import { listarServicos } from '../../../services/servicoService';
import './Dashboard.scss';

export const Dashboard: React.FC = () => {
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const [totalPendentes, setTotalPendentes] = useState<number>(0);
    const [totalDevolvidas, setTotalDevolvidas] = useState<number>(0);

    const isValidadorOuAdmin = usuario?.tipo === 'VALIDADOR' || usuario?.tipo === 'ADMINISTRADOR';

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

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    const primeiroNome = usuario?.nome ? usuario.nome.split(' ')[0] : 'Usuário';

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1 className="dashboard-greeting">
                    {getGreeting()}, {primeiroNome}!
                </h1>
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
