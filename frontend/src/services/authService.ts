import {request} from './request';
import {Sessao} from '../types/api';

export async function login(login: string, senha: string): Promise<void> {
    await request<void>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({login, senha}),
    });
}

export async function me(): Promise<Sessao> {
    return request<Sessao>('/api/auth/me');
}

export async function logout(): Promise<void> {
    await request<void>('/api/auth/logout', {method: 'POST'});
}

export async function alterarSenhaPropria(senhaAtual: string, novaSenha: string): Promise<void> {
    await request<void>('/api/usuarios/me/senha', {
        method: 'PUT',
        body: JSON.stringify({senhaAtual, novaSenha}),
    });
}