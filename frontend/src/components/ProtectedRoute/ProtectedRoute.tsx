import React from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ProtectedRoute.scss';

interface ProtectedRouteProps {
    roles?: string[];
    children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles, children }) => {
    const { usuario, carregando, autenticado } = useAuth();
    const location = useLocation();

    if (carregando) {
        return (
            <div className="auth-loading-screen">
                <div className="loading-card">
                    <div className="loading-logos">
                        <img
                            src="/images/cem-logo.png"
                            alt="CEM SENAI ZEISS"
                            className="logo-cem"
                        />
                        <span className="logo-divider" aria-hidden="true" />
                        <img
                            src="/images/zeiss-logo-coop.png"
                            alt="ZEISS"
                            className="logo-zeiss"
                        />
                    </div>
                    <div className="loading-indicator">
                        <span className="spinner" />
                        <span>Validando permissões de acesso...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!autenticado || !usuario) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && roles.length > 0 && !roles.includes(usuario.tipo)) {
        return (
            <div className="acesso-negado-container">
                <div className="acesso-negado-card">
                    <div className="icon-lock">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                    </div>
                    <h2>Acesso Restrito</h2>
                    <p>
                        Seu perfil atual (<strong>{usuario.tipo}</strong>) não possui privilégios administrativos
                        para acessar este módulo.
                    </p>
                    <Link to="/interno" className="btn-voltar">
                        &larr; Voltar para a Visão Geral
                    </Link>
                </div>
            </div>
        );
    }

    return children ? <>{children}</> : <Outlet />;
};
