import { request } from './request';

export async function listarMinhasAssinaturas(): Promise<number[]> {
    return request<number[]>('/api/assinaturas/minhas');
}

export async function assinarTermo(termoId: number): Promise<void> {
    await request<void>(`/api/assinaturas/termos/${termoId}`, {
        method: 'POST',
    });
}

export async function desassinarTermo(termoId: number): Promise<void> {
    await request<void>(`/api/assinaturas/termos/${termoId}`, {
        method: 'DELETE',
    });
}
