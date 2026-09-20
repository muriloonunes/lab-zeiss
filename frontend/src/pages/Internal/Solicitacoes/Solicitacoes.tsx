import React, { useEffect, useMemo, useState } from 'react';
import { Solicitacao, STATUS_SOLICITACAO_LABELS, StatusSolicitacao } from '../../../types/solicitacao';
import {
    atualizarStatusSolicitacao,
    baixarArquivoSolicitacao,
    excluirSolicitacao,
    listarSolicitacoes
} from '../../../services/solicitacaoService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../components/Toast';
import './Solicitacoes.scss';

const SERVICOS_LABELS: Record<string, string> = {
    'cmm': 'Medição por Coordenadas (CMM)',
    'optica': 'Medição Óptica & Luz Branca',
    'raio-x': 'Tomografia Computadorizada (Raio-X)',
    'digitalizacao-3d': 'Digitalização 3D e Escaneamento',
    'engenharia-reversa': 'Engenharia Reversa CAD',
    'consultoria': 'Consultoria & Treinamento GD&T',
};

const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes <= 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || 'ARQ';
};

export const Solicitacoes: React.FC = () => {
    const { isAdmin } = useAuth();
    const { mostrarToast } = useToast();

    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
    const [carregando, setCarregando] = useState(true);

    // Filtros
    const [busca, setBusca] = useState('');
    const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
    const [filtroServico, setFiltroServico] = useState<string>('TODOS');

    // Modais
    const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
    const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

    // Solicitação Selecionada
    const [selecionada, setSelecionada] = useState<Solicitacao | null>(null);

    // Estados de ação
    const [salvandoAcao, setSalvandoAcao] = useState(false);
    const [baixandoArquivoId, setBaixandoArquivoId] = useState<number | null>(null);

    const carregarLista = async () => {
        setCarregando(true);
        try {
            const data = await listarSolicitacoes();
            setSolicitacoes(data);
        } catch (err: unknown) {
            mostrarToast('error', 'Não foi possível carregar as solicitações de serviço.');
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarLista();
    }, []);

    // Estatísticas discretas
    const contadores = useMemo(() => {
        const total = solicitacoes.length;
        const pendentes = solicitacoes.filter(s => s.status === 'PENDENTE').length;
        const respondidas = solicitacoes.filter(s => s.status === 'RESPONDIDA').length;
        const ignoradas = solicitacoes.filter(s => s.status === 'IGNORADA').length;
        return { total, pendentes, respondidas, ignoradas };
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
                s.telefone.toLowerCase().includes(query);

            const matchStatus = filtroStatus === 'TODOS' || s.status === filtroStatus;
            const matchServico = filtroServico === 'TODOS' || s.servico === filtroServico;

            return matchBusca && matchStatus && matchServico;
        });
    }, [solicitacoes, busca, filtroStatus, filtroServico]);

    // Abrir modal de detalhes
    const abrirDetalhes = (s: Solicitacao) => {
        setSelecionada(s);
        setModalDetalhesAberto(true);
    };

    // Ação: Alternar Ignorado / Pendente
    const handleToggleIgnorar = async (s: Solicitacao, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSalvandoAcao(true);

        const proximoStatus: StatusSolicitacao = s.status === 'IGNORADA' ? 'PENDENTE' : 'IGNORADA';
        try {
            const atualizada = await atualizarStatusSolicitacao(s.id, {
                status: proximoStatus,
            });

            setSolicitacoes(prev => prev.map(item => item.id === atualizada.id ? atualizada : item));
            if (selecionada && selecionada.id === atualizada.id) {
                setSelecionada(atualizada);
            }

            if (proximoStatus === 'IGNORADA') {
                mostrarToast('info', `Solicitação ${s.codigo} marcada como ignorada.`);
            } else {
                mostrarToast('success', `Solicitação ${s.codigo} reaberta como pendente.`);
            }
        } catch (err: unknown) {
            mostrarToast('error', 'Não foi possível alterar o status da solicitação.');
        } finally {
            setSalvandoAcao(false);
        }
    };

    // Ação: Registrar como Serviço (prepara transição para Registro de Serviço)
    const handleRegistrarComoServico = (s: Solicitacao, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        // Feedback imediato e preparação para abertura da OS
        mostrarToast('info', `Iniciando Registro de Serviço para o protocolo ${s.codigo}...`);
        if (modalDetalhesAberto) {
            setModalDetalhesAberto(false);
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
            mostrarToast('success', `Solicitação ${selecionada.codigo} excluída.`);
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
            return new Date(dataIso).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dataIso;
        }
    };

    return (
        <div className="solicitacoes-page">
            {/* Cabeçalho */}
            <div className="solicitacoes-header">
                <div className="header-info">
                    <h1>Solicitações de Serviços</h1>
                    <p>Demandas recebidas pelo portal público para triagem e conversão em Registros de Serviço do laboratório.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={carregarLista} disabled={carregando} title="Recarregar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={carregando ? 'spin-icon' : ''}>
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                        </svg>
                        <span>Atualizar</span>
                    </button>
                </div>
            </div>

            {/* Barra de Filtros e Status */}
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
                        className={`filter-tab tab-respondida ${filtroStatus === 'RESPONDIDA' ? 'active' : ''}`}
                        onClick={() => setFiltroStatus('RESPONDIDA')}
                    >
                        Registradas ({contadores.respondidas})
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
                            placeholder="Buscar por protocolo, cliente, empresa ou e-mail..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>

                    <select
                        className="service-select"
                        value={filtroServico}
                        onChange={(e) => setFiltroServico(e.target.value)}
                        title="Filtrar por tipo de serviço"
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
                                <th>Qtd.</th>
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
                                        <span className="protocol-text">{s.codigo}</span>
                                    </td>
                                    <td>
                                        <div className="client-cell">
                                            <strong className="client-name">{s.nome}</strong>
                                            <span className="client-company">{s.empresa}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="service-text">
                                            {SERVICOS_LABELS[s.servico] || s.servico}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="qty-text">{s.quantidadePecas || '1 un.'}</span>
                                    </td>
                                    <td>
                                        {s.arquivos && s.arquivos.length > 0 ? (
                                            <span className="files-indicator">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                                </svg>
                                                <span>{s.arquivos.length}</span>
                                            </span>
                                        ) : (
                                            <span className="no-files">—</span>
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
                                            {/* Botão claro de registrar serviço */}
                                            <button
                                                className="btn-register-service"
                                                onClick={(e) => handleRegistrarComoServico(s, e)}
                                                title="Criar Registro de Serviço a partir desta demanda"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                                     fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="12" y1="5" x2="12" y2="19" />
                                                    <line x1="5" y1="12" x2="19" y2="12" />
                                                </svg>
                                                <span>Registrar Serviço</span>
                                            </button>

                                            {/* Atalho Ignorar / Restaurar */}
                                            <button
                                                className={`btn-icon-action ${s.status === 'IGNORADA' ? 'btn-restore' : 'btn-ignore'}`}
                                                onClick={(e) => handleToggleIgnorar(s, e)}
                                                disabled={salvandoAcao}
                                                title={s.status === 'IGNORADA' ? 'Restaurar solicitação para Pendente' : 'Marcar solicitação como Ignorada'}
                                            >
                                                {s.status === 'IGNORADA' ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                                        <path d="M21 3v5h-5" />
                                                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                                                        <path d="M8 16H3v5" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                                    </svg>
                                                )}
                                            </button>

                                            {/* Detalhes */}
                                            <button
                                                className="btn-icon-action"
                                                onClick={() => abrirDetalhes(s)}
                                                title="Ver detalhes da solicitação"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            </button>

                                            {/* Excluir (Admin) */}
                                            {isAdmin && (
                                                <button
                                                    className="btn-icon-action btn-delete"
                                                    onClick={(e) => abrirModalExcluir(s, e)}
                                                    title="Excluir permanentemente"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M3 6h18" />
                                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
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

            {/* Modal: Visualizar Solicitação */}
            {modalDetalhesAberto && selecionada && (
                <div className="solicitacao-modal-overlay" onClick={() => setModalDetalhesAberto(false)}>
                    <div className="solicitacao-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="solicitacao-modal-header">
                            <div className="header-meta">
                                <span className="protocol-title">Solicitação {selecionada.codigo}</span>
                                <span className="header-sub">Recebido em {formatarData(selecionada.dataCriacao)}</span>
                            </div>
                            <div className="header-status-side">
                                <span className={`status-indicator status-${selecionada.status.toLowerCase()}`}>
                                    <span className="dot" />
                                    {STATUS_SOLICITACAO_LABELS[selecionada.status]}
                                </span>
                                <button
                                    className="btn-close-modal"
                                    onClick={() => setModalDetalhesAberto(false)}
                                    title="Fechar"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="solicitacao-modal-body">
                            <div className="modal-content-grid">
                                {/* Informações do Solicitante */}
                                <div className="info-block">
                                    <h4 className="block-title">Dados do Solicitante</h4>
                                    <div className="info-rows">
                                        <div className="info-row">
                                            <span className="info-label">Nome / Responsável:</span>
                                            <span className="info-value strong">{selecionada.nome}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Empresa / Razão Social:</span>
                                            <span className="info-value">{selecionada.empresa}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">E-mail:</span>
                                            <a href={`mailto:${selecionada.email}`} className="info-value link">{selecionada.email}</a>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Telefone:</span>
                                            <a href={`tel:${selecionada.telefone}`} className="info-value link">{selecionada.telefone}</a>
                                        </div>
                                    </div>
                                </div>

                                {/* Demanda Técnica */}
                                <div className="info-block">
                                    <h4 className="block-title">Demanda Pretendida</h4>
                                    <div className="info-rows">
                                        <div className="info-row">
                                            <span className="info-label">Serviço:</span>
                                            <span className="info-value strong">
                                                {SERVICOS_LABELS[selecionada.servico] || selecionada.servico}
                                            </span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Lote / Quantidade de Peças:</span>
                                            <span className="info-value">{selecionada.quantidadePecas || '1 unidade'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mensagem do Solicitante */}
                            <div className="message-container">
                                <h4 className="block-title">Requisitos e Instruções do Solicitante</h4>
                                <div className="message-text-box">
                                    {selecionada.mensagem ? (
                                        <p>{selecionada.mensagem}</p>
                                    ) : (
                                        <span className="empty-text">Nenhuma instrução adicional informada.</span>
                                    )}
                                </div>
                            </div>

                            {/* Arquivos Anexados */}
                            <div className="attachments-container">
                                <h4 className="block-title">
                                    Desenhos Técnicos e Arquivos CAD ({selecionada.arquivos ? selecionada.arquivos.length : 0})
                                </h4>
                                {selecionada.arquivos && selecionada.arquivos.length > 0 ? (
                                    <div className="attachments-list">
                                        {selecionada.arquivos.map((arq) => (
                                            <div key={arq.id} className="attachment-item">
                                                <div className="attachment-details">
                                                    <span className="file-format">{getFileExtension(arq.nomeOriginal)}</span>
                                                    <div className="file-texts">
                                                        <strong className="file-name" title={arq.nomeOriginal}>{arq.nomeOriginal}</strong>
                                                        <span className="file-size">{formatFileSize(arq.tamanhoBytes)}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleBaixarArquivo(selecionada.id, arq.id, arq.nomeOriginal)}
                                                    className="btn-download-simple"
                                                    disabled={baixandoArquivoId === arq.id}
                                                    title={`Baixar ${arq.nomeOriginal}`}
                                                >
                                                    {baixandoArquivoId === arq.id ? (
                                                        <span className="spinner-sm" />
                                                    ) : (
                                                        <>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                                <polyline points="7 10 12 15 17 10" />
                                                                <line x1="12" y1="15" x2="12" y2="3" />
                                                            </svg>
                                                            <span>Baixar Arquivo</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-attachments-text">Nenhum desenho ou arquivo 3D foi anexado a esta solicitação.</p>
                                )}
                            </div>
                        </div>

                        {/* Rodapé de Ações Baseado em Fluxo Operacional */}
                        <div className="solicitacao-modal-footer">
                            <div className="footer-left-actions">
                                <button
                                    type="button"
                                    className={`btn-action-outline ${selecionada.status === 'IGNORADA' ? 'btn-restore' : 'btn-ignore'}`}
                                    onClick={() => handleToggleIgnorar(selecionada)}
                                    disabled={salvandoAcao}
                                >
                                    {selecionada.status === 'IGNORADA' ? 'Reabrir Solicitação (Pendente)' : 'Ignorar Solicitação'}
                                </button>
                            </div>

                            <div className="footer-right-actions">
                                <button
                                    type="button"
                                    className="btn-close-clean"
                                    onClick={() => setModalDetalhesAberto(false)}
                                >
                                    Fechar
                                </button>

                                <button
                                    type="button"
                                    className="btn-primary-register"
                                    onClick={() => handleRegistrarComoServico(selecionada)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    <span>Registrar como Serviço</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Confirmar Exclusão */}
            {modalExcluirAberto && selecionada && (
                <div className="solicitacao-modal-overlay" onClick={() => setModalExcluirAberto(false)}>
                    <div className="solicitacao-modal-box modal-confirm-simple" onClick={(e) => e.stopPropagation()}>
                        <div className="solicitacao-modal-header">
                            <span className="protocol-title">Excluir Solicitação</span>
                            <button className="btn-close-modal" onClick={() => setModalExcluirAberto(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="solicitacao-modal-body">
                            <p className="confirm-text">
                                Deseja excluir permanentemente a solicitação <strong>{selecionada.codigo}</strong> da
                                empresa <strong>{selecionada.empresa}</strong>?
                            </p>
                            <p className="sub-warning">
                                Todos os arquivos técnicos anexados serão removidos do armazenamento do laboratório.
                            </p>
                        </div>
                        <div className="solicitacao-modal-footer">
                            <div className="footer-right-actions" style={{ width: '100%', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    className="btn-close-clean"
                                    onClick={() => setModalExcluirAberto(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn-danger-action"
                                    onClick={handleConfirmarExclusao}
                                    disabled={salvandoAcao}
                                >
                                    {salvandoAcao ? 'Excluindo...' : 'Excluir Definitivamente'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
