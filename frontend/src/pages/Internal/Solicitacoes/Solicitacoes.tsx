import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Solicitacao,
    STATUS_SOLICITACAO_LABELS,
    SERVICOS_LABELS
} from '../../../types/solicitacao';
import { RegistroServico } from '../../../types/servico';
import {
    listarSolicitacoes,
    atualizarStatusSolicitacao,
    baixarArquivoSolicitacao,
    excluirSolicitacao
} from '../../../services/solicitacaoService';
import { ModalCriarServico } from '../Servicos/components/ModalCriarServico/ModalCriarServico';
import { useToast } from '../../../components/Toast';
import './Solicitacoes.scss';

export const Solicitacoes: React.FC = () => {
    const navigate = useNavigate();
    const { mostrarToast } = useToast();

    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
    const [carregando, setCarregando] = useState(true);

    // Filtros e busca
    const [busca, setBusca] = useState('');
    const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
    const [filtroServico, setFiltroServico] = useState<string>('TODOS');

    // Modais
    const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
    const [modalRegistrarServicoAberto, setModalRegistrarServicoAberto] = useState(false);
    const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

    // Solicitação Selecionada
    const [selecionada, setSelecionada] = useState<Solicitacao | null>(null);

    const [salvandoAcao, setSalvandoAcao] = useState(false);
    const [baixandoArquivoId, setBaixandoArquivoId] = useState<number | null>(null);

    const carregarSolicitacoes = async () => {
        setCarregando(true);
        try {
            const data = await listarSolicitacoes();
            setSolicitacoes(data);
        } catch (err: unknown) {
            mostrarToast('error', 'Não foi possível carregar as solicitações de orçamento.');
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarSolicitacoes();
    }, []);

    // Estatísticas discretas
    const contadores = useMemo(() => {
        const total = solicitacoes.length;
        const pendentes = solicitacoes.filter(s => s.status === 'PENDENTE').length;
        const registradas = solicitacoes.filter(s => s.status === 'REGISTRADA').length;
        const ignoradas = solicitacoes.filter(s => s.status === 'IGNORADA').length;
        return { total, pendentes, registradas, ignoradas };
    }, [solicitacoes]);

    // Filtragem
    const solicitacoesFiltradas = useMemo(() => {
        return solicitacoes.filter((s) => {
            const query = busca.toLowerCase().trim();
            const matchBusca =
                !query ||
                s.codigo.toLowerCase().includes(query) ||
                s.nome.toLowerCase().includes(query) ||
                s.empresa.toLowerCase().includes(query) ||
                s.email.toLowerCase().includes(query) ||
                s.telefone.toLowerCase().includes(query) ||
                (s.mensagem && s.mensagem.toLowerCase().includes(query));

            const matchStatus = filtroStatus === 'TODOS' || s.status === filtroStatus;
            const matchServico = filtroServico === 'TODOS' || s.servico === filtroServico;

            return matchBusca && matchStatus && matchServico;
        });
    }, [solicitacoes, busca, filtroStatus, filtroServico]);

    // Abertura do Modal de Detalhes
    const abrirDetalhes = (s: Solicitacao) => {
        setSelecionada(s);
        setModalDetalhesAberto(true);
    };

    // Abertura do Modal de Registrar Serviço
    const abrirModalRegistrarServico = (s: Solicitacao, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelecionada(s);
        setModalRegistrarServicoAberto(true);
    };

    // Callback após criar o serviço no modal reutilizável
    const handleServicoCriadoComSucesso = async (servicoCriado: RegistroServico) => {
        if (selecionada) {
            try {
                const atualizada = await atualizarStatusSolicitacao(selecionada.id, {
                    status: 'REGISTRADA',
                });
                setSolicitacoes(prev => prev.map(item => item.id === atualizada.id ? atualizada : item));
            } catch (err: unknown) {
                console.error('Erro ao marcar solicitação como registrada:', err);
            }
        }
        mostrarToast('success', `Ordem de Serviço ${servicoCriado.codigo} criada com sucesso!`);
        navigate('/interno/servicos');
    };

    // Ignorar Solicitação
    const handleIgnorarSolicitacao = async (s: Solicitacao, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSalvandoAcao(true);
        try {
            const atualizada = await atualizarStatusSolicitacao(s.id, {
                status: 'IGNORADA',
            });
            setSolicitacoes(prev => prev.map(item => item.id === atualizada.id ? atualizada : item));
            mostrarToast('info', `Solicitação ${s.codigo} marcada como ignorada.`);
            if (modalDetalhesAberto && selecionada?.id === s.id) {
                setSelecionada(atualizada);
            }
        } catch (err: unknown) {
            mostrarToast('error', 'Não foi possível alterar o status da solicitação.');
        } finally {
            setSalvandoAcao(false);
        }
    };

    // Restaurar Solicitação para Pendente
    const handleRestaurarParaPendente = async (s: Solicitacao, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSalvandoAcao(true);
        try {
            const atualizada = await atualizarStatusSolicitacao(s.id, {
                status: 'PENDENTE',
            });
            setSolicitacoes(prev => prev.map(item => item.id === atualizada.id ? atualizada : item));
            mostrarToast('success', `Solicitação ${s.codigo} restaurada para pendente.`);
            if (modalDetalhesAberto && selecionada?.id === s.id) {
                setSelecionada(atualizada);
            }
        } catch (err: unknown) {
            mostrarToast('error', 'Não foi possível alterar o status da solicitação.');
        } finally {
            setSalvandoAcao(false);
        }
    };

    // Download de arquivo
    const handleBaixarArquivo = async (solicitacaoId: number, arquivoId: number, nomeOriginal: string) => {
        setBaixandoArquivoId(arquivoId);
        try {
            await baixarArquivoSolicitacao(solicitacaoId, arquivoId, nomeOriginal);
            mostrarToast('success', `Download de ${nomeOriginal} concluído.`);
        } catch (err: unknown) {
            mostrarToast('error', `Falha ao baixar o arquivo ${nomeOriginal}.`);
        } finally {
            setBaixandoArquivoId(null);
        }
    };

    // Excluir solicitação (Admin)
    const abrirModalExcluir = (s: Solicitacao, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelecionada(s);
        setModalExcluirAberto(true);
    };

    const handleConfirmarExclusao = async () => {
        if (!selecionada) return;
        setSalvandoAcao(true);
        try {
            await excluirSolicitacao(selecionada.id);
            setSolicitacoes(prev => prev.filter(item => item.id !== selecionada.id));
            mostrarToast('info', `Solicitação ${selecionada.codigo} excluída com sucesso.`);
            setModalExcluirAberto(false);
            if (modalDetalhesAberto) setModalDetalhesAberto(false);
        } catch (err: unknown) {
            mostrarToast('error', 'Não foi possível excluir a solicitação.');
        } finally {
            setSalvandoAcao(false);
        }
    };

    const formatarData = (dataIso?: string) => {
        if (!dataIso) return '-';
        try {
            return new Date(dataIso).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dataIso;
        }
    };

    const formatarTamanho = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="solicitacoes-page">
            {/* Cabeçalho */}
            <div className="solicitacoes-header">
                <div className="header-info">
                    <h1>Solicitações de Análise & Orçamento</h1>
                    <p>Acompanhe e trie as demandas comerciais de clientes recebidas pelo portal externo.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={carregarSolicitacoes} disabled={carregando} title="Recarregar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={carregando ? 'spin-icon' : ''}>
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                        </svg>
                        <span>Atualizar</span>
                    </button>
                </div>
            </div>

            {/* Barra de Controles e Status */}
            <div className="solicitacoes-controls-bar">
                <div className="status-filters">
                    <button
                        type="button"
                        className={`filter-tab ${filtroStatus === 'TODOS' ? 'active' : ''}`}
                        onClick={() => setFiltroStatus('TODOS')}
                    >
                        Todas ({contadores.total})
                    </button>
                    <button
                        type="button"
                        className={`filter-tab tab-pendente ${filtroStatus === 'PENDENTE' ? 'active' : ''}`}
                        onClick={() => setFiltroStatus('PENDENTE')}
                    >
                        Pendentes ({contadores.pendentes})
                    </button>
                    <button
                        type="button"
                        className={`filter-tab tab-registrada ${filtroStatus === 'REGISTRADA' ? 'active' : ''}`}
                        onClick={() => setFiltroStatus('REGISTRADA')}
                    >
                        Registradas ({contadores.registradas})
                    </button>
                    <button
                        type="button"
                        className={`filter-tab tab-ignorada ${filtroStatus === 'IGNORADA' ? 'active' : ''}`}
                        onClick={() => setFiltroStatus('IGNORADA')}
                    >
                        Ignoradas ({contadores.ignoradas})
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
                            placeholder="Buscar por protocolo, cliente, empresa, e-mail..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>

                    <select
                        className="service-select"
                        value={filtroServico}
                        onChange={(e) => setFiltroServico(e.target.value)}
                    >
                        <option value="TODOS">Todos os Serviços</option>
                        {Object.entries(SERVICOS_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabela de Solicitações */}
            <div className="solicitacoes-table-card">
                {carregando ? (
                    <div className="loading-state">
                        <span className="spinner" />
                        <span>Carregando solicitações...</span>
                    </div>
                ) : solicitacoesFiltradas.length === 0 ? (
                    <div className="empty-state">
                        <p>Nenhuma solicitação encontrada para os filtros selecionados.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table>
                            <thead>
                            <tr>
                                <th>Protocolo</th>
                                <th>Cliente / Empresa</th>
                                <th>Serviço Pretendido</th>
                                <th>Anexos</th>
                                <th>Status</th>
                                <th>Data</th>
                                <th style={{ textAlign: 'right' }}>Ações</th>
                            </tr>
                            </thead>
                            <tbody>
                            {solicitacoesFiltradas.map((s) => (
                                <tr key={s.id} onClick={() => abrirDetalhes(s)} className="clickable-row">
                                    <td>
                                        <span className="protocolo-plain-text">{s.codigo}</span>
                                    </td>
                                    <td>
                                        <div className="client-cell">
                                            <span className="client-name">{s.nome}</span>
                                            {s.empresa && <span className="client-company">{s.empresa}</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="service-plain-text">{SERVICOS_LABELS[s.servico] || s.servico}</span>
                                    </td>
                                    <td>
                                        {s.arquivos && s.arquivos.length > 0 ? (
                                            <span className="attachments-count">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                                </svg>
                                                {s.arquivos.length}
                                            </span>
                                        ) : (
                                            <span className="no-attachments">-</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-indicator status-${s.status.toLowerCase()}`}>
                                            <span className="dot" />
                                            {STATUS_SOLICITACAO_LABELS[s.status]}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="date-text">{formatarData(s.dataCriacao)}</span>
                                    </td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <div className="table-actions-row">
                                            {/* Botão Registrar como Serviço em Destaque */}
                                            {s.status !== 'REGISTRADA' && (
                                                <button
                                                    className="btn-register-os-action"
                                                    onClick={(e) => abrirModalRegistrarServico(s, e)}
                                                    title="Transformar esta solicitação em Ordem de Serviço"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                                                         fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                                                    </svg>
                                                    <span>Registrar Serviço</span>
                                                </button>
                                            )}

                                            {/* Ação rápida Ignorar / Restaurar */}
                                            {s.status === 'PENDENTE' && (
                                                <button
                                                    className="btn-icon-action"
                                                    onClick={(e) => handleIgnorarSolicitacao(s, e)}
                                                    title="Ignorar Solicitação"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                                    </svg>
                                                </button>
                                            )}

                                            {s.status === 'IGNORADA' && (
                                                <button
                                                    className="btn-icon-action"
                                                    onClick={(e) => handleRestaurarParaPendente(s, e)}
                                                    title="Restaurar para Pendente"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="1 4 1 10 7 10" />
                                                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                                                    </svg>
                                                </button>
                                            )}

                                            {/* Ver Detalhes */}
                                            <button
                                                className="btn-icon-action"
                                                onClick={() => abrirDetalhes(s)}
                                                title="Ver Detalhes"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            </button>

                                            {/* Excluir (Discreto) */}
                                            <button
                                                className="btn-icon-action btn-delete-action"
                                                onClick={(e) => abrirModalExcluir(s, e)}
                                                title="Excluir Definitivamente"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 6h18" />
                                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal: Detalhes da Solicitação */}
            {modalDetalhesAberto && selecionada && (
                <div className="solicitacao-modal-overlay" onClick={() => setModalDetalhesAberto(false)}>
                    <div className="solicitacao-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="solicitacao-modal-header">
                            <div className="header-meta">
                                <span className="protocolo-title">{selecionada.codigo}</span>
                                <span className="header-sub">Recebida em {formatarData(selecionada.dataCriacao)}</span>
                            </div>
                            <div className="header-status-side">
                                <span className={`status-indicator status-${selecionada.status.toLowerCase()}`}>
                                    <span className="dot" />
                                    {STATUS_SOLICITACAO_LABELS[selecionada.status]}
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

                        <div className="solicitacao-modal-body">
                            {/* Seção 1: Dados do Cliente */}
                            <div className="info-block">
                                <h4 className="block-title">Dados de Contato & Empresa</h4>
                                <div className="grid-2-col">
                                    <div className="info-item">
                                        <span className="label">Nome do Solicitante:</span>
                                        <span className="value strong">{selecionada.nome}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Empresa / Razão Social:</span>
                                        <span className="value">{selecionada.empresa || 'Não informada'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">E-mail de Contato:</span>
                                        <span className="value">{selecionada.email}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Telefone / Ramal:</span>
                                        <span className="value">{selecionada.telefone}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Seção 2: Especificações Técnicas da Demanda */}
                            <div className="info-block">
                                <h4 className="block-title">Demanda Técnica Solicitada</h4>
                                <div className="grid-2-col">
                                    <div className="info-item">
                                        <span className="label">Serviço Pretendido:</span>
                                        <span className="value strong">{SERVICOS_LABELS[selecionada.servico] || selecionada.servico}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Quantidade Estimada de Peças:</span>
                                        <span className="value">{selecionada.quantidadePecas || '1 peça / lote teste'}</span>
                                    </div>
                                </div>

                                <div className="info-item full-width" style={{ marginTop: '0.75rem' }}>
                                    <span className="label">Descrição Detalhada do Cliente:</span>
                                    <div className="message-content">
                                        {selecionada.mensagem ? (
                                            <p>{selecionada.mensagem}</p>
                                        ) : (
                                            <p className="empty-hint">Nenhuma observação descritiva informada pelo solicitante.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Seção 3: Anexos e Modelos CAD */}
                            <div className="info-block">
                                <h4 className="block-title">Documentação Técnica & Arquivos CAD</h4>
                                {selecionada.arquivos && selecionada.arquivos.length > 0 ? (
                                    <div className="files-list">
                                        {selecionada.arquivos.map((arq) => (
                                            <div key={arq.id} className="file-card">
                                                <div className="file-info">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                                                        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                                                    </svg>
                                                    <span className="file-name" title={arq.nomeOriginal}>{arq.nomeOriginal}</span>
                                                    <span className="file-size">{formatarTamanho(arq.tamanhoBytes)}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn-download-file"
                                                    onClick={() => handleBaixarArquivo(selecionada.id, arq.id, arq.nomeOriginal)}
                                                    disabled={baixandoArquivoId === arq.id}
                                                >
                                                    {baixandoArquivoId === arq.id ? 'Baixando...' : 'Download'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="empty-hint">Nenhum arquivo ou modelo 3D foi anexado a este pedido.</p>
                                )}
                            </div>
                        </div>

                        <div className="solicitacao-modal-footer">
                            <div className="footer-left-actions">
                                {selecionada.status === 'PENDENTE' && (
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => handleIgnorarSolicitacao(selecionada)}
                                        disabled={salvandoAcao}
                                    >
                                        Ignorar Solicitação
                                    </button>
                                )}

                                {selecionada.status === 'IGNORADA' && (
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => handleRestaurarParaPendente(selecionada)}
                                        disabled={salvandoAcao}
                                    >
                                        Restaurar para Pendente
                                    </button>
                                )}
                            </div>

                            <div className="footer-right-actions">
                                <button type="button" className="btn-secondary" onClick={() => setModalDetalhesAberto(false)}>
                                    Fechar
                                </button>

                                {selecionada.status !== 'REGISTRADA' && (
                                    <button
                                        type="button"
                                        className="btn-primary-action"
                                        onClick={() => {
                                            setModalDetalhesAberto(false);
                                            abrirModalRegistrarServico(selecionada);
                                        }}
                                    >
                                        Registrar como Serviço
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Reutilizável: Transformar Solicitação em Registro de Serviço */}
            <ModalCriarServico
                aberto={modalRegistrarServicoAberto}
                onClose={() => setModalRegistrarServicoAberto(false)}
                onSucesso={handleServicoCriadoComSucesso}
                solicitacaoOrigem={selecionada}
            />

            {/* Modal: Confirmar Exclusão */}
            {modalExcluirAberto && selecionada && (
                <div className="solicitacao-modal-overlay" onClick={() => setModalExcluirAberto(false)}>
                    <div className="solicitacao-modal-box modal-confirm-simple" onClick={(e) => e.stopPropagation()}>
                        <div className="solicitacao-modal-header">
                            <span className="protocolo-title">Excluir Solicitação</span>
                            <button className="btn-close-modal" onClick={() => setModalExcluirAberto(false)} title="Fechar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="solicitacao-modal-body">
                            <p className="confirm-text">
                                Deseja realmente excluir permanentemente a solicitação <strong>{selecionada.codigo}</strong>?
                                Esta operação não poderá ser desfeita.
                            </p>
                        </div>
                        <div className="solicitacao-modal-footer">
                            <div className="footer-right-actions" style={{ width: '100%', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setModalExcluirAberto(false)}>
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn-danger-action"
                                    onClick={handleConfirmarExclusao}
                                    disabled={salvandoAcao}
                                >
                                    {salvandoAcao ? 'Excluindo...' : 'Confirmar Exclusão'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
