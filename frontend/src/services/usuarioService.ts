import { request } from './request';
import { Usuario, CriarUsuarioPayload, AtualizarUsuarioPayload } from '../types/usuario';

export async function listarUsuarios(): Promise<Usuario[]> {
    return request<Usuario[]>('/api/usuarios');
}

export async function buscarUsuario(id: number): Promise<Usuario> {
    return request<Usuario>(`/api/usuarios/${id}`);
}

export async function criarUsuario(payload: CriarUsuarioPayload): Promise<Usuario> {
    return request<Usuario>('/api/usuarios', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function atualizarUsuario(id: number, payload: AtualizarUsuarioPayload): Promise<Usuario> {
    return request<Usuario>(`/api/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}

export async function redefinirSenha(id: number, novaSenha: string): Promise<void> {
    await request<void>(`/api/usuarios/${id}/senha`, {
        method: 'PUT',
        body: JSON.stringify({ novaSenha }),
    });
}

export async function desativarUsuario(id: number): Promise<void> {
    await request<void>(`/api/usuarios/${id}`, { method: 'DELETE' });
}