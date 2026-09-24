import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
    reenviarLicao,
} from '../../../services/servicoService';
import { listarClasses, listarTermosPorClasse } from '../../../services/vocabularioService';
import { TermoVocabulario } from '../../../types/vocabulario';
import { ModalCriarServico } from './components/ModalCriarServico/ModalCriarServico';
import { VocabularioMultiSelect, TermoComClasse } from '../../../components/VocabularioMultiSelect/VocabularioMultiSelect';
import { useToast } from '../../../components/Toast';
import './Servicos.scss';

export const Servicos: React.FC = () => {
    const { mostrarToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();

    const [servicos, setServicos] = useState<RegistroServico[]>([]);
    const [carregando, setCarregando] = useState(true);

    // Filtros
    const [busca, setBusca] = useState('');
    const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

    // Modais
    const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
    const [modalFinalizarAberto, setModalFinalizarAberto] = useState(false);
    const [modalRevisarLicaoAberto, setModalRevisarLicaoAberto] = useState(false);
    const [modalCancelarAberto, setModalCancelarAberto] = useState(false);
    const [modalCriarAberto, setModalCriarAberto] = useState(false);

    const [selecionado, setSelecionado] = useState<RegistroServico | null>(null);

    // Vocabulários para Finalização e Lições (Bloco B e C)
    const [causasDesvio, setCausasDesvio] = useState<TermoVocabulario[]>([]);
    const [todosTermos, setTodosTermos] = useState<TermoComClasse[]>([]);

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
            const classeCausa = classes.find(c => c.nome.toLowerCase() === 'causa do desvio');
            if (classeCausa) {
                const termosCausa = await listarTermosPorClasse(classeCausa.id, true);
                setCausasDesvio(termosCausa);
            }

            const promessas = classes.map(async (c) => {
                const termos = await listarTermosPorClasse(c.id, true);
                return termos.map(t => ({
                    ...t,
                    classeNome: c.nome
                }));
            });
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

        const handleDemoAlterado = () => {
            carregarServicos();
        };

        window.addEventListener('zeiss-modo-demo-alterado', handleDemoAlterado);
        window.addEventListener('zeiss-configuracoes-alteradas', handleDemoAlterado);
        return () => {
            window.removeEventListener('zeiss-modo-demo-alterado', handleDemoAlterado);
            window.removeEventListener('zeiss-configuracoes-alteradas', handleDemoAlterado);
        };
    }, []);

    useEffect(() => {
        const paramFiltro = searchParams.get('filtro');
        if (paramFiltro === 'devolvidas') {
            setFiltroStatus('DEVOLVIDAS');
        } else if (paramFiltro && ['TODOS', 'EM_ANDAMENTO', 'CONCLUIDO', 'VALIDACAO', 'CANCELADO'].includes(paramFiltro.toUpperCase())) {
            setFiltroStatus(paramFiltro.toUpperCase());
        }
    }, [searchParams]);

    useEffect(() => {
        const paramServicoId = searchParams.get('servicoId');
        if (paramServicoId && servicos.length > 0) {
            const serv = servicos.find(s => s.id === Number(paramServicoId));
            if (serv) {
                const acao = searchParams.get('acao');
                const isDevolvida = serv.status === 'CONCLUIDO' && serv.blocoAprendizado?.statusLicao === 'RASCUNHO';
                if (acao === 'revisarLicao' || isDevolvida) {
                    abrirModalRevisarLicao(serv);
                } else {
                    abrirDetalhes(serv);
                }
            }
        }
    }, [servicos, searchParams]);

    const contadores = useMemo(() => {
        const total = servicos.length;
        const orcados = servicos.filter(s => s.status === 'ORCADO').length;
        const emExecucao = servicos.filter(s => s.status === 'EM_EXECUCAO').length;
        const emAndamento = orcados + emExecucao;
        const concluidos = servicos.filter(s => s.status === 'CONCLUIDO').length;
        const devolvidas = servicos.filter(
            s => s.status === 'CONCLUIDO' &&
                s.blocoAprendizado?.statusLicao === 'RASCUNHO' &&
                !!s.blocoAprendizado?.motivoRejeicao
        ).length;
        const emValidacao = servicos.filter(
            s => s.status === 'CONCLUIDO' &&
                s.blocoAprendizado?.statusLicao === 'EM_VALIDACAO'
        ).length;
        const cancelados = servicos.filter(s => s.status === 'CANCELADO').length;

        return { total, orcados, emExecucao, emAndamento, concluidos, devolvidas, emValidacao, cancelados };
    }, [servicos]);

    const servicosFiltrados = useMemo(() => {
        return servicos.filter((s) => {
            const query = busca.toLowerCase().trim();
            const matchBusca =
                !query ||
                s.codigo.toLowerCase().includes(query) ||
                s.blocoOrcamento?.tipoServico?.descricao.toLowerCase().includes(query) ||
                s.blocoOrcamento?.recurso?.descricao.toLowerCase().includes(query) ||
                s.blocoOrcamento?.responsavelEstimativa?.nome.toLowerCase().includes(query);

            let matchStatus = true;
            if (filtroStatus === 'TODOS') {
                matchStatus = true;
            } else if (filtroStatus === 'EM_ANDAMENTO') {
                matchStatus = s.status === 'ORCADO' || s.status === 'EM_EXECUCAO';
            } else if (filtroStatus === 'DEVOLVIDAS') {
                matchStatus = s.status === 'CONCLUIDO' &&
                    s.blocoAprendizado?.statusLicao === 'RASCUNHO' &&
                    !!s.blocoAprendizado?.motivoRejeicao;
            } else if (filtroStatus === 'VALIDACAO') {
                matchStatus = s.status === 'CONCLUIDO' &&
                    s.blocoAprendizado?.statusLicao === 'EM_VALIDACAO';
            } else {
                matchStatus = s.status === filtroStatus;
            }

            return matchBusca && matchStatus;
        });
    }, [servicos, busca, filtroStatus]);

    const obterTermosPreSelecionados = (s: RegistroServico, causaId?: number | ''): number[] => {
        const ids = new Set<number>();

        if (s.blocoAprendizado?.assuntosRelacionados && s.blocoAprendizado.assuntosRelacionados.length > 0) {
            s.blocoAprendizado.assuntosRelacionados.forEach(a => ids.add(a.id));
        }

        if (s.blocoOrcamento?.caracteristicasPeca) {
            s.blocoOrcamento.caracteristicasPeca.forEach(c => ids.add(c.id));
        }

        const causa = causaId || s.blocoAprendizado?.causaDesvio?.id;
        if (causa && typeof causa === 'number') {
            ids.add(causa);
        }

        return Array.from(ids);
    };

    const handleMudarCausaDesvio = (novoId: number | '') => {
        if (causaDesvioId && typeof causaDesvioId === 'number' && causaDesvioId !== novoId) {
            setAssuntosRelacionadosIds(prev => prev.filter(id => id !== causaDesvioId));
        }
        setCausaDesvioId(novoId);
        if (novoId && typeof novoId === 'number') {
            setAssuntosRelacionadosIds(prev => prev.includes(novoId) ? prev : [...prev, novoId]);
        }
    };

    const abrirDetalhes = (s: RegistroServico) => {
        setSelecionado(s);
        const causa = s.blocoAprendizado?.causaDesvio?.id ?? '';
        setCausaDesvioId(causa);
        setLicaoAprendida(s.blocoAprendizado?.licaoAprendida ?? '');
        setAssuntosRelacionadosIds(obterTermosPreSelecionados(s, causa));
        setRestrito(s.blocoAprendizado?.restrito ?? false);
        setModalDetalhesAberto(true);
    };

    const handleIniciarExecucao = async (s: RegistroServico, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSalvandoAcao(true);
        try {
            const atualizado = await iniciarExecucaoServico(s.id);
            mostrarToast('success', `Serviço ${s.codigo} iniciado com sucesso!`);
            setServicos(prev => prev.map(item => item.id === atualizado.id ? atualizado : item));
            if (selecionado?.id === s.id) setSelecionado(atualizado);
        } catch (err: unknown) {
            mostrarToast('error', 'Não foi possível iniciar a execução do serviço.');
        } finally {
            setSalvandoAcao(false);
        }
    };

    const abrirModalFinalizar = (s: RegistroServico, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelecionado(s);
        setHorasRealizadas(s.blocoRealizado?.horasRealizadas ?? (s.blocoOrcamento?.horasEstimadas || ''));
        setCustoReal(s.blocoRealizado?.custoReal ?? (s.blocoOrcamento?.custoEstimado || ''));
        setValorFaturado(s.blocoRealizado?.valorFaturado ?? (s.blocoOrcamento?.valorProposto || ''));
        setDataRealEntrega(s.blocoRealizado?.dataRealEntrega ?? new Date().toISOString().split('T')[0]);
        setHouveRetrabalho(s.blocoRealizado?.houveRetrabalho ?? false);
        setHouveMudancaEscopo(s.blocoRealizado?.houveMudancaEscopo ?? false);

        const causa = s.blocoAprendizado?.causaDesvio?.id ?? '';
        setCausaDesvioId(causa);
        setLicaoAprendida(s.blocoAprendizado?.licaoAprendida ?? '');
        setAssuntosRelacionadosIds(obterTermosPreSelecionados(s, causa));
        setRestrito(s.blocoAprendizado?.restrito ?? false);

        setModalFinalizarAberto(true);
    };

    const abrirModalRevisarLicao = (s: RegistroServico, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelecionado(s);
        const causa = s.blocoAprendizado?.causaDesvio?.id ?? '';
        setCausaDesvioId(causa);
        setLicaoAprendida(s.blocoAprendizado?.licaoAprendida ?? '');
        setAssuntosRelacionadosIds(obterTermosPreSelecionados(s, causa));
        setRestrito(s.blocoAprendizado?.restrito ?? false);
        setModalRevisarLicaoAberto(true);
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
            mostrarToast('error', 'Informe o motivo do cancelamento.');
            return;
        }

        setSalvandoAcao(true);
        try {
            const atualizado = await cancelarServico(selecionado.id, { motivoCancelamento: motivoCancelamento.trim() });
            mostrarToast('success', `Serviço ${selecionado.codigo} cancelado.`);
            setServicos(prev => prev.map(item => item.id === atualizado.id ? atualizado : item));
            setModalCancelarAberto(false);
            if (modalDetalhesAberto) setModalDetalhesAberto(false);
        } catch (err: unknown) {
            mostrarToast('error', 'Falha ao cancelar o serviço.');
        } finally {
            setSalvandoAcao(false);
        }
    };

    const handleSalvarFinalizacao = async (ehConclusao: boolean) => {
        if (!selecionado) return;

        if (ehConclusao) {
            if (horasRealizadas === '' || Number(horasRealizadas) <= 0) {
                mostrarToast('error', 'Informe as Horas Realizadas válidas.');
                return;
            }
            if (custoReal === '' || Number(custoReal) < 0) {
                mostrarToast('error', 'Informe o Custo Real.');
                return;
            }
            if (valorFaturado === '' || Number(valorFaturado) < 0) {
                mostrarToast('error', 'Informe o Valor Faturado.');
                return;
            }
            if (!causaDesvioId) {
                mostrarToast('error', 'Selecione a Causa do Desvio / Ocorrência.');
                return;
            }
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
                mostrarToast('success', `Serviço ${selecionado.codigo} concluído com sucesso e lição aprendida enviada para validação!`);
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

    const handleSubmeterReenvioLicao = async () => {
        if (!selecionado) return;
        if (!causaDesvioId) {
            mostrarToast('error', 'Selecione a Causa do Desvio / Ocorrência.');
            return;
        }
        if (!licaoAprendida.trim()) {
            mostrarToast('error', 'Descreva o relato revisado da Lição Aprendida.');
            return;
        }

        setSalvandoAcao(true);
        try {
            const atualizado = await reenviarLicao(selecionado.id, {
                causaDesvioId: Number(causaDesvioId),
                licaoAprendida: licaoAprendida.trim(),
                assuntosRelacionadosIds,
                restrito,
            });
            mostrarToast('success', `Lição da OS ${selecionado.codigo} reenviada para validação com sucesso!`);
            setServicos(prev => prev.map(item => item.id === atualizado.id ? atualizado : item));
            setModalRevisarLicaoAberto(false);
            if (modalDetalhesAberto) setModalDetalhesAberto(false);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Falha ao reenviar a lição para validação.';
            mostrarToast('error', msg);
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

    const handleServicoCriadoComSucesso = (novo: RegistroServico) => {
        setServicos(prev => [novo, ...prev]);
        mostrarToast('success', `Ordem de Serviço ${novo.codigo} criada com sucesso!`);
    };

    return (
        <div className="servicos-page">
            <div className="servicos-header">
                <div className="header-titles">
                    <h2>Ordens de Serviço</h2>
                    <p>Gestão do ciclo operacional: Orçamento, Execução e Formalização de Lições</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn-nova-os"
                        onClick={() => setModalCriarAberto(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span>Nova Ordem de Serviço</span>
                    </button>
                </div>
            </div>

            <div className="servicos-toolbar">
                <div className="filter-tabs">
                    <button
                        type="button"
                        className={`filter-tab ${filtroStatus === 'TODOS' ? 'active' : ''}`}
                        onClick={() => setFiltroStatus('TODOS')}
                    >
                        Todos ({contadores.total})
                    </button>
                    <button
                        type="button"
                        className={`filter-tab tab-em_execucao ${filtroStatus === 'EM_ANDAMENTO' ? 'active' : ''}`}
                        onClick={() => setFiltroStatus('EM_ANDAMENTO')}
                    >
                        Em Andamento / Orçados ({contadores.emAndamento})
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
                        className={`filter-tab tab-devolvida ${filtroStatus === 'DEVOLVIDAS' ? 'active' : ''}`}
                        onClick={() => setFiltroStatus('DEVOLVIDAS')}
                    >
                        <span>Lições a Corrigir</span>
                        {contadores.devolvidas > 0 && (
                            <span className="badge-count-warning">{contadores.devolvidas} ⚠️</span>
                        )}
                    </button>
                    <button
                        type="button"
                        className={`filter-tab tab-validacao ${filtroStatus === 'VALIDACAO' ? 'active' : ''}`}
                        onClick={() => setFiltroStatus('VALIDACAO')}
                    >
                        <span>Aguardando Validação</span>
                        {contadores.emValidacao > 0 && (
                            <span className="badge-count-subtle">{contadores.emValidacao}</span>
                        )}
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
                                <th>Situação & Lição</th>
                                <th>Data</th>
                                <th style={{ textAlign: 'right' }}>Ações</th>
                            </tr>
                            </thead>
                            <tbody>
                            {servicosFiltrados.map((s) => (
                                <tr key={s.id} onClick={() => abrirDetalhes(s)}>
                                    <td>
                                        <div className="os-code-col">
                                            <span className="code-text">{s.codigo}</span>
                                            {s.blocoOrcamento?.responsavelEstimativa && (
                                                <span className="sub-user">{s.blocoOrcamento.responsavelEstimativa.nome}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="service-info-col">
                                            <span className="primary-desc">{s.blocoOrcamento?.tipoServico?.descricao || '-'}</span>
                                            <span className="secondary-desc">{s.blocoOrcamento?.recurso?.descricao || '-'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="tags-list-cell">
                                            {s.blocoOrcamento?.caracteristicasPeca && s.blocoOrcamento.caracteristicasPeca.length > 0 ? (
                                                s.blocoOrcamento.caracteristicasPeca.map((c) => (
                                                    <span key={c.id} className="tag-item" title={c.descricao}>
                                                        {c.descricao}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="tag-empty">-</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="values-cell">
                                            <span className="main-val">{s.blocoOrcamento?.horasEstimadas} h</span>
                                            {s.blocoRealizado?.horasRealizadas !== undefined && s.blocoRealizado?.horasRealizadas !== null && (
                                                <span className="sub-val">{s.blocoRealizado.horasRealizadas} h real</span>
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
                                        <div className="status-cell-wrapper">
                                            <span className={`status-indicator status-${s.status.toLowerCase()}`}>
                                                <span className="dot" />
                                                {STATUS_SERVICO_LABELS[s.status]}
                                            </span>
                                            {s.status === 'CONCLUIDO' && s.blocoAprendizado?.statusLicao === 'RASCUNHO' && s.blocoAprendizado?.motivoRejeicao && (
                                                <span className="badge-licao-status devolvida" title={`Devolução: ${s.blocoAprendizado.motivoRejeicao}`}>
                                                    ⚠️ Lição Devolvida
                                                </span>
                                            )}
                                            {s.status === 'CONCLUIDO' && s.blocoAprendizado?.statusLicao === 'EM_VALIDACAO' && (
                                                <span className="badge-licao-status em-validacao" title="Lição aguardando validação técnica">
                                                    Lição em Validação
                                                </span>
                                            )}
                                            {s.status === 'CONCLUIDO' && s.blocoAprendizado?.statusLicao === 'FORMALIZADA' && (
                                                <span className="badge-licao-status formalizada" title="Lição aprovada e formalizada">
                                                    Lição Formalizada
                                                </span>
                                            )}
                                        </div>
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

                                            {/* Revisar Lição se DEVOLVIDA */}
                                            {s.status === 'CONCLUIDO' && s.blocoAprendizado?.statusLicao === 'RASCUNHO' && s.blocoAprendizado?.motivoRejeicao && (
                                                <button
                                                    className="btn-review-action"
                                                    onClick={(e) => abrirModalRevisarLicao(s, e)}
                                                    title="Revisar e corrigir lição devolvida pelo validador"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                    <span>Revisar Lição</span>
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
                                            {(s.status === 'ORCADO' || s.status === 'EM_EXECUCAO') && (                                                <button
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
                            {/* Alerta de Cancelamento */}
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

                            {/* Alerta de Lição Devolvida para Revisão */}
                            {selecionado.status === 'CONCLUIDO' && selecionado.blocoAprendizado?.statusLicao === 'RASCUNHO' && selecionado.blocoAprendizado?.motivoRejeicao && (
                                <div className="feedback-validador-box">
                                    <div className="feedback-header">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                            <line x1="12" y1="9" x2="12" y2="13" />
                                            <line x1="12" y1="17" x2="12.01" y2="17" />
                                        </svg>
                                        <strong>Devolvido pelo Validador para Correção:</strong>
                                    </div>
                                    <p className="feedback-motivo">"{selecionado.blocoAprendizado.motivoRejeicao}"</p>
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
                                        {selecionado.blocoAprendizado.assuntosRelacionados && selecionado.blocoAprendizado.assuntosRelacionados.length > 0 && (
                                            <div className="field-view" style={{ gridColumn: '1 / -1' }}>
                                                <span className="field-label">Assuntos Vinculados:</span>
                                                <div className="tags-list-cell" style={{ marginTop: '0.25rem' }}>
                                                    {selecionado.blocoAprendizado.assuntosRelacionados.map(a => (
                                                        <span key={a.id} className="tag-item">#{a.descricao}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="empty-block-hint">Nenhuma lição aprendida registrada até o momento.</p>
                                )}
                            </div>
                        </div>

                        <div className="servico-modal-footer">
                            <div className="footer-left-actions">
                                <button type="button" className="btn-secondary" onClick={() => setModalDetalhesAberto(false)}>
                                    Fechar
                                </button>
                            </div>
                            <div className="footer-right-actions">
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
                                        onClick={() => {
                                            setModalDetalhesAberto(false);
                                            abrirModalFinalizar(selecionado);
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                             fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        <span>Concluir Serviço / Lição</span>
                                    </button>
                                )}
                                {selecionado.status === 'CONCLUIDO' && selecionado.blocoAprendizado?.statusLicao === 'RASCUNHO' && selecionado.blocoAprendizado?.motivoRejeicao && (
                                    <button
                                        type="button"
                                        className="btn-review-action"
                                        onClick={() => {
                                            setModalDetalhesAberto(false);
                                            abrirModalRevisarLicao(selecionado);
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                             fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                        <span>Revisar & Reenviar Lição</span>
                                    </button>
                                )}
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
                                            <span>Houve mudança de escopo durante a execução?</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="block-section">
                                <div className="section-heading">
                                    <h4>Bloco C: Aprendizado & Lições</h4>
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Causa do Desvio / Ocorrência *</label>
                                        <select
                                            value={causaDesvioId}
                                            onChange={(e) => handleMudarCausaDesvio(e.target.value === '' ? '' : Number(e.target.value))}
                                        >
                                            <option value="">Selecione a Causa do Desvio...</option>
                                            {causasDesvio.map(c => (
                                                <option key={c.id} value={c.id}>{c.descricao}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Lição Aprendida *</label>
                                        <textarea
                                            rows={4}
                                            value={licaoAprendida}
                                            onChange={(e) => setLicaoAprendida(e.target.value)}
                                            placeholder="Descreva o que ocorreu de imprevisto, boas práticas encontradas e ações recomendadas para novos serviços similares..."
                                        />
                                    </div>

                                    <div className="form-group">
                                        <VocabularioMultiSelect
                                            label="Assuntos do Vocabulário Relacionados"
                                            termos={todosTermos}
                                            selecionadosIds={assuntosRelacionadosIds}
                                            onChange={setAssuntosRelacionadosIds}
                                            placeholder="Buscar e selecionar termos do vocabulário..."
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={restrito}
                                                onChange={(e) => setRestrito(e.target.checked)}
                                            />
                                            <span>Conteúdo Restrito? (Visível apenas para usuários internos)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="servico-modal-footer">
                            <div className="footer-left-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setModalFinalizarAberto(false)}
                                    disabled={salvandoAcao}
                                >
                                    Cancelar
                                </button>
                            </div>
                            <div className="footer-right-actions">
                                <button
                                    type="button"
                                    className="btn-draft"
                                    onClick={() => handleSalvarFinalizacao(false)}
                                    disabled={salvandoAcao}
                                >
                                    Salvar Rascunho
                                </button>
                                <button
                                    type="button"
                                    className="btn-primary-finish"
                                    onClick={() => handleSalvarFinalizacao(true)}
                                    disabled={salvandoAcao}
                                >
                                    {salvandoAcao ? 'Concluindo...' : 'Concluir Serviço e Submeter Lição'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal 3: Cancelar Serviço */}
            {modalCancelarAberto && selecionado && (
                <div className="servico-modal-overlay" onClick={() => setModalCancelarAberto(false)}>
                    <div className="servico-modal-box modal-confirm-simple" onClick={(e) => e.stopPropagation()}>
                        <div className="servico-modal-header">
                            <span className="os-title">Cancelar Serviço {selecionado.codigo}</span>
                            <button className="btn-close-modal" onClick={() => setModalCancelarAberto(false)} title="Fechar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="servico-modal-body">
                            <p style={{ fontSize: '0.86rem', color: '#475569', marginBottom: '1rem', lineHeight: 1.5 }}>
                                Tem certeza de que deseja cancelar esta Ordem de Serviço? Esta ação é irreversível.
                            </p>
                            <div className="form-group">
                                <label>Justificativa do Cancelamento *</label>
                                <textarea
                                    rows={3}
                                    value={motivoCancelamento}
                                    onChange={(e) => setMotivoCancelamento(e.target.value)}
                                    placeholder="Informe por que o serviço foi cancelado..."
                                />
                            </div>
                        </div>
                        <div className="servico-modal-footer">
                            <div className="footer-left-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setModalCancelarAberto(false)}
                                    disabled={salvandoAcao}
                                >
                                    Voltar
                                </button>
                            </div>
                            <div className="footer-right-actions">
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

            {modalRevisarLicaoAberto && selecionado && (
                <div className="servico-modal-overlay" onClick={() => setModalRevisarLicaoAberto(false)}>
                    <div className="servico-modal-box modal-box-wide" onClick={(e) => e.stopPropagation()}>
                        <div className="servico-modal-header">
                            <div className="header-meta">
                                <span className="os-title">Revisão de Lição Aprendida • OS {selecionado.codigo}</span>
                                <span className="header-sub">Serviço Concluído • Ajuste os pontos solicitados pelo validador técnico</span>
                            </div>
                            <button className="btn-close-modal" onClick={() => setModalRevisarLicaoAberto(false)} title="Fechar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="servico-modal-body">
                            {selecionado.blocoAprendizado?.motivoRejeicao && (
                                <div className="feedback-validador-box">
                                    <div className="feedback-header">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                            <line x1="12" y1="9" x2="12" y2="13" />
                                            <line x1="12" y1="17" x2="12.01" y2="17" />
                                        </svg>
                                        <strong>Devolvido pelo Validador para Correção:</strong>
                                    </div>
                                    <p className="feedback-motivo">"{selecionado.blocoAprendizado.motivoRejeicao}"</p>
                                </div>
                            )}

                            <div className="locked-blocks-summary">
                                <div className="summary-badge">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                    <span>Blocos A e B Concluídos (Somente Leitura)</span>
                                </div>
                                <div className="summary-grid">
                                    <div className="summary-item">
                                        <span className="label">Tipo de Serviço:</span>
                                        <span className="val">{selecionado.blocoOrcamento?.tipoServico?.descricao || '-'}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Recurso / Máquina:</span>
                                        <span className="val">{selecionado.blocoOrcamento?.recurso?.descricao || '-'}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Horas Realizadas:</span>
                                        <span className="val">{selecionado.blocoRealizado?.horasRealizadas ?? '-'} h</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Valor Faturado:</span>
                                        <span className="val">{formatarMoeda(selecionado.blocoRealizado?.valorFaturado)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="block-section">
                                <div className="section-heading">
                                    <h4>Bloco C: Edição da Lição de Aprendizado</h4>
                                    <span className="badge-step">Correção</span>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Causa do Desvio / Ocorrência *</label>
                                        <select
                                            value={causaDesvioId}
                                            onChange={(e) => handleMudarCausaDesvio(e.target.value === '' ? '' : Number(e.target.value))}
                                        >
                                            <option value="">Selecione a Causa do Desvio...</option>
                                            {causasDesvio.map((c) => (
                                                <option key={c.id} value={c.id}>{c.descricao}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Relato da Lição Aprendida *</label>
                                        <textarea
                                            rows={5}
                                            value={licaoAprendida}
                                            onChange={(e) => setLicaoAprendida(e.target.value)}
                                            placeholder="Detalhe o aprendizado técnico, as ações tomadas e como evitar o problema no futuro..."
                                        />
                                    </div>

                                    <div className="form-group">
                                        <VocabularioMultiSelect
                                            label="Assuntos / Termos do Vocabulário Relacionados"
                                            termos={todosTermos}
                                            selecionadosIds={assuntosRelacionadosIds}
                                            onChange={setAssuntosRelacionadosIds}
                                            placeholder="Buscar e selecionar termos do vocabulário..."
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={restrito}
                                                onChange={(e) => setRestrito(e.target.checked)}
                                            />
                                            <span>Conteúdo Restrito? (Visível apenas para técnicos e validadores)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="servico-modal-footer">
                            <div className="footer-left-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setModalRevisarLicaoAberto(false)}
                                    disabled={salvandoAcao}
                                >
                                    Cancelar
                                </button>
                            </div>
                            <div className="footer-right-actions">
                                <button
                                    type="button"
                                    className="btn-primary-finish"
                                    onClick={handleSubmeterReenvioLicao}
                                    disabled={salvandoAcao}
                                >
                                    {salvandoAcao ? 'Reenviando...' : 'Reenviar para Validação'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
