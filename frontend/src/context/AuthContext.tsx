import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Sessao } from '../types/api';
import { login as apiLogin, logout as apiLogout, me as apiMe } from '../services/authService';

interface AuthContextType {
    usuario: Sessao | null;
    carregando: boolean;
    autenticado: boolean;
    isAdmin: boolean;
    login: (login: string, senha: string) => Promise<void>;
    logout: () => Promise<void>;
    recarregarSessao: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [usuario, setUsuario] = useState<Sessao | null>(null);
    const [carregando, setCarregando] = useState<boolean>(true);

    const recarregarSessao = useCallback(async () => {
        try {
            const dadosSessao = await apiMe();
            setUsuario(dadosSessao);
        } catch {
            setUsuario(null);
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        recarregarSessao();

        // Ouvir expiração de sessão disparada por request.ts
        const handleSessaoExpirada = () => {
            setUsuario(null);
        };

        window.addEventListener('sessao-expirada', handleSessaoExpirada);
        return () => {
            window.removeEventListener('sessao-expirada', handleSessaoExpirada);
        };
    }, [recarregarSessao]);

    const handleLogin = async (loginStr: string, senhaStr: string): Promise<void> => {
        await apiLogin(loginStr, senhaStr);
        const dadosSessao = await apiMe();
        setUsuario(dadosSessao);
    };

    const handleLogout = async (): Promise<void> => {
        try {
            await apiLogout();
        } finally {
            setUsuario(null);
        }
    };

    const value: AuthContextType = {
        usuario,
        carregando,
        autenticado: !!usuario,
        isAdmin: usuario?.tipo === 'ADMINISTRADOR',
        login: handleLogin,
        logout: handleLogout,
        recarregarSessao,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
    }
    return context;
}
