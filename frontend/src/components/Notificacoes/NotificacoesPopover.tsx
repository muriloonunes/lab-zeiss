import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notificacao } from '../../types/notificacao';
import {
    listarNotificacoes,
    contarNotificacoesNaoLidas,
    marcarNotificacaoComoLida,
    marcarTodasNotificacoesComoLidas,
    excluirNotificacao,
} from '../../services/notificacaoService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast';
import './NotificacoesPopover.scss';

export const NotificacoesPopover: React.FC = () => {
    const { usuario, autenticado } = useAuth();
    const navigate = useNavigate();
    const [aberto, setAberto] = useState(false);
    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
    const [totalNaoLidas, setTotalNaoLidas] = useState<number>(0);
    const [carregando, setCarregando] = useState(false);
    const [notificacaoSelecionada, setNotificacaoSelecionada] = useState<Notificacao | null>(null);

    const { mostrarToast } = useToast();
    const popoverRef = useRef<HTMLDivElement>(null);

    const atualizarContagem = useCallback(async () => {
        if (!autenticado) return;
        try {
            const res = await contarNotificacoesNaoLidas();
            setTotalNaoLidas(res.totalNaoLidas);
        } catch {
            // Falha silenciosa
        }
    }, [autenticado]);

    const carregarNotificacoes = useCallback(async (silencioso = false) => {
        if (!autenticado) return;
        if (!silencioso) setCarregando(true);
        try {
            const dados = await listarNotificacoes();
            setNotificacoes(dados);
            const naoLidas = dados.filter((n) => !n.lida).length;
            setTotalNaoLidas(naoLidas);
        } catch (err: unknown) {
            if (!silencioso) {
                mostrarToast('error', 'Falha ao carregar as notificações.');
            }
        } finally {
            if (!silencioso) setCarregando(false);
        }
    }, [autenticado, mostrarToast]);

    // Atualiza contagem na montagem e com polling de 30s
    useEffect(() => {
        if (autenticado) {
            atualizarContagem();
        }

        const intervalo = setInterval(() => {
            if (aberto) {
                carregarNotificacoes(true);
            } else {
                atualizarContagem();
            }
        }, 30000);

        return () => clearInterval(intervalo);
    }, [autenticado, aberto, atualizarContagem, carregarNotificacoes]);

    const handleTogglePopover = () => {
        if (!aberto) {
            carregarNotificacoes(false);
        }
        setAberto((prev) => !prev);
    };

    const handleFecharPopover = () => {
        setAberto(false);
    };

    const handleMarcarComoLida = async (id: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        try {
            await marcarNotificacaoComoLida(id);
            setNotificacoes((prev) =>
                prev.map((item) => (item.id === id ? { ...item, lida: true } : item))
            );
            setTotalNaoLidas((prev) => Math.max(0, prev - 1));
        } catch {
            mostrarToast('error', 'Não foi possível marcar como lida.');
        }
    };

    const handleMarcarTodasComoLidas = async () => {
        if (totalNaoLidas === 0) return;
        try {
            await marcarTodasNotificacoesComoLidas();
            setNotificacoes((prev) => prev.map((item) => ({ ...item, lida: true })));
            setTotalNaoLidas(0);
            mostrarToast('success', 'Todas as notificações foram marcadas como lidas.');
        } catch {
            mostrarToast('error', 'Não foi possível marcar todas como lidas.');
        }
    };

    const handleExcluirNotificacao = async (id: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        try {
            const notif = notificacoes.find((item) => item.id === id);
            await excluirNotificacao(id);
            setNotificacoes((prev) => prev.filter((item) => item.id !== id));
            if (notif && !notif.lida) {
                setTotalNaoLidas((prev) => Math.max(0, prev - 1));
            }
            if (notificacaoSelecionada?.id === id) {
                setNotificacaoSelecionada(null);
            }
            mostrarToast('success', 'Notificação excluída com sucesso.');
        } catch {
            mostrarToast('error', 'Não foi possível excluir a notificação.');
        }
    };

    const handleAbrirDetalhe = (notif: Notificacao) => {
        if (!notif.lida) {
            handleMarcarComoLida(notif.id);
        }
        setAberto(false);

        // Se houver link direto ou parâmetros de navegação rápida, navegar diretamente
        const destino = notif.link || (
            notif.tipo === 'LICAO_DEVOLVIDA' && notif.referenciaId
                ? `/interno/servicos?servicoId=${notif.referenciaId}&acao=revisarLicao`
                : (notif.tipo === 'NOVA_LICAO_VALIDAR' || notif.tipo === 'LICAO_REENVIADA') && notif.referenciaId
                    ? `/interno/licoes?aba=validacao&servicoId=${notif.referenciaId}`
                    : notif.tipo === 'LICAO_APROVADA' && notif.referenciaId
                        ? `/interno/licoes?aba=conhecimento&servicoId=${notif.referenciaId}`
                        : null
        );

        if (destino) {
            navigate(destino);
        } else {
            setNotificacaoSelecionada(notif);
        }
    };

    const formatarDataAmigavel = (dataStr: string) => {
        try {
            const data = new Date(dataStr);
            return data.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dataStr;
        }
    };

    return (
        <div className="notificacoes-container" ref={popoverRef}>
            <button
                className={`notificacoes-trigger-btn ${aberto ? 'active' : ''}`}
                onClick={handleTogglePopover}
                title="Notificações do Sistema"
                aria-label="Notificações"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>

                {totalNaoLidas > 0 && (
                    <span className="notificacoes-badge">
                        {totalNaoLidas > 99 ? '99+' : totalNaoLidas}
                    </span>
                )}
            </button>

            {aberto && (
                <>
                    <div className="notificacoes-backdrop" onClick={handleFecharPopover} />
                    <div className="notificacoes-popover">
                        <div className="popover-header">
                            <div className="header-title">
                                <h4>Notificações</h4>
                                {totalNaoLidas > 0 && (
                                    <span className="badge-nao-lidas">{totalNaoLidas} novas</span>
                                )}
                            </div>
                            <div className="header-actions">
                                {totalNaoLidas > 0 && (
                                    <button
                                        className="btn-mark-all"
                                        onClick={handleMarcarTodasComoLidas}
                                        title="Marcar todas como lidas"
                                    >
                                        Limpar não lidas
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="popover-body">
                            {carregando ? (
                                <div className="popover-loading">
                                    <div className="spinner-sutil" />
                                    <span>Carregando notificações...</span>
                                </div>
                            ) : notificacoes.length === 0 ? (
                                <div className="popover-empty">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                    </svg>
                                    <p>Nenhuma notificação por enquanto.</p>
                                </div>
                            ) : (
                                <ul className="notificacoes-list">
                                    {notificacoes.map((item) => (
                                        <li
                                            key={item.id}
                                            className={`notificacao-item ${!item.lida ? 'nao-lida' : ''}`}
                                            onClick={() => handleAbrirDetalhe(item)}
                                        >
                                            <span className="item-dot" />
                                            <div className="item-content">
                                                <span className="item-title">{item.titulo}</span>
                                                <p className="item-mensagem">{item.mensagem}</p>
                                                <span className="item-data">
                                                    {formatarDataAmigavel(item.dataCriacao)}
                                                </span>
                                            </div>
                                            <div className="item-actions">
                                                {!item.lida && (
                                                    <button
                                                        className="btn-action"
                                                        onClick={(e) => handleMarcarComoLida(item.id, e)}
                                                        title="Marcar como lida"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <button
                                                    className="btn-action btn-delete"
                                                    onClick={(e) => handleExcluirNotificacao(item.id, e)}
                                                    title="Excluir notificação"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M3 6h18" />
                                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Modal de Detalhe Completo */}
            {notificacaoSelecionada && (
                <div
                    className="notificacao-modal-backdrop"
                    onClick={() => setNotificacaoSelecionada(null)}
                >
                    <div
                        className="notificacao-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <div className="header-info">
                                <span className="modal-badge">Aviso do Sistema</span>
                                <h3>{notificacaoSelecionada.titulo}</h3>
                                <span className="modal-data">
                                    Recebida em: {formatarDataAmigavel(notificacaoSelecionada.dataCriacao)}
                                </span>
                            </div>
                            <button
                                className="btn-fechar"
                                onClick={() => setNotificacaoSelecionada(null)}
                                title="Fechar"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="mensagem-box">
                                {notificacaoSelecionada.mensagem}
                            </div>
                        </div>
                        <div className="modal-footer">
                            {(notificacaoSelecionada.link || notificacaoSelecionada.referenciaId) && (
                                <button
                                    className="btn-primario"
                                    onClick={() => {
                                        const destino = notificacaoSelecionada.link || (
                                            notificacaoSelecionada.tipo === 'LICAO_DEVOLVIDA'
                                                ? `/interno/servicos?servicoId=${notificacaoSelecionada.referenciaId}&acao=revisarLicao`
                                                : `/interno/licoes?servicoId=${notificacaoSelecionada.referenciaId}`
                                        );
                                        setNotificacaoSelecionada(null);
                                        navigate(destino);
                                    }}
                                >
                                    Acessar Registro →
                                </button>
                            )}
                            <button
                                className="btn-secundario"
                                onClick={() => setNotificacaoSelecionada(null)}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
