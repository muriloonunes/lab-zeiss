import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../components/Toast';
import {
    listarBaseConhecimento,
    listarPendentesValidacao,
    contarPendentesValidacao,
    aprovarLicao,
    devolverLicao,
    marcarComoSuperada,
    reativarLicao,
} from '../../../services/licaoService';
import { listarClasses, listarTermosPorClasse } from '../../../services/vocabularioService';
import { TermoVocabulario } from '../../../types/vocabulario';
import { RegistroServico } from '../../../types/servico';
import './Licoes.scss';

interface GrupoClasseTermos {
    classeId: number;
    classeNome: string;
    termos: TermoVocabulario[];
}

export const Licoes: React.FC = () => {
    const { usuario } = useAuth();
    const { mostrarToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();

    const isValidadorOuAdmin = usuario?.tipo === 'VALIDADOR' || usuario?.tipo === 'ADMINISTRADOR';

    const abaInicial = searchParams.get('aba') === 'validacao' && isValidadorOuAdmin ? 'validacao' : 'conhecimento';
    const [abaAtiva, setAbaAtiva] = useState<'conhecimento' | 'validacao'>(abaInicial);

    const [licoes, setLicoes] = useState<RegistroServico[]>([]);
    const [totalPendentes, setTotalPendentes] = useState<number>(0);
    const [carregando, setCarregando] = useState<boolean>(true);

    // Filtros da Base de Conhecimento
    const [filtroStatus, setFiltroStatus] = useState<string>('TODAS');
    const [busca, setBusca] = useState<string>('');
    const [termoFiltroId, setTermoFiltroId] = useState<number | null>(null);
    const [gruposVocabulario, setGruposVocabulario] = useState<GrupoClasseTermos[]>([]);

    // Modal de Detalhe Completo
    const [licaoSelecionada, setLicaoSelecionada] = useState<RegistroServico | null>(null);

    // Modal de Devolução (para informar motivo de ajuste ao técnico)
    const [modalDevolverAberto, setModalDevolverAberto] = useState<boolean>(false);
    const [motivoDevolucao, setMotivoDevolucao] = useState<string>('');
    const [processandoAcao, setProcessandoAcao] = useState<boolean>(false);

    // Carregar termos de vocabulário para o seletor de filtros
    useEffect(() => {
        const carregarVocabulario = async () => {
            try {
                const classes = await listarClasses(true);
                const grupos: GrupoClasseTermos[] = [];
                for (const c of classes) {
                    const termos = await listarTermosPorClasse(c.id, true);
                    if (termos && termos.length > 0) {
                        grupos.push({
                            classeId: c.id,
                            classeNome: c.nome,
                            termos,
                        });
                    }
                }
                setGruposVocabulario(grupos);
            } catch {
                // Silencioso
            }
        };
        carregarVocabulario();
    }, []);

    const termoAtivoNome = useMemo(() => {
        if (!termoFiltroId) return null;
        for (const g of gruposVocabulario) {
            const achado = g.termos.find((t) => t.id === termoFiltroId);
            if (achado) return achado.descricao;
        }
        return `Termo #${termoFiltroId}`;
    }, [termoFiltroId, gruposVocabulario]);

    const carregarContagemPendentes = useCallback(async () => {
        if (!isValidadorOuAdmin) return;
        try {
            const resp = await contarPendentesValidacao();
            setTotalPendentes(resp.totalPendentes);
        } catch {
            // Falha silenciosa
        }
    }, [isValidadorOuAdmin]);

    const carregarLicoes = useCallback(async () => {
        setCarregando(true);
        try {
            if (abaAtiva === 'validacao' && isValidadorOuAdmin) {
                const dados = await listarPendentesValidacao();
                setLicoes(dados);
            } else {
                const statusQuery = filtroStatus === 'TODAS' ? undefined : filtroStatus;
                const dados = await listarBaseConhecimento({
                    status: statusQuery,
                    termoId: termoFiltroId || undefined,
                    busca: busca.trim() || undefined,
                });
                setLicoes(dados);
            }
        } catch {
            mostrarToast('error', 'Falha ao carregar as lições aprendidas.');
        } finally {
            setCarregando(false);
        }
    }, [abaAtiva, filtroStatus, termoFiltroId, busca, isValidadorOuAdmin, mostrarToast]);

    useEffect(() => {
        carregarContagemPendentes();
    }, [carregarContagemPendentes]);

    useEffect(() => {
        carregarLicoes();
    }, [carregarLicoes]);

    // Ao carregar a lista de lições, se houver servicoId na URL, abre automaticamente o detalhe
    useEffect(() => {
        const idParam = searchParams.get('servicoId');
        if (idParam && licoes.length > 0) {
            const encontrada = licoes.find((l) => l.id === Number(idParam));
            if (encontrada) {
                setLicaoSelecionada(encontrada);
            }
        }
    }, [licoes, searchParams]);

    const handleTrocarAba = (novaAba: 'conhecimento' | 'validacao') => {
        setAbaAtiva(novaAba);
        setSearchParams(novaAba === 'validacao' ? { aba: 'validacao' } : {});
        setLicaoSelecionada(null);
    };

    const handleFiltrarPorTermo = (idTermo: number) => {
        setTermoFiltroId(idTermo);
        if (abaAtiva !== 'conhecimento') {
            setAbaAtiva('conhecimento');
            setSearchParams({});
        }
        setLicaoSelecionada(null);
    };

    const handleAprovar = async (servicoId: number) => {
        setProcessandoAcao(true);
        try {
            const atualizado = await aprovarLicao(servicoId);
            mostrarToast('success', `Lição da OS ${atualizado.codigo} formalizada com sucesso! Notificações enviadas aos assinantes.`);
            setLicaoSelecionada(null);
            carregarLicoes();
            carregarContagemPendentes();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro ao aprovar lição.';
            mostrarToast('error', msg);
        } finally {
            setProcessandoAcao(false);
        }
    };

    const handleAbrirDevolver = (servico: RegistroServico) => {
        setLicaoSelecionada(servico);
        setMotivoDevolucao('');
        setModalDevolverAberto(true);
    };

    const handleConfirmarDevolucao = async () => {
        if (!licaoSelecionada) return;
        if (!motivoDevolucao.trim()) {
            mostrarToast('error', 'Informe o motivo e as orientações para o técnico ajustar.');
            return;
        }

        setProcessandoAcao(true);
        try {
            const atualizado = await devolverLicao(licaoSelecionada.id, motivoDevolucao.trim());
            mostrarToast('info', `Lição da OS ${atualizado.codigo} devolvida para ajuste com notificação ao técnico.`);
            setModalDevolverAberto(false);
            setLicaoSelecionada(null);
            carregarLicoes();
            carregarContagemPendentes();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro ao devolver lição.';
            mostrarToast('error', msg);
        } finally {
            setProcessandoAcao(false);
        }
    };

    const handleSuperar = async (servicoId: number) => {
        setProcessandoAcao(true);
        try {
            const atualizado = await marcarComoSuperada(servicoId);
            mostrarToast('info', `Lição da OS ${atualizado.codigo} marcada como superada.`);
            if (licaoSelecionada?.id === servicoId) {
                setLicaoSelecionada(atualizado);
            }
            carregarLicoes();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro ao marcar como superada.';
            mostrarToast('error', msg);
        } finally {
            setProcessandoAcao(false);
        }
    };

    const handleReativar = async (servicoId: number) => {
        setProcessandoAcao(true);
        try {
            const atualizado = await reativarLicao(servicoId);
            mostrarToast('success', `Lição da OS ${atualizado.codigo} reativada com status formalizada.`);
            if (licaoSelecionada?.id === servicoId) {
                setLicaoSelecionada(atualizado);
            }
            carregarLicoes();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro ao reativar lição.';
            mostrarToast('error', msg);
        } finally {
            setProcessandoAcao(false);
        }
    };

    const formatarData = (dataIso?: string) => {
        if (!dataIso) return '-';
        try {
            return new Date(dataIso).toLocaleDateString('pt-BR');
        } catch {
            return dataIso;
        }
    };

    return (
        <div className="licoes-page">
            {/* Header da Página */}
            <div className="licoes-header">
                <div className="header-titles">
                    <h2>Gestão de Lições Aprendidas</h2>
                    <p>Repositório de conhecimento técnico e esteira de validação de relatos operacionais.</p>
                </div>
            </div>

            {/* Abas Superiores */}
            <div className="licoes-nav-tabs">
                <button
                    className={`nav-tab-btn ${abaAtiva === 'conhecimento' ? 'active' : ''}`}
                    onClick={() => handleTrocarAba('conhecimento')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                        <path d="M6 6h10"/>
                        <path d="M6 10h10"/>
                    </svg>
                    <span>Repositório de Lições</span>
                </button>

                {isValidadorOuAdmin && (
                    <button
                        className={`nav-tab-btn ${abaAtiva === 'validacao' ? 'active' : ''}`}
                        onClick={() => handleTrocarAba('validacao')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 11l3 3L22 4"/>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                        </svg>
                        <span>Fila de Validação</span>
                        {totalPendentes > 0 && (
                            <span className="tab-badge-count">{totalPendentes}</span>
                        )}
                    </button>
                )}
            </div>

            {/* Barra de Filtros e Busca */}
            <div className="licoes-toolbar">
                {abaAtiva === 'conhecimento' ? (
                    <>
                        <div className="status-filters">
                            <button
                                className={`filter-btn ${filtroStatus === 'TODAS' ? 'active' : ''}`}
                                onClick={() => setFiltroStatus('TODAS')}
                            >
                                Todas
                            </button>
                            <button
                                className={`filter-btn ${filtroStatus === 'FORMALIZADA' ? 'active' : ''}`}
                                onClick={() => setFiltroStatus('FORMALIZADA')}
                            >
                                Vigentes
                            </button>
                            <button
                                className={`filter-btn ${filtroStatus === 'SUPERADA' ? 'active' : ''}`}
                                onClick={() => setFiltroStatus('SUPERADA')}
                            >
                                Superadas (Defasadas)
                            </button>
                        </div>

                        <div className="termo-filter-select">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                                <line x1="7" y1="7" x2="7.01" y2="7" />
                            </svg>
                            <select
                                value={termoFiltroId ?? ''}
                                onChange={(e) => setTermoFiltroId(e.target.value ? Number(e.target.value) : null)}
                                aria-label="Filtrar por assunto ou causa de desvio"
                            >
                                <option value="">Todos os Assuntos / Vocabulário</option>
                                {gruposVocabulario.map((g) => (
                                    <optgroup key={g.classeId} label={g.classeNome}>
                                        {g.termos.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.descricao}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        <div className="search-box">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar por termo, causa, relato ou OS..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                            />
                        </div>
                    </>
                ) : (
                    <div className="validation-helper-text">
                        <span>
                            As lições abaixo foram concluídas pelos técnicos e aguardam validação técnica para formalização no repositório.
                        </span>
                    </div>
                )}
            </div>

            {/* Chip de Filtro por Termo Ativo */}
            {abaAtiva === 'conhecimento' && termoFiltroId && (
                <div className="filtro-ativo-pill">
                    <span className="pill-label">Filtrando por assunto:</span>
                    <span className="pill-termo">#{termoAtivoNome}</span>
                    <button
                        type="button"
                        className="btn-limpar-termo"
                        onClick={() => setTermoFiltroId(null)}
                        title="Remover filtro de assunto"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Conteúdo Principal */}
            <div className="licoes-container">
                {carregando ? (
                    <div className="licoes-feedback-state">
                        <div className="spinner-sutil" />
                        <span>Carregando lições aprendidas...</span>
                    </div>
                ) : licoes.length === 0 ? (
                    <div className="licoes-feedback-state">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                        <p>
                            {abaAtiva === 'validacao'
                                ? 'Nenhuma lição pendente de validação no momento.'
                                : 'Nenhuma lição encontrada com os filtros informados.'}
                        </p>
                        {termoFiltroId && (
                            <button className="btn-limpar-busca" onClick={() => setTermoFiltroId(null)}>
                                Limpar filtro de assunto
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="licoes-grid">
                        {licoes.map((s) => {
                            const aprendizado = s.blocoAprendizado;
                            const isSuperada = aprendizado?.statusLicao === 'SUPERADA';
                            const isPendente = aprendizado?.statusLicao === 'EM_VALIDACAO';

                            return (
                                <div
                                    key={s.id}
                                    className={`licao-card ${isSuperada ? 'superada' : ''} ${isPendente ? 'pendente' : ''}`}
                                    onClick={() => setLicaoSelecionada(s)}
                                >
                                    <div className="card-top-meta">
                                        <span className="card-os-code">{s.codigo}</span>
                                        <div className="card-status-indicator">
                                            {isSuperada ? (
                                                <span className="status-label status-superada">Superada</span>
                                            ) : isPendente ? (
                                                <span className="status-label status-pendente">Em Validação</span>
                                            ) : (
                                                <span className="status-label status-vigente">Vigente</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="card-causa">
                                        <span className="label-causa">Causa do Desvio:</span>
                                        <h4
                                            className={`nome-causa ${aprendizado?.causaDesvio ? 'clicavel' : ''}`}
                                            onClick={(e) => {
                                                if (aprendizado?.causaDesvio?.id) {
                                                    e.stopPropagation();
                                                    handleFiltrarPorTermo(aprendizado.causaDesvio.id);
                                                }
                                            }}
                                            title={aprendizado?.causaDesvio ? `Filtrar lições pela causa "${aprendizado.causaDesvio.descricao}"` : undefined}
                                        >
                                            {aprendizado?.causaDesvio?.descricao || 'Não informada'}
                                        </h4>
                                    </div>

                                    <p className="card-resumo-texto">
                                        {aprendizado?.licaoAprendida || 'Sem relato informado.'}
                                    </p>

                                    {aprendizado?.assuntosRelacionados && aprendizado.assuntosRelacionados.length > 0 && (
                                        <div className="card-assuntos-list">
                                            {aprendizado.assuntosRelacionados.map((ass) => (
                                                <span
                                                    key={ass.id}
                                                    className={`assunto-tag ${termoFiltroId === ass.id ? 'active' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleFiltrarPorTermo(ass.id);
                                                    }}
                                                    title={`Filtrar lições por #${ass.descricao}`}
                                                >
                                                    #{ass.descricao}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="card-footer-info">
                                        <span className="card-data">{formatarData(s.dataCriacao)}</span>
                                        <span className="card-ver-mais">Ver detalhes →</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal de Detalhe Completo da Lição */}
            {licaoSelecionada && !modalDevolverAberto && (
                <div className="licao-modal-backdrop" onClick={() => setLicaoSelecionada(null)}>
                    <div className="licao-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="header-meta">
                                <span className="os-badge">Ordem de Serviço {licaoSelecionada.codigo}</span>
                                <h3>
                                    {licaoSelecionada.blocoAprendizado?.causaDesvio?.descricao || 'Causa não categorizada'}
                                </h3>
                                <span className="modal-subtitle">
                                    Serviço: {licaoSelecionada.blocoOrcamento?.tipoServico?.descricao || '-'} • Recurso: {licaoSelecionada.blocoOrcamento?.recurso?.descricao || '-'}
                                </span>
                            </div>
                            <button className="btn-close" onClick={() => setLicaoSelecionada(null)} title="Fechar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Alerta se estiver superada */}
                            {licaoSelecionada.blocoAprendizado?.statusLicao === 'SUPERADA' && (
                                <div className="alerta-superada">
                                    <strong>Lição Marcada como Superada / Defasada</strong>
                                    <p>Esta lição foi substituída por novas práticas operacionais e permanece arquivada apenas para fins de histórico técnico.</p>
                                </div>
                            )}

                            {/* Alerta de motivo de rejeição se existente */}
                            {licaoSelecionada.blocoAprendizado?.motivoRejeicao && (
                                <div className="alerta-rejeicao">
                                    <strong>Último apontamento de devolução:</strong>
                                    <p>"{licaoSelecionada.blocoAprendizado.motivoRejeicao}"</p>
                                </div>
                            )}

                            <div className="secao-detalhe">
                                <h5>Relato da Lição Aprendida</h5>
                                <div className="texto-licao-completo">
                                    {licaoSelecionada.blocoAprendizado?.licaoAprendida}
                                </div>
                            </div>

                            {licaoSelecionada.blocoAprendizado?.assuntosRelacionados && licaoSelecionada.blocoAprendizado.assuntosRelacionados.length > 0 && (
                                <div className="secao-detalhe">
                                    <h5>Assuntos e Termos do Vocabulário Vinculados</h5>
                                    <div className="assuntos-detalhe-list">
                                        {licaoSelecionada.blocoAprendizado.assuntosRelacionados.map((ass) => (
                                            <span
                                                key={ass.id}
                                                className={`assunto-tag-destaque clicavel ${termoFiltroId === ass.id ? 'active' : ''}`}
                                                onClick={() => handleFiltrarPorTermo(ass.id)}
                                                title={`Filtrar lições por #${ass.descricao}`}
                                            >
                                                #{ass.descricao}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="secao-detalhe grid-meta">
                                <div>
                                    <span className="meta-label">Responsável pela OS:</span>
                                    <span className="meta-val">
                                        {licaoSelecionada.blocoOrcamento?.responsavelEstimativa?.nome || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="meta-label">Data de Registro:</span>
                                    <span className="meta-val">{formatarData(licaoSelecionada.dataCriacao)}</span>
                                </div>
                                <div>
                                    <span className="meta-label">Visibilidade:</span>
                                    <span className="meta-val">
                                        {licaoSelecionada.blocoAprendizado?.restrito ? 'Restrito a Técnicos' : 'Institucional'}
                                    </span>
                                </div>
                                <div>
                                    <span className="meta-label">Status da Lição:</span>
                                    <span className="meta-val">{licaoSelecionada.blocoAprendizado?.statusLicao}</span>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <div className="footer-left">
                                <button className="btn-secundario" onClick={() => setLicaoSelecionada(null)}>
                                    Fechar
                                </button>
                            </div>

                            {isValidadorOuAdmin && (
                                <div className="footer-right">
                                    {/* Ações da Fila de Validação */}
                                    {licaoSelecionada.blocoAprendizado?.statusLicao === 'EM_VALIDACAO' && (
                                        <>
                                            <button
                                                className="btn-devolver"
                                                onClick={() => handleAbrirDevolver(licaoSelecionada)}
                                                disabled={processandoAcao}
                                            >
                                                Devolver para Ajuste
                                            </button>
                                            <button
                                                className="btn-aprovar"
                                                onClick={() => handleAprovar(licaoSelecionada.id)}
                                                disabled={processandoAcao}
                                            >
                                                Aprovar & Formalizar
                                            </button>
                                        </>
                                    )}

                                    {/* Ações do Repositório (Superar / Reativar) */}
                                    {licaoSelecionada.blocoAprendizado?.statusLicao === 'FORMALIZADA' && (
                                        <button
                                            className="btn-superar"
                                            onClick={() => handleSuperar(licaoSelecionada.id)}
                                            disabled={processandoAcao}
                                            title="Marca como defasada, mantendo o histórico"
                                        >
                                            Marcar como Superada
                                        </button>
                                    )}

                                    {licaoSelecionada.blocoAprendizado?.statusLicao === 'SUPERADA' && (
                                        <button
                                            className="btn-reativar"
                                            onClick={() => handleReativar(licaoSelecionada.id)}
                                            disabled={processandoAcao}
                                        >
                                            Reativar Lição
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Devolução (Motivo de Ajuste) */}
            {modalDevolverAberto && licaoSelecionada && (
                <div className="licao-modal-backdrop" onClick={() => setModalDevolverAberto(false)}>
                    <div className="licao-modal modal-devolver" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="header-meta">
                                <span className="os-badge">OS {licaoSelecionada.codigo}</span>
                                <h3>Devolver Lição para Correção</h3>
                            </div>
                            <button className="btn-close" onClick={() => setModalDevolverAberto(false)} title="Fechar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="modal-body">
                            <p className="texto-instrucao">
                                Indique objetivamente ao técnico o que precisa ser complementado ou corrigido no relato da lição ou na classificação dos termos. O técnico receberá uma notificação direta no sistema.
                            </p>
                            <div className="form-group">
                                <label htmlFor="motivoDevolucao">Motivo / Orientações do Validador *</label>
                                <textarea
                                    id="motivoDevolucao"
                                    rows={4}
                                    placeholder="Ex.: Por favor, detalhe qual dispositivo de fixação foi adotado para corrigir o desvio na medição..."
                                    value={motivoDevolucao}
                                    onChange={(e) => setMotivoDevolucao(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-secundario"
                                onClick={() => setModalDevolverAberto(false)}
                                disabled={processandoAcao}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn-devolver-confirmar"
                                onClick={handleConfirmarDevolucao}
                                disabled={processandoAcao || !motivoDevolucao.trim()}
                            >
                                {processandoAcao ? 'Enviando...' : 'Confirmar Devolução'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
