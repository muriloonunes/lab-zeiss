import React, { useEffect, useMemo, useState } from 'react';
import {
    RegistroServico,
    STATUS_SERVICO_LABELS,
    FinalizarServicoPayload,
} from '../../../types/servico';
import {
    listarServicos,
    iniciarExecucaoServico,
    cancelarServico,
    salvarRascunhoServico,
    concluirServico,
} from '../../../services/servicoService';
import { listarClasses, listarTermosPorClasse } from '../../../services/vocabularioService';
import { TermoVocabulario } from '../../../types/vocabulario';
import { ModalCriarServico } from './components/ModalCriarServico/ModalCriarServico';
import { useToast } from '../../../components/Toast';
import './Servicos.scss';

export const Servicos: React.FC = () => {
    const { mostrarToast } = useToast();

    const [servicos, setServicos] = useState<RegistroServico[]>([]);
    const [carregando, setCarregando] = useState(true);

    // Filtros
    const [busca, setBusca] = useState('');
    const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

    // Modais
    const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
    const [modalFinalizarAberto, setModalFinalizarAberto] = useState(false);
    const [modalCancelarAberto, setModalCancelarAberto] = useState(false);
    const [modalCriarAberto, setModalCriarAberto] = useState(false);

    // Serviço Selecionado
    const [selecionado, setSelecionado] = useState<RegistroServico | null>(null);

    // Vocabulários para Finalização (Bloco B e C)
    const [causasDesvio, setCausasDesvio] = useState<TermoVocabulario[]>([]);
    const [todosTermos, setTodosTermos] = useState<TermoVocabulario[]>([]);

    // Estados do Formulário de Finalização / Rascunho
    const [horasRealizadas, setHorasRealizadas] = useState<number | ''>('');
    const [custoReal, setCustoReal] = useState<number | ''>('');
    const [valorFaturado, setValorFaturado] = useState<number | ''>('');
    const [dataRealEntrega, setDataRealEntrega] = useState<string>(new Date().toISOString().split('T')[0]);
    const [houveRetrabalho, setHouveRetrabalho] = useState(false);
    const [houveMudancaEscopo, setHouveMudancaEscopo] = useState(false);
    const [causaDesvioId, setCausaDesvioId] = useState<number | ''>('');
    const [licaoAprendida, setLicaoAprendida] = useState('');
    const [assuntosRelacionadosIds, setAssuntosRelacionadosIds] = useState<number[]>([]);
    const [restrito, setRestrito] = useState(false);

    // Estado do Modal de Cancelamento
    const [motivoCancelamento, setMotivoCancelamento] = useState('');

    const [salvandoAcao, setSalvandoAcao] = useState(false);

    const carregarServicos = async () => {
        setCarregando(true);
        try {
            const data = await listarServicos();
            setServicos(data);
        } catch (err: unknown) {
            mostrarToast('error', 'Não foi possível carregar as Ordens de Serviço.');
        } finally {
            setCarregando(false);
        }
    };

    const carregarVocabularios = async () => {
        try {
            const classes = await listarClasses(true);
            for (const c of classes) {
                const nomeLower = c.nome.toLowerCase();
                if (nomeLower === 'causa do desvio') {
                    const termos = await listarTermosPorClasse(c.id, true);
                    setCausasDesvio(termos);
                }
            }

            // Carrega termos de todas as classes para assuntos relacionados
            const promessas = classes.map(c => listarTermosPorClasse(c.id, true));
            const resultados = await Promise.all(promessas);
            const combinados = resultados.flat();
            setTodosTermos(combinados);
        } catch (err: unknown) {
            console.error('Erro ao carregar vocabulários de apoio:', err);
        }
    };

    useEffect(() => {
        carregarServicos();
        carregarVocabularios();
    }, []);

    // Contadores
    const contadores = useMemo(() => {
        const total = servicos.length;
        const orcados = servicos.filter(s => s.status === 'ORCADO').length;
        const emExecucao = servicos.filter(s => s.status === 'EM_EXECUCAO').length;
        const concluidos = servicos.filter(s => s.status === 'CONCLUIDO').length;
        const cancelados = servicos.filter(s => s.status === 'CANCELADO').length;
        return { total, orcados, emExecucao, concluidos, cancelados };
    }, [servicos]);

    // Filtragem
    const servicosFiltrados = useMemo(() => {
        return servicos.filter((s) => {
            const query = busca.toLowerCase().trim();
            const matchBusca =
                !query ||
                s.codigo.toLowerCase().includes(query) ||
                s.blocoOrcamento?.tipoServico?.descricao.toLowerCase().includes(query) ||
                s.blocoOrcamento?.recurso?.descricao.toLowerCase().includes(query) ||
                s.blocoOrcamento?.responsavelEstimativa?.nome.toLowerCase().includes(query);

            const matchStatus = filtroStatus === 'TODOS' || s.status === filtroStatus;
            return matchBusca && matchStatus;
        });
    }, [servicos, busca, filtroStatus]);

    // Ações
    const abrirDetalhes = (s: RegistroServico) => {
        setSelecionado(s);
        setModalDetalhesAberto(true);
    };

    const handleServicoCriadoComSucesso = (criado: RegistroServico) => {
        setServicos(prev => [criado, ...prev]);
        mostrarToast('success', `Ordem de Serviço ${criado.codigo} criada com sucesso!`);
    };

    const handleIniciarExecucao = async (s: RegistroServico, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSalvandoAcao(true);
        try {
            const atualizado = await iniciarExecucaoServico(s.id);
            setServicos(prev => prev.map(item => item.id === atualizado.id ? atualizado : item));
            mostrarToast('success', `Serviço ${s.codigo} colocado em execução.`);
            if (modalDetalhesAberto && selecionado?.id === s.id) {
                setSelecionado(atualizado);
            }
        } catch (err: unknown) {
            mostrarToast('error', 'Falha ao iniciar execução do serviço.');
        } finally {
            setSalvandoAcao(false);
        }
    };

    const abrirModalCancelar = (s: RegistroServico, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelecionado(s);
        setMotivoCancelamento('');
        setModalCancelarAberto(true);
    };

    const handleConfirmarCancelamento = async () => {
        if (!selecionado) return;

        if (!motivoCancelamento.trim()) {
            mostrarToast('error', 'Por favor, informe o motivo do cancelamento.');
            return;
        }

        setSalvandoAcao(true);
        try {
            const atualizado = await cancelarServico(selecionado.id, motivoCancelamento.trim());
            setServicos(prev => prev.map(item => item.id === atualizado.id ? atualizado : item));
            mostrarToast('info', `Serviço ${selecionado.codigo} cancelado com sucesso.`);
            setModalCancelarAberto(false);
            if (modalDetalhesAberto) {
                setSelecionado(atualizado);
            }
        } catch (err: unknown) {
            mostrarToast('error', 'Não foi possível cancelar o serviço.');
        } finally {
            setSalvandoAcao(false);
        }
    };

    const abrirModalFinalizar = (s: RegistroServico, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelecionado(s);

        // Preenche com valores do bloco realizado caso já existam ou sugere os do orçamento
        setHorasRealizadas(s.blocoRealizado?.horasRealizadas ?? s.blocoOrcamento?.horasEstimadas ?? '');
        setCustoReal(s.blocoRealizado?.custoReal ?? s.blocoOrcamento?.custoEstimado ?? '');
        setValorFaturado(s.blocoRealizado?.valorFaturado ?? s.blocoOrcamento?.valorProposto ?? '');
        setDataRealEntrega(s.blocoRealizado?.dataRealEntrega ?? new Date().toISOString().split('T')[0]);
        setHouveRetrabalho(s.blocoRealizado?.houveRetrabalho ?? false);
        setHouveMudancaEscopo(s.blocoRealizado?.houveMudancaEscopo ?? false);

        setCausaDesvioId(s.blocoAprendizado?.causaDesvio?.id ?? (causasDesvio[0]?.id || ''));
        setLicaoAprendida(s.blocoAprendizado?.licaoAprendida ?? '');
        setAssuntosRelacionadosIds(s.blocoAprendizado?.assuntosRelacionados?.map(a => a.id) ?? []);
        setRestrito(s.blocoAprendizado?.restrito ?? false);

        setModalFinalizarAberto(true);
    };

    const toggleAssuntoRelacionado = (termoId: number) => {
        setAssuntosRelacionadosIds(prev =>
            prev.includes(termoId) ? prev.filter(id => id !== termoId) : [...prev, termoId]
        );
    };

    const handleSubmeterFinalizacao = async (ehConclusao: boolean) => {
        if (!selecionado) return;

        if (!horasRealizadas || !custoReal || !valorFaturado) {
            mostrarToast('error', 'Preencha as horas realizadas, custo real e valor faturado.');
            return;
        }

        if (!causaDesvioId) {
            mostrarToast('error', 'Selecione a Causa do Desvio / Ocorrência.');
            return;
        }

        if (!licaoAprendida.trim()) {
            mostrarToast('error', 'Descreva a Lição Aprendida com a execução do serviço.');
            return;
        }

        const payload: FinalizarServicoPayload = {
            horasRealizadas: Number(horasRealizadas),
            custoReal: Number(custoReal),
            valorFaturado: Number(valorFaturado),
            dataRealEntrega,
            houveRetrabalho,
            houveMudancaEscopo,
            causaDesvioId: Number(causaDesvioId),
            licaoAprendida,
            assuntosRelacionadosIds,
            restrito,
        };

        setSalvandoAcao(true);
        try {
            let atualizado: RegistroServico;
            if (ehConclusao) {
                atualizado = await concluirServico(selecionado.id, payload);
                mostrarToast('success', `Serviço ${selecionado.codigo} concluído com sucesso e lição aprendida registrada!`);
            } else {
                atualizado = await salvarRascunhoServico(selecionado.id, payload);
                mostrarToast('info', `Rascunho do serviço ${selecionado.codigo} salvo.`);
            }

            setServicos(prev => prev.map(item => item.id === atualizado.id ? atualizado : item));
            setModalFinalizarAberto(false);
            if (modalDetalhesAberto) setModalDetalhesAberto(false);
        } catch (err: unknown) {
            mostrarToast('error', 'Falha ao processar o fechamento do serviço.');
        } finally {
            setSalvandoAcao(false);
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

    const formatarMoeda = (val?: number) => {
        if (val === undefined || val === null) return '-';
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="servicos-page">
            {/* Cabeçalho */}
            <div className="servicos-header">
                <div className="header-info">
                    <h1>Ordens de Serviço do Laboratório</h1>
                    <p>Controle das etapas operacionais (Orçamento ➔ Execução ➔ Conclusão & Aprendizado contínuo).</p>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={carregarServicos} disabled={carregando} title="Recarregar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={carregando ? 'spin-icon' : ''}>
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                        </svg>
                        <span>Atualizar</span>
                    </button>

                    <button className="btn-new-os" onClick={() => setModalCriarAberto(true)} title="Criar nova Ordem de Serviço">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span>Nova Ordem de Serviço</span>
                    </button>
                </div>
            </div>

            {/* Barra de Controles e Status */}
            <div className="servicos-controls-bar">
                <div className="status-filters">
                    <button
                        type="button"
                        className={`filter-tab ${filtroStatus === 'TODOS' ? 'active' : ''}`}
                        onClick={() => setFiltroStatus('TODOS')}
                    >
                        Todos ({contadores.total})
                    </button>
                    <button
                        type="button"
                        className={`filter-tab tab-orcado ${filtroStatus === 'ORCADO' ? 'active' : ''}`}
                        onClick={() => setFiltroStatus('ORCADO')}
                    >
                        Orçados ({contadores.orcados})
                    </button>
                    <button
                        type="button"
                        className={`filter-tab tab-em_execucao ${filtroStatus === 'EM_EXECUCAO' ? 'active' : ''}`}
                        onClick={() => setFiltroStatus('EM_EXECUCAO')}
                    >
                        Em Execução ({contadores.emExecucao})
                    </button>
                    <button
                        type="button"
                        className={`filter-tab tab-concluido ${filtroStatus === 'CONCLUIDO' ? 'active' : ''}`}
                        onClick={() => setFiltroStatus('CONCLUIDO')}
                    >
                        Concluídos ({contadores.concluidos})
                    </button>
                    <button
                        type="button"
                        className={`filter-tab tab-cancelado ${filtroStatus === 'CANCELADO' ? 'active' : ''}`}
                        onClick={() => setFiltroStatus('CANCELADO')}
                    >
                        Cancelados ({contadores.cancelados})
                    </button>
                </div>

                <div className="search-filter-group">
                    <div className="search-input-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar por código de OS, máquina, tipo ou técnico..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Tabela de Serviços */}
            <div className="servicos-table-card">
                {carregando ? (
                    <div className="loading-state">
                        <span className="spinner" />
                        <span>Carregando ordens de serviço...</span>
                    </div>
                ) : servicosFiltrados.length === 0 ? (
                    <div className="empty-state">
                        <p>Nenhuma ordem de serviço encontrada.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table>
                            <thead>
                            <tr>
                                <th>Ordem de Serviço</th>
                                <th>Serviço / Recurso</th>
                                <th>Características</th>
                                <th>Horas (Est. / Real)</th>
                                <th>Valores (Prop. / Fat.)</th>
                                <th>Status</th>
                                <th>Data</th>
                                <th style={{ textAlign: 'right' }}>Ações</th>
                            </tr>
                            </thead>
                            <tbody>
                            {servicosFiltrados.map((s) => (
                                <tr key={s.id} onClick={() => abrirDetalhes(s)} className="clickable-row">
                                    <td>
                                        <span className="os-code-text">{s.codigo}</span>
                                    </td>
                                    <td>
                                        <div className="service-type-cell">
                                            <span className="service-name">{s.blocoOrcamento?.tipoServico?.descricao || 'Serviço'}</span>
                                            <span className="recurso-name">{s.blocoOrcamento?.recurso?.descricao || 'Recurso'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="tags-list-cell">
                                            {s.blocoOrcamento?.caracteristicasPeca?.map(c => (
                                                <span key={c.id} className="tag-item">{c.descricao}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="hours-cell">
                                            <span className="main-val">{s.blocoOrcamento?.horasEstimadas}h est.</span>
                                            {s.blocoRealizado?.horasRealizadas && (
                                                <span className="sub-val">{s.blocoRealizado.horasRealizadas}h real</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="values-cell">
                                            <span className="main-val">{formatarMoeda(s.blocoOrcamento?.valorProposto)}</span>
                                            {s.blocoRealizado?.valorFaturado && (
                                                <span className="sub-val">{formatarMoeda(s.blocoRealizado.valorFaturado)}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-indicator status-${s.status.toLowerCase()}`}>
                                            <span className="dot" />
                                            {STATUS_SERVICO_LABELS[s.status]}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="date-text">{formatarData(s.dataCriacao)}</span>
                                    </td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <div className="table-actions-row">
                                            {/* Iniciar execução se ORCADO */}
                                            {s.status === 'ORCADO' && (
                                                <button
                                                    className="btn-start-action"
                                                    onClick={(e) => handleIniciarExecucao(s, e)}
                                                    disabled={salvandoAcao}
                                                    title="Iniciar Execução desta Ordem de Serviço"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                                                         fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polygon points="5 3 19 12 5 21 5 3" />
                                                    </svg>
                                                    <span>Iniciar</span>
                                                </button>
                                            )}

                                            {/* Finalizar se EM_EXECUCAO */}
                                            {s.status === 'EM_EXECUCAO' && (
                                                <button
                                                    className="btn-finish-action"
                                                    onClick={(e) => abrirModalFinalizar(s, e)}
                                                    title="Finalizar Serviço e Registrar Lição Aprendida"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                                                         fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                    <span>Concluir</span>
                                                </button>
                                            )}

                                            {/* Ver Detalhes */}
                                            <button
                                                className="btn-icon-action"
                                                onClick={() => abrirDetalhes(s)}
                                                title="Ver Detalhes do Serviço"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            </button>

                                            {/* Cancelar se ORCADO ou EM_EXECUCAO */}
                                            {(s.status === 'ORCADO' || s.status === 'EM_EXECUCAO') && (
                                                <button
                                                    className="btn-icon-action btn-cancel-action"
                                                    onClick={(e) => abrirModalCancelar(s, e)}
                                                    title="Cancelar Serviço"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <line x1="15" y1="9" x2="9" y2="15" />
                                                        <line x1="9" y1="9" x2="15" y2="15" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Reutilizável: Criar Nova Ordem de Serviço Avulsa */}
            <ModalCriarServico
                aberto={modalCriarAberto}
                onClose={() => setModalCriarAberto(false)}
                onSucesso={handleServicoCriadoComSucesso}
                totalServicos={servicos.length}
            />

            {/* Modal 1: Visualizar Serviço (Bloco A, Bloco B, Bloco C) */}
            {modalDetalhesAberto && selecionado && (
                <div className="servico-modal-overlay" onClick={() => setModalDetalhesAberto(false)}>
                    <div className="servico-modal-box modal-box-wide" onClick={(e) => e.stopPropagation()}>
                        <div className="servico-modal-header">
                            <div className="header-meta">
                                <span className="os-title">Ordem de Serviço {selecionado.codigo}</span>
                                <span className="header-sub">Criado em {formatarData(selecionado.dataCriacao)}</span>
                            </div>
                            <div className="header-status-side">
                                <span className={`status-indicator status-${selecionado.status.toLowerCase()}`}>
                                    <span className="dot" />
                                    {STATUS_SERVICO_LABELS[selecionado.status]}
                                </span>
                                <button className="btn-close-modal" onClick={() => setModalDetalhesAberto(false)} title="Fechar">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="servico-modal-body">
                            {/* Se cancelado, exibe motivo com destaque */}
                            {selecionado.status === 'CANCELADO' && selecionado.motivoCancelamento && (
                                <div style={{
                                    padding: '0.85rem 1rem',
                                    borderRadius: '8px',
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    color: '#991b1b',
                                    fontSize: '0.84rem'
                                }}>
                                    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Motivo do Cancelamento:</strong>
                                    <span>{selecionado.motivoCancelamento}</span>
                                </div>
                            )}

                            {/* Bloco A: Orçamento */}
                            <div className="block-section">
                                <div className="section-heading">
                                    <h4>Bloco A: Orçamento & Estimativa</h4>
                                    <span className="badge-step">Planejado</span>
                                </div>
                                <div className="grid-3-col">
                                    <div className="field-view">
                                        <span className="field-label">Tipo de Serviço:</span>
                                        <span className="field-val strong">{selecionado.blocoOrcamento?.tipoServico?.descricao}</span>
                                    </div>
                                    <div className="field-view">
                                        <span className="field-label">Recurso / Máquina:</span>
                                        <span className="field-val strong">{selecionado.blocoOrcamento?.recurso?.descricao}</span>
                                    </div>
                                    <div className="field-view">
                                        <span className="field-label">Responsável pela Estimativa:</span>
                                        <span className="field-val">{selecionado.blocoOrcamento?.responsavelEstimativa?.nome}</span>
                                    </div>
                                    <div className="field-view">
                                        <span className="field-label">Horas Estimadas:</span>
                                        <span className="field-val strong">{selecionado.blocoOrcamento?.horasEstimadas} horas</span>
                                    </div>
                                    <div className="field-view">
                                        <span className="field-label">Custo Estimado:</span>
                                        <span className="field-val">{formatarMoeda(selecionado.blocoOrcamento?.custoEstimado)}</span>
                                    </div>
                                    <div className="field-view">
                                        <span className="field-label">Valor Proposto:</span>
                                        <span className="field-val highlight-money">{formatarMoeda(selecionado.blocoOrcamento?.valorProposto)}</span>
                                    </div>
                                </div>

                                <div className="field-view" style={{ marginTop: '0.35rem' }}>
                                    <span className="field-label">Características da Peça:</span>
                                    <div className="tags-list-cell" style={{ marginTop: '0.2rem' }}>
                                        {selecionado.blocoOrcamento?.caracteristicasPeca?.map(c => (
                                            <span key={c.id} className="tag-item">{c.descricao}</span>
                                        ))}
                                    </div>
                                </div>

                                {selecionado.blocoOrcamento?.premissasAssumidas && (
                                    <div className="field-view">
                                        <span className="field-label">Premissas Assumidas:</span>
                                        <span className="field-val">{selecionado.blocoOrcamento.premissasAssumidas}</span>
                                    </div>
                                )}
                            </div>

                            {/* Bloco B: Realizado */}
                            <div className="block-section">
                                <div className="section-heading">
                                    <h4>Bloco B: Execução Realizada</h4>
                                    <span className="badge-step">Operacional</span>
                                </div>
                                {selecionado.blocoRealizado ? (
                                    <div className="grid-3-col">
                                        <div className="field-view">
                                            <span className="field-label">Horas Realizadas:</span>
                                            <span className="field-val strong">{selecionado.blocoRealizado.horasRealizadas} horas</span>
                                        </div>
                                        <div className="field-view">
                                            <span className="field-label">Custo Real:</span>
                                            <span className="field-val">{formatarMoeda(selecionado.blocoRealizado.custoReal)}</span>
                                        </div>
                                        <div className="field-view">
                                            <span className="field-label">Valor Faturado:</span>
                                            <span className="field-val highlight-money">{formatarMoeda(selecionado.blocoRealizado.valorFaturado)}</span>
                                        </div>
                                        <div className="field-view">
                                            <span className="field-label">Data de Entrega:</span>
                                            <span className="field-val">{formatarData(selecionado.blocoRealizado.dataRealEntrega)}</span>
                                        </div>
                                        <div className="field-view">
                                            <span className="field-label">Houve Retrabalho?</span>
                                            <span className="field-val">{selecionado.blocoRealizado.houveRetrabalho ? 'Sim' : 'Não'}</span>
                                        </div>
                                        <div className="field-view">
                                            <span className="field-label">Mudança de Escopo?</span>
                                            <span className="field-val">{selecionado.blocoRealizado.houveMudancaEscopo ? 'Sim' : 'Não'}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="empty-block-hint">Dados de execução ainda não foram preenchidos.</p>
                                )}
                            </div>

                            {/* Bloco C: Aprendizado */}
                            <div className="block-section">
                                <div className="section-heading">
                                    <h4>Bloco C: Aprendizado & Lições</h4>
                                    <span className="badge-step">Gestão do Conhecimento</span>
                                </div>
                                {selecionado.blocoAprendizado ? (
                                    <div className="grid-2-col">
                                        <div className="field-view">
                                            <span className="field-label">Causa do Desvio / Ocorrência:</span>
                                            <span className="field-val strong">{selecionado.blocoAprendizado.causaDesvio?.descricao || '-'}</span>
                                        </div>
                                        <div className="field-view">
                                            <span className="field-label">Visibilidade:</span>
                                            <span className="field-val">{selecionado.blocoAprendizado.restrito ? 'Restrito' : 'Interno Público'}</span>
                                        </div>
                                        <div className="field-view" style={{ gridColumn: '1 / -1' }}>
                                            <span className="field-label">Lição Aprendida:</span>
                                            <span className="field-val">{selecionado.blocoAprendizado.licaoAprendida}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="empty-block-hint">Nenhuma lição aprendida registrada até o momento.</p>
                                )}
                            </div>
                        </div>

                        <div className="servico-modal-footer">
                            <div className="footer-left-actions">
                                {selecionado.status === 'ORCADO' && (
                                    <button
                                        type="button"
                                        className="btn-start-action"
                                        onClick={() => handleIniciarExecucao(selecionado)}
                                        disabled={salvandoAcao}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                             fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="5 3 19 12 5 21 5 3" />
                                        </svg>
                                        <span>Iniciar Execução</span>
                                    </button>
                                )}
                                {selecionado.status === 'EM_EXECUCAO' && (
                                    <button
                                        type="button"
                                        className="btn-finish-action"
                                        onClick={() => abrirModalFinalizar(selecionado)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                             fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        <span>Concluir Serviço / Lição</span>
                                    </button>
                                )}
                            </div>
                            <div className="footer-right-actions">
                                <button type="button" className="btn-secondary" onClick={() => setModalDetalhesAberto(false)}>
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal 2: Finalizar / Rascunho de Serviço */}
            {modalFinalizarAberto && selecionado && (
                <div className="servico-modal-overlay" onClick={() => setModalFinalizarAberto(false)}>
                    <div className="servico-modal-box modal-box-wide" onClick={(e) => e.stopPropagation()}>
                        <div className="servico-modal-header">
                            <div className="header-meta">
                                <span className="os-title">Finalização do Serviço {selecionado.codigo}</span>
                                <span className="header-sub">Preencha os dados reais de entrega e a lição aprendida</span>
                            </div>
                            <button className="btn-close-modal" onClick={() => setModalFinalizarAberto(false)} title="Fechar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="servico-modal-body">
                            {/* Bloco Realizado */}
                            <div className="block-section">
                                <div className="section-heading">
                                    <h4>Bloco B: Execução Realizada</h4>
                                </div>
                                <div className="form-grid">
                                    <div className="form-row-3">
                                        <div className="form-group">
                                            <label>Horas Realizadas *</label>
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={horasRealizadas}
                                                onChange={(e) => setHorasRealizadas(e.target.value === '' ? '' : Number(e.target.value))}
                                                placeholder="Ex: 5.5"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Custo Real (R$) *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={custoReal}
                                                onChange={(e) => setCustoReal(e.target.value === '' ? '' : Number(e.target.value))}
                                                placeholder="Ex: 450.00"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Valor Faturado (R$) *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={valorFaturado}
                                                onChange={(e) => setValorFaturado(e.target.value === '' ? '' : Number(e.target.value))}
                                                placeholder="Ex: 890.00"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Data Real de Entrega</label>
                                        <input
                                            type="date"
                                            value={dataRealEntrega}
                                            onChange={(e) => setDataRealEntrega(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={houveRetrabalho}
                                                onChange={(e) => setHouveRetrabalho(e.target.checked)}
                                            />
                                            <span>Houve necessidade de retrabalho?</span>
                                        </label>
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={houveMudancaEscopo}
                                                onChange={(e) => setHouveMudancaEscopo(e.target.checked)}
                                            />
                                            <span>Houve mudança de escopo durante a medição?</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Bloco Aprendizado */}
                            <div className="block-section">
                                <div className="section-heading">
                                    <h4>Bloco C: Aprendizado & Lições</h4>
                                </div>
                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Causa do Desvio / Ocorrência Principal *</label>
                                        <select
                                            value={causaDesvioId}
                                            onChange={(e) => setCausaDesvioId(Number(e.target.value))}
                                        >
                                            <option value="">Selecione uma causa...</option>
                                            {causasDesvio.map(c => (
                                                <option key={c.id} value={c.id}>{c.descricao}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Lição Aprendida com a Execução *</label>
                                        <textarea
                                            rows={3}
                                            value={licaoAprendida}
                                            onChange={(e) => setLicaoAprendida(e.target.value)}
                                            placeholder="Descreva pontos de melhoria, boas práticas ou aprendizados técnicos observados nesta OS..."
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Assuntos / Termos Relacionados</label>
                                        <div className="multi-select-tags">
                                            {todosTermos.slice(0, 15).map(termo => (
                                                <div
                                                    key={termo.id}
                                                    className={`tag-checkbox-pill ${assuntosRelacionadosIds.includes(termo.id) ? 'selected' : ''}`}
                                                    onClick={() => toggleAssuntoRelacionado(termo.id)}
                                                >
                                                    <span>{termo.descricao}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group full-width">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={restrito}
                                                onChange={(e) => setRestrito(e.target.checked)}
                                            />
                                            <span>Restringir visibilidade desta lição apenas aos validadores e administradores</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="servico-modal-footer">
                            <div className="footer-left-actions">
                                <button
                                    type="button"
                                    className="btn-draft"
                                    onClick={() => handleSubmeterFinalizacao(false)}
                                    disabled={salvandoAcao}
                                >
                                    Salvar como Rascunho
                                </button>
                            </div>
                            <div className="footer-right-actions">
                                <button type="button" className="btn-secondary" onClick={() => setModalFinalizarAberto(false)}>
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn-primary-finish"
                                    onClick={() => handleSubmeterFinalizacao(true)}
                                    disabled={salvandoAcao}
                                >
                                    {salvandoAcao ? 'Processando...' : 'Concluir Serviço'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal 3: Confirmar Cancelamento com Motivo */}
            {modalCancelarAberto && selecionado && (
                <div className="servico-modal-overlay" onClick={() => setModalCancelarAberto(false)}>
                    <div className="servico-modal-box modal-confirm-simple" onClick={(e) => e.stopPropagation()}>
                        <div className="servico-modal-header">
                            <span className="os-title">Cancelar Serviço</span>
                            <button className="btn-close-modal" onClick={() => setModalCancelarAberto(false)} title="Fechar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="servico-modal-body">
                            <p className="confirm-text" style={{ margin: 0 }}>
                                Deseja realmente cancelar a Ordem de Serviço <strong>{selecionado.codigo}</strong>?
                            </p>
                            <div className="form-group" style={{ marginTop: '0.5rem' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                                    Motivo do Cancelamento *
                                </label>
                                <textarea
                                    rows={3}
                                    value={motivoCancelamento}
                                    onChange={(e) => setMotivoCancelamento(e.target.value)}
                                    placeholder="Informe a justificativa do cancelamento desta OS..."
                                    style={{
                                        padding: '0.5rem',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        fontSize: '0.82rem',
                                        width: '100%',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>
                        <div className="servico-modal-footer">
                            <div className="footer-right-actions" style={{ width: '100%', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setModalCancelarAberto(false)}>
                                    Voltar
                                </button>
                                <button
                                    type="button"
                                    className="btn-danger-confirm"
                                    onClick={handleConfirmarCancelamento}
                                    disabled={salvandoAcao}
                                >
                                    {salvandoAcao ? 'Cancelando...' : 'Confirmar Cancelamento'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
