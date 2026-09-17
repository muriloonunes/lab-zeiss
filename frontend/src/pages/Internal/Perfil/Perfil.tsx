import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { alterarSenhaPropria } from '../../../services/authService';
import { ApiError } from '../../../types/api';
import './Perfil.scss';

export const Perfil: React.FC = () => {
    const { usuario } = useAuth();

    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');

    const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
    const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [sucesso, setSucesso] = useState<string | null>(null);

    const handleSubmitSenha = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro(null);
        setSucesso(null);

        if (!senhaAtual) {
            setErro('Por favor, informe sua senha atual.');
            return;
        }

        if (novaSenha.length < 8) {
            setErro('A nova senha deve possuir no mínimo 8 caracteres.');
            return;
        }

        if (novaSenha !== confirmarNovaSenha) {
            setErro('A confirmação da nova senha não confere.');
            return;
        }

        if (senhaAtual === novaSenha) {
            setErro('A nova senha deve ser diferente da senha atual.');
            return;
        }

        setCarregando(true);

        try {
            await alterarSenhaPropria(senhaAtual, novaSenha);
            setSucesso('Sua senha foi alterada com sucesso!');
            setSenhaAtual('');
            setNovaSenha('');
            setConfirmarNovaSenha('');
        } catch (err: unknown) {
            if (err instanceof ApiError) {
                if (err.status === 401 || err.message?.toLowerCase().includes('inválid')) {
                    setErro('A senha atual informada está incorreta.');
                } else {
                    setErro(err.message || 'Erro ao alterar a senha.');
                }
            } else {
                setErro('Erro de comunicação com o servidor.');
            }
        } finally {
            setCarregando(false);
        }
    };

    const getIniciais = (nome?: string) => {
        if (!nome) return 'U';
        const partes = nome.trim().split(' ');
        if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
        return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
    };

    return (
        <div className="perfil-page">
            <div className="perfil-header">
                <h1>Meu Perfil & Segurança</h1>
                <p>Consulte seus dados cadastrais e gerencie sua credencial de acesso ao sistema.</p>
            </div>

            <div className="perfil-grid">
                {/* Card de Informações do Usuário */}
                <div className="perfil-card">
                    <div className="card-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span>Informações da Conta</span>
                    </div>

                    <div className="perfil-avatar-wrapper">
                        <div className="perfil-avatar-big">
                            {getIniciais(usuario?.nome)}
                        </div>
                        <div className="perfil-main-data">
                            <h2>{usuario?.nome}</h2>
                            <span className="user-tag">@{usuario?.username}</span>
                        </div>
                    </div>

                    <div className="info-list">
                        <div className="info-row">
                            <label>Nome Completo</label>
                            <span>{usuario?.nome}</span>
                        </div>
                        <div className="info-row">
                            <label>Nome de Usuário (Login)</label>
                            <span>{usuario?.username}</span>
                        </div>
                        <div className="info-row">
                            <label>E-mail Cadastrado</label>
                            <span>{usuario?.email}</span>
                        </div>
                        <div className="info-row">
                            <label>Perfil de Acesso</label>
                            <span>{usuario?.tipo}</span>
                        </div>
                    </div>
                </div>

                {/* Card de Alteração de Senha */}
                <div className="perfil-card">
                    <div className="card-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        <span>Alterar Senha Pessoal</span>
                    </div>

                    <form onSubmit={handleSubmitSenha} className="form-senha" noValidate>
                        {erro && (
                            <div className="feedback-msg error" role="alert">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="8" x2="12" y2="12"/>
                                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                <span>{erro}</span>
                            </div>
                        )}

                        {sucesso && (
                            <div className="feedback-msg success" role="status">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                                <span>{sucesso}</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="senhaAtual">Senha Atual</label>
                            <div className="input-wrapper">
                                <input
                                    id="senhaAtual"
                                    type={mostrarSenhaAtual ? 'text' : 'password'}
                                    value={senhaAtual}
                                    onChange={(e) => setSenhaAtual(e.target.value)}
                                    placeholder="Digite sua senha atual"
                                    disabled={carregando}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-btn"
                                    onClick={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
                                    title={mostrarSenhaAtual ? 'Ocultar senha' : 'Ver senha'}
                                    tabIndex={-1}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        {mostrarSenhaAtual ? (
                                            <>
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                                <line x1="1" y1="1" x2="23" y2="23"/>
                                            </>
                                        ) : (
                                            <>
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </>
                                        )}
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="novaSenha">Nova Senha</label>
                            <div className="input-wrapper">
                                <input
                                    id="novaSenha"
                                    type={mostrarNovaSenha ? 'text' : 'password'}
                                    value={novaSenha}
                                    onChange={(e) => setNovaSenha(e.target.value)}
                                    placeholder="Digite a nova senha (mín. 8 caracteres)"
                                    disabled={carregando}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-btn"
                                    onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                                    title={mostrarNovaSenha ? 'Ocultar senha' : 'Ver senha'}
                                    tabIndex={-1}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        {mostrarNovaSenha ? (
                                            <>
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                                <line x1="1" y1="1" x2="23" y2="23"/>
                                            </>
                                        ) : (
                                            <>
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </>
                                        )}
                                    </svg>
                                </button>
                            </div>
                            <span className="input-hint">A senha deve conter no mínimo 8 caracteres.</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmarNovaSenha">Confirmar Nova Senha</label>
                            <div className="input-wrapper">
                                <input
                                    id="confirmarNovaSenha"
                                    type={mostrarConfirmar ? 'text' : 'password'}
                                    value={confirmarNovaSenha}
                                    onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                                    placeholder="Repita a nova senha"
                                    disabled={carregando}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-btn"
                                    onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                                    title={mostrarConfirmar ? 'Ocultar senha' : 'Ver senha'}
                                    tabIndex={-1}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        {mostrarConfirmar ? (
                                            <>
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                                <line x1="1" y1="1" x2="23" y2="23"/>
                                            </>
                                        ) : (
                                            <>
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </>
                                        )}
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="submit-btn" disabled={carregando}>
                            {carregando ? (
                                <>
                                    <span className="spinner" />
                                    <span>Salvando Nova Senha...</span>
                                </>
                            ) : (
                                'Atualizar Minha Senha'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
