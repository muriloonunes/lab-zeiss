import React, {useEffect, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {login, me} from '../../services/authService';
import {ApiError} from '../../types/api';
import {useScrollToTop} from '../../hooks/useScrollToTop';
import './Login.scss';

export function Login() {
    useScrollToTop();
    const navigate = useNavigate();
    const location = useLocation();

    const [verificandoSessao, setVerificandoSessao] = useState(true);
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/interno';

    useEffect(() => {
        let ativo = true;

        me()
            .then(() => {
                if (ativo) {
                    navigate(from, {replace: true});
                }
            })
            .catch(() => {
                if (ativo) {
                    setVerificandoSessao(false);
                }
            });

        return () => {
            ativo = false;
        };
    }, [navigate, from]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErro(null);

        if (!usuario.trim() || !senha.trim()) {
            setErro('Preencha todos os campos.');
            return;
        }

        setCarregando(true);

        try {
            await login(usuario.trim(), senha);
            navigate(from, {replace: true});
        } catch (err: unknown) {
            if (err instanceof ApiError) {
                setErro(err.message || 'Usuário ou senha incorretos.');
            } else {
                setErro('Erro ao conectar com o servidor. Tente novamente.');
            }
        } finally {
            setCarregando(false);
        }
    };

    if (verificandoSessao) {
        return (
            <div className="login-page">
                <div className="login-card" style={{alignItems: 'center', justifyContent: 'center', minHeight: '300px'}}>
                    <div className="login-logos">
                        <img
                            src="/images/cem-logo.png"
                            alt="Centro de Excelência em Metrologia SENAI ZEISS"
                            className="logo-cem"
                        />
                        <span className="logo-divider" aria-hidden="true"/>
                        <img
                            src="/images/zeiss-logo-coop.png"
                            alt="Cooperação Tecnológica ZEISS"
                            className="logo-zeiss"
                        />
                    </div>
                    <div style={{marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem'}}>
                        <span className="spinner" style={{
                            width: '24px',
                            height: '24px',
                            border: '3px solid #e2e8f0',
                            borderTopColor: '#002060',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                        }}/>
                        <span style={{fontSize: '0.9rem', color: '#64748b'}}>Verificando autenticação...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logos">
                    <img
                        src="/images/cem-logo.png"
                        alt="Centro de Excelência em Metrologia SENAI ZEISS"
                        className="logo-cem"
                    />
                    <span className="logo-divider" aria-hidden="true"/>
                    <img
                        src="/images/zeiss-logo-coop.png"
                        alt="Cooperação Tecnológica ZEISS"
                        className="logo-zeiss"
                    />
                </div>

                <div className="login-header">
                    <h1 className="login-title">Área Interna</h1>
                </div>

                {erro && (
                    <div className="login-error" role="alert">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span>{erro}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form" noValidate>
                    <div className="form-group">
                        <label htmlFor="usuario">Usuário ou E-mail</label>
                        <input
                            id="usuario"
                            type="text"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            placeholder="Digite seu usuário ou e-mail"
                            disabled={carregando}
                            autoFocus
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="senha">Senha</label>
                        <div className="password-wrapper">
                            <input
                                id="senha"
                                type={mostrarSenha ? 'text' : 'password'}
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                placeholder="Digite sua senha"
                                disabled={carregando}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-btn"
                                onClick={() => setMostrarSenha(!mostrarSenha)}
                                title={mostrarSenha ? 'Ocultar senha' : 'Ver senha'}
                                tabIndex={-1}
                            >
                                {mostrarSenha ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                         strokeLinejoin="round">
                                        <path
                                            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                         strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={carregando}>
                        {carregando ? (
                            <>
                                <span className="spinner"/>
                                <span>Entrando...</span>
                            </>
                        ) : (
                            'Entrar'
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <Link to="/home" className="back-link">
                        &larr; Voltar para o site
                    </Link>
                </div>
            </div>
        </div>
    );
}
