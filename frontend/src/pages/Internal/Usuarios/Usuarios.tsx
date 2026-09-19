import React, { useEffect, useMemo, useState } from 'react';
import { TIPOS_USUARIO, TipoUsuario, Usuario } from '../../../types/usuario';
import {
    atualizarUsuario,
    criarUsuario,
    desativarUsuario,
    listarUsuarios,
    reativarUsuario,
    redefinirSenha
} from '../../../services/usuarioService';
import { ApiError } from '../../../types/api';
import { useToast } from '../../../components/Toast';
import './Usuarios.scss';

export const Usuarios: React.FC = () => {
    const { mostrarToast } = useToast();
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [busca, setBusca] = useState('');
    const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
    const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

    // Modais
    const [modalCriarAberto, setModalCriarAberto] = useState(false);
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [modalSenhaAberto, setModalSenhaAberto] = useState(false);
    const [modalStatusAberto, setModalStatusAberto] = useState(false);

    // Usuário selecionado para edição / ação
    const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);

    // Estado do formulário de criação
    const [formCriar, setFormCriar] = useState({
        nome: '',
        username: '',
        email: '',
        senha: '',
        tipoUsuario: 'TECNICO' as TipoUsuario,
    });

    // Estado do formulário de edição
    const [formEditar, setFormEditar] = useState({
        nome: '',
        username: '',
        email: '',
        tipoUsuario: 'TECNICO' as TipoUsuario,
    });

    // Estado do formulário de redefinição de senha
    const [formSenha, setFormSenha] = useState({
        novaSenha: '',
        confirmarSenha: '',
    });

    // Estados de carregamento e erro por modal
    const [salvando, setSalvando] = useState(false);
    const [erroModal, setErroModal] = useState<string | null>(null);

    const carregarLista = async () => {
        setCarregando(true);
        try {
            const lista = await listarUsuarios();
            setUsuarios(lista);
        } catch (err: unknown) {
            mostrarToast('error', 'Não foi possível carregar a lista de usuários.');
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarLista();
    }, []);

    // Filtros de busca
    const usuariosFiltrados = useMemo(() => {
        return usuarios.filter((u) => {
            const query = busca.toLowerCase().trim();
            const matchBusca =
                !query ||
                u.nome.toLowerCase().includes(query) ||
                u.username.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query);

            const matchTipo = filtroTipo === 'TODOS' || u.tipoUsuario === filtroTipo;
            const matchStatus =
                filtroStatus === 'TODOS' ||
                (filtroStatus === 'ATIVO' && u.ativo) ||
                (filtroStatus === 'INATIVO' && !u.ativo);

            return matchBusca && matchTipo && matchStatus;
        });
    }, [usuarios, busca, filtroTipo, filtroStatus]);

    // Abrir modal de criação
    const abrirModalCriar = () => {
        setFormCriar({
            nome: '',
            username: '',
            email: '',
            senha: '',
            tipoUsuario: 'TECNICO',
        });
        setErroModal(null);
        setModalCriarAberto(true);
    };

    // Submeter criação
    const handleCriar = async (e: React.FormEvent) => {
        e.preventDefault();
        setErroModal(null);

        if (!formCriar.nome.trim() || !formCriar.username.trim() || !formCriar.email.trim() || !formCriar.senha) {
            setErroModal('Preencha todos os campos obrigatórios.');
            return;
        }

        if (formCriar.senha.length < 8) {
            setErroModal('A senha deve ter no mínimo 8 caracteres.');
            return;
        }

        setSalvando(true);
        try {
            await criarUsuario({
                nome: formCriar.nome.trim(),
                username: formCriar.username.trim(),
                email: formCriar.email.trim(),
                senha: formCriar.senha,
                tipoUsuario: formCriar.tipoUsuario,
            });
            setModalCriarAberto(false);
            mostrarToast('success', 'Usuário criado com sucesso!');
            await carregarLista();
        } catch (err: unknown) {
            if (err instanceof ApiError) {
                setErroModal(err.message || 'Erro ao criar usuário.');
            } else {
                setErroModal('Falha ao conectar com o servidor.');
            }
        } finally {
            setSalvando(false);
        }
    };

    // Abrir modal de edição
    const abrirModalEditar = (u: Usuario) => {
        setUsuarioSelecionado(u);
        setFormEditar({
            nome: u.nome,
            username: u.username,
            email: u.email,
            tipoUsuario: u.tipoUsuario,
        });
        setErroModal(null);
        setModalEditarAberto(true);
    };

    // Submeter edição
    const handleEditar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!usuarioSelecionado) return;
        setErroModal(null);

        if (!formEditar.nome.trim() || !formEditar.username.trim() || !formEditar.email.trim()) {
            setErroModal('Preencha todos os campos obrigatórios.');
            return;
        }

        setSalvando(true);
        try {
            await atualizarUsuario(usuarioSelecionado.id, {
                nome: formEditar.nome.trim(),
                username: formEditar.username.trim(),
                email: formEditar.email.trim(),
                tipoUsuario: formEditar.tipoUsuario,
            });
            setModalEditarAberto(false);
            mostrarToast('success', 'Dados do usuário atualizados com sucesso!');
            await carregarLista();
        } catch (err: unknown) {
            if (err instanceof ApiError) {
                setErroModal(err.message || 'Erro ao atualizar dados do usuário.');
            } else {
                setErroModal('Falha ao conectar com o servidor.');
            }
        } finally {
            setSalvando(false);
        }
    };

    // Abrir modal de redefinir senha
    const abrirModalSenha = (u: Usuario) => {
        setUsuarioSelecionado(u);
        setFormSenha({ novaSenha: '', confirmarSenha: '' });
        setErroModal(null);
        setModalSenhaAberto(true);
    };

    // Submeter redefinição de senha
    const handleRedefinirSenha = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!usuarioSelecionado) return;
        setErroModal(null);

        if (formSenha.novaSenha.length < 8) {
            setErroModal('A nova senha deve ter no mínimo 8 caracteres.');
            return;
        }

        if (formSenha.novaSenha !== formSenha.confirmarSenha) {
            setErroModal('As senhas digitadas não coincidem.');
            return;
        }

        setSalvando(true);
        try {
            await redefinirSenha(usuarioSelecionado.id, formSenha.novaSenha);
            setModalSenhaAberto(false);
            mostrarToast('success', `Senha de @${usuarioSelecionado.username} redefinida com sucesso!`);
        } catch (err: unknown) {
            if (err instanceof ApiError) {
                setErroModal(err.message || 'Erro ao redefinir a senha.');
            } else {
                setErroModal('Falha ao conectar com o servidor.');
            }
        } finally {
            setSalvando(false);
        }
    };

    // Abrir confirmação de desativação ou reativação
    const abrirModalStatus = (u: Usuario) => {
        setUsuarioSelecionado(u);
        setErroModal(null);
        setModalStatusAberto(true);
    };

    // Confirmar desativação ou reativação
    const handleAlternarStatus = async () => {
        if (!usuarioSelecionado) return;
        setSalvando(true);
        try {
            if (usuarioSelecionado.ativo) {
                await desativarUsuario(usuarioSelecionado.id);
                mostrarToast('success', `Usuário @${usuarioSelecionado.username} desativado com sucesso.`);
            } else {
                await reativarUsuario(usuarioSelecionado.id);
                mostrarToast('success', `Usuário @${usuarioSelecionado.username} reativado com sucesso!`);
            }
            setModalStatusAberto(false);
            await carregarLista();
        } catch (err: unknown) {
            if (err instanceof ApiError) {
                setErroModal(err.message || 'Erro ao alterar status do usuário.');
            } else {
                setErroModal('Falha de comunicação com o servidor.');
            }
        } finally {
            setSalvando(false);
        }
    };

    const formatarData = (dataIso?: string) => {
        if (!dataIso) return '-';
        try {
            return new Date(dataIso).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        } catch {
            return dataIso;
        }
    };

    const getRoleBadgeClass = (tipo: TipoUsuario) => {
        switch (tipo) {
            case 'ADMINISTRADOR':
                return 'admin';
            case 'VALIDADOR':
                return 'validador';
            case 'TECNICO':
                return 'tecnico';
            default:
                return 'consulta';
        }
    };

    return (
        <div className="usuarios-page">
            <div className="usuarios-header">
                <div className="header-info">
                    <h1>Gerenciamento de Usuários</h1>
                    <p>Controle de contas, perfis de autorização e credenciais de acesso ao sistema.</p>
                </div>
                <button className="btn-novo-usuario" onClick={abrirModalCriar}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    <span>Novo Usuário</span>
                </button>
            </div>

            {/* Filtros e Busca */}
            <div className="usuarios-filters-bar">
                <div className="search-input-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar por nome, username ou e-mail..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>

                <div className="filter-selects">
                    <select
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        title="Filtrar por Perfil"
                    >
                        <option value="TODOS">Todos os Perfis</option>
                        {TIPOS_USUARIO.map((tipo) => (
                            <option key={tipo} value={tipo}>
                                {tipo}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                        title="Filtrar por Status"
                    >
                        <option value="TODOS">Todos os Status</option>
                        <option value="ATIVO">Ativos</option>
                        <option value="INATIVO">Inativos</option>
                    </select>
                </div>
            </div>

            {/* Tabela de Dados */}
            <div className="usuarios-table-card">
                {carregando ? (
                    <div className="loading-state">
                        <span className="spinner"/>
                        <span>Carregando usuários cadastrados...</span>
                    </div>
                ) : usuariosFiltrados.length === 0 ? (
                    <div className="empty-state">
                        <p>Nenhum usuário encontrado para os critérios de busca.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table>
                            <thead>
                            <tr>
                                <th>Usuário</th>
                                <th>E-mail</th>
                                <th>Perfil</th>
                                <th>Status</th>
                                <th>Criado em</th>
                                <th style={{ textAlign: 'right' }}>Ações</th>
                            </tr>
                            </thead>
                            <tbody>
                            {usuariosFiltrados.map((u) => (
                                <tr key={u.id} className={!u.ativo ? 'row-inativo' : ''}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-table-avatar">
                                                {u.nome.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="user-table-meta">
                                                <span className="user-table-name">{u.nome}</span>
                                                <span className="user-table-username">@{u.username}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={`badge-role ${getRoleBadgeClass(u.tipoUsuario)}`}>
                                            {u.tipoUsuario}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge-status ${u.ativo ? 'ativo' : 'inativo'}`}>
                                            <span className="dot"/>
                                            {u.ativo ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td>{formatarData(u.dataCriacao)}</td>
                                    <td>
                                        <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                                            <button
                                                className="btn-action"
                                                onClick={() => abrirModalEditar(u)}
                                                title="Editar dados cadastrais"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                     strokeLinejoin="round">
                                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                                    <path d="m15 5 4 4"/>
                                                </svg>
                                            </button>

                                            <button
                                                className="btn-action btn-key"
                                                onClick={() => abrirModalSenha(u)}
                                                title="Redefinir senha de acesso"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                     strokeLinejoin="round">
                                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                                </svg>
                                            </button>

                                            {u.ativo ? (
                                                <button
                                                    className="btn-action btn-deactivate"
                                                    onClick={() => abrirModalStatus(u)}
                                                    title="Desativar usuário"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                                         fill="none"
                                                         stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                         strokeLinejoin="round">
                                                        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
                                                        <line x1="12" y1="2" x2="12" y2="12"/>
                                                    </svg>
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn-action btn-activate"
                                                    onClick={() => abrirModalStatus(u)}
                                                    title="Reativar usuário"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                                         fill="none"
                                                         stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                         strokeLinejoin="round">
                                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                                        <polyline points="22 4 12 14.01 9 11.01"/>
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

            {/* Modal: Criar Usuário */}
            {modalCriarAberto && (
                <div className="modal-overlay" onClick={() => setModalCriarAberto(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Adicionar Novo Usuário</h2>
                            <button className="btn-close-modal" onClick={() => setModalCriarAberto(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleCriar} className="modal-form">
                            {erroModal && <div className="modal-error">{erroModal}</div>}

                            <div className="form-group">
                                <label>Nome Completo *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: João da Silva"
                                    value={formCriar.nome}
                                    onChange={(e) => setFormCriar({ ...formCriar, nome: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Nome de Usuário (Username / Login) *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: jsilva"
                                    value={formCriar.username}
                                    onChange={(e) => setFormCriar({ ...formCriar, username: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>E-mail *</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="Ex: joao.silva@senaigo.com.br"
                                    value={formCriar.email}
                                    onChange={(e) => setFormCriar({ ...formCriar, email: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Perfil de Acesso *</label>
                                <select
                                    value={formCriar.tipoUsuario}
                                    onChange={(e) => setFormCriar({
                                        ...formCriar,
                                        tipoUsuario: e.target.value as TipoUsuario
                                    })}
                                >
                                    {TIPOS_USUARIO.map((tipo) => (
                                        <option key={tipo} value={tipo}>{tipo}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Senha Inicial (mín. 8 caracteres) *</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Digite a senha temporária"
                                    value={formCriar.senha}
                                    onChange={(e) => setFormCriar({ ...formCriar, senha: e.target.value })}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancelar"
                                        onClick={() => setModalCriarAberto(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-salvar" disabled={salvando}>
                                    {salvando ? (
                                        <>
                                            <span className="spinner"/>
                                            <span>Cadastrando...</span>
                                        </>
                                    ) : (
                                        'Adicionar Usuário'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Editar Usuário */}
            {modalEditarAberto && usuarioSelecionado && (
                <div className="modal-overlay" onClick={() => setModalEditarAberto(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Editar Usuário: @{usuarioSelecionado.username}</h2>
                            <button className="btn-close-modal" onClick={() => setModalEditarAberto(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleEditar} className="modal-form">
                            {erroModal && <div className="modal-error">{erroModal}</div>}

                            <div className="form-group">
                                <label>Nome Completo *</label>
                                <input
                                    type="text"
                                    required
                                    value={formEditar.nome}
                                    onChange={(e) => setFormEditar({ ...formEditar, nome: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Nome de Usuário (Username) *</label>
                                <input
                                    type="text"
                                    required
                                    value={formEditar.username}
                                    onChange={(e) => setFormEditar({ ...formEditar, username: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>E-mail *</label>
                                <input
                                    type="email"
                                    required
                                    value={formEditar.email}
                                    onChange={(e) => setFormEditar({ ...formEditar, email: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Perfil de Acesso *</label>
                                <select
                                    value={formEditar.tipoUsuario}
                                    onChange={(e) => setFormEditar({
                                        ...formEditar,
                                        tipoUsuario: e.target.value as TipoUsuario
                                    })}
                                >
                                    {TIPOS_USUARIO.map((tipo) => (
                                        <option key={tipo} value={tipo}>{tipo}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancelar"
                                        onClick={() => setModalEditarAberto(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-salvar" disabled={salvando}>
                                    {salvando ? (
                                        <>
                                            <span className="spinner"/>
                                            <span>Salvando...</span>
                                        </>
                                    ) : (
                                        'Salvar Alterações'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Redefinir Senha */}
            {modalSenhaAberto && usuarioSelecionado && (
                <div className="modal-overlay" onClick={() => setModalSenhaAberto(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Redefinir Senha de {usuarioSelecionado.nome}</h2>
                            <button className="btn-close-modal" onClick={() => setModalSenhaAberto(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleRedefinirSenha} className="modal-form">
                            {erroModal && <div className="modal-error">{erroModal}</div>}

                            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                                Você está definindo uma nova senha para a
                                conta <strong>@{usuarioSelecionado.username}</strong>.
                            </p>

                            <div className="form-group">
                                <label>Nova Senha (mín. 8 caracteres) *</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Digite a nova senha"
                                    value={formSenha.novaSenha}
                                    onChange={(e) => setFormSenha({ ...formSenha, novaSenha: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Confirmar Nova Senha *</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Repita a nova senha"
                                    value={formSenha.confirmarSenha}
                                    onChange={(e) => setFormSenha({ ...formSenha, confirmarSenha: e.target.value })}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancelar"
                                        onClick={() => setModalSenhaAberto(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-salvar" disabled={salvando}>
                                    {salvando ? (
                                        <>
                                            <span className="spinner"/>
                                            <span>Redefinindo...</span>
                                        </>
                                    ) : (
                                        'Redefinir Senha'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Confirmar Desativação / Reativação */}
            {modalStatusAberto && usuarioSelecionado && (
                <div className="modal-overlay" onClick={() => setModalStatusAberto(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{usuarioSelecionado.ativo ? 'Desativar Usuário' : 'Reativar Usuário'}</h2>
                            <button className="btn-close-modal" onClick={() => setModalStatusAberto(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        <div className="modal-form">
                            {erroModal && <div className="modal-error">{erroModal}</div>}

                            <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.5' }}>
                                {usuarioSelecionado.ativo ? (
                                    <>
                                        Deseja realmente desativar o acesso do
                                        usuário <strong>{usuarioSelecionado.nome}</strong> (<code>@{usuarioSelecionado.username}</code>)?
                                        Ele perderá temporariamente a permissão de acessar o sistema.
                                    </>
                                ) : (
                                    <>
                                        Deseja reativar o acesso do usuário <strong>{usuarioSelecionado.nome}</strong> (<code>@{usuarioSelecionado.username}</code>)?
                                        O usuário voltará a ter acesso normal ao sistema.
                                    </>
                                )}
                            </p>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancelar"
                                        onClick={() => setModalStatusAberto(false)}>
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className={`btn-salvar ${usuarioSelecionado.ativo ? 'btn-danger' : 'btn-success'}`}
                                    onClick={handleAlternarStatus}
                                    disabled={salvando}
                                >
                                    {salvando ? (
                                        <>
                                            <span className="spinner"/>
                                            <span>Processando...</span>
                                        </>
                                    ) : (
                                        usuarioSelecionado.ativo ? 'Confirmar Desativação' : 'Confirmar Reativação'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
