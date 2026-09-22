import { request } from './request';
import { Notificacao, ContagemNaoLidasResponse } from '../types/notificacao';

/**
 * Lista todas as notificações do usuário autenticado.
 */
export async function listarNotificacoes(): Promise<Notificacao[]> {
    return request<Notificacao[]>('/api/notificacoes');
}

/**
 * Obtém a contagem de notificações não lidas.
 */
export async function contarNotificacoesNaoLidas(): Promise<ContagemNaoLidasResponse> {
    return request<ContagemNaoLidasResponse>('/api/notificacoes/nao-lidas/contagem');
}

/**
 * Marca uma notificação específica como lida.
 */
export async function marcarNotificacaoComoLida(id: number): Promise<Notificacao> {
    return request<Notificacao>(`/api/notificacoes/${id}/ler`, {
        method: 'PATCH',
    });
}

/**
 * Marca todas as notificações do usuário como lidas.
 */
export async function marcarTodasNotificacoesComoLidas(): Promise<void> {
    return request<void>('/api/notificacoes/ler-todas', {
        method: 'PATCH',
    });
}

/**
 * Exclui uma notificação específica.
 */
export async function excluirNotificacao(id: number): Promise<void> {
    return request<void>(`/api/notificacoes/${id}`, {
        method: 'DELETE',
    });
}
