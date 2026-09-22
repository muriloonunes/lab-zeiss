import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificacoesPopover } from '../Notificacoes/NotificacoesPopover';
import './InternalLayout.scss';

export const InternalLayout: React.FC = () => {
    const { usuario, logout, isAdmin } = useAuth();
    const [sidebarAberta, setSidebarAberta] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        navigate('/login', { replace: true, state: { from: { pathname: '/interno' } } });
        await logout();
    };

    const fecharSidebar = () => {
        setSidebarAberta(false);
    };

    const getIniciais = (nome?: string) => {
        if (!nome) return 'U';
        const partes = nome.trim().split(' ');
        if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
        return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
    };

    const getRoleClass = (tipo?: string) => {
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

    const getPageTitle = () => {
        if (location.pathname === '/interno/servicos') return 'Ordens de Serviço';
        if (location.pathname === '/interno/solicitacoes') return 'Solicitações de Orçamento';
        if (location.pathname === '/interno/usuarios') return 'Gerenciamento de Usuários';
        if (location.pathname === '/interno/vocabulario') return 'Vocabulário Controlado';
        if (location.pathname === '/interno/perfil') return 'Meu Perfil & Segurança';
        return 'Visão Geral';
    };

    const isRootInterno = location.pathname === '/interno';

    return (
        <div className="internal-app">
            {/* Backdrop para mobile */}
            <div
                className={`sidebar-backdrop ${sidebarAberta ? 'open' : ''}`}
                onClick={fecharSidebar}
                aria-hidden="true"
            />

            <aside className={`internal-sidebar ${sidebarAberta ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-branding">
                        <div className="brand-logos">
                            <img
                                src="/images/cem-logo.png"
                                alt="CEM"
                                className="sidebar-logo-cem"
                            />
                        </div>
                    </div>
                    <button
                        className="close-sidebar-btn"
                        onClick={fecharSidebar}
                        aria-label="Fechar menu lateral"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <div className="sidebar-user-card">
                    <div className="user-info-row">
                        <div className="user-avatar" title={usuario?.nome || 'Usuário'}>
                            {getIniciais(usuario?.nome)}
                        </div>
                        <div className="user-details">
                            <span className="user-name" title={usuario?.nome}>{usuario?.nome || 'Usuário'}</span>
                            <span className="user-handle" title={`@${usuario?.username}`}>@{usuario?.username}</span>
                        </div>
                    </div>
                    <div className={`role-badge ${getRoleClass(usuario?.tipo)}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                        <span>{usuario?.tipo || 'CONSULTA'}</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <span className="nav-section-title">Menu Principal</span>

                    <NavLink
                        to="/interno"
                        end
                        onClick={fecharSidebar}
                        className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-link-content">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="7" height="9" x="3" y="3" rx="1"/>
                                <rect width="7" height="5" x="14" y="3" rx="1"/>
                                <rect width="7" height="9" x="14" y="12" rx="1"/>
                                <rect width="7" height="5" x="3" y="16" rx="1"/>
                            </svg>
                            <span>Visão Geral</span>
                        </div>
                    </NavLink>

                    <NavLink
                        to="/interno/servicos"
                        onClick={fecharSidebar}
                        className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-link-content">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                            </svg>
                            <span>Ordens de Serviço</span>
                        </div>
                    </NavLink>

                    <NavLink
                        to="/interno/solicitacoes"
                        onClick={fecharSidebar}
                        className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-link-content">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10 9 9 9 8 9"/>
                            </svg>
                            <span>Solicitações</span>
                        </div>
                    </NavLink>

                    <NavLink
                        to="/interno/vocabulario"
                        onClick={fecharSidebar}
                        className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-link-content">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                                <path d="M6 6h10"/>
                                <path d="M6 10h10"/>
                            </svg>
                            <span>Vocabulário</span>
                        </div>
                    </NavLink>

                    {isAdmin && (
                        <NavLink
                            to="/interno/usuarios"
                            onClick={fecharSidebar}
                            className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
                        >
                            <div className="nav-link-content">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                                <span>Gerenciar Usuários</span>
                            </div>
                        </NavLink>
                    )}

                    <NavLink
                        to="/interno/perfil"
                        onClick={fecharSidebar}
                        className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-link-content">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            <span>Meu Perfil & Senha</span>
                        </div>
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <Link to="/home" className="footer-action-btn" title="Voltar ao portal institucional público">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="2" y1="12" x2="22" y2="12"/>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                        <span>Portal Público</span>
                    </Link>

                    <button onClick={handleLogout} className="footer-action-btn logout-btn" title="Encerrar sessão de acesso">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        <span>Sair da Conta</span>
                    </button>
                </div>
            </aside>

            <div className="internal-main">
                <header className="internal-topbar">
                    <div className="topbar-left">
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setSidebarAberta(true)}
                            aria-label="Abrir menu lateral"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                 strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"/>
                                <line x1="3" y1="6" x2="21" y2="6"/>
                                <line x1="3" y1="18" x2="21" y2="18"/>
                            </svg>
                        </button>
                        <div className="breadcrumb">
                            {isRootInterno ? (
                                <span className="breadcrumb-current">Área Interna</span>
                            ) : (
                                <>
                                    <Link to="/interno" className="breadcrumb-link" title="Voltar para Área Interna">
                                        Área Interna
                                    </Link>
                                    <span className="breadcrumb-dot" />
                                    <span className="breadcrumb-current">{getPageTitle()}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="topbar-right">
                        <NotificacoesPopover />
                    </div>
                </header>

                <main className="internal-page-container">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
