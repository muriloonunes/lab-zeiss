import { request } from './request';
import {
    RegistroServico,
    ReenviarLicaoPayload,
    DevolverLicaoPayload,
    StatusLicao,
} from '../types/servico';

export interface FiltrosBaseConhecimento {
    status?: StatusLicao;
    termoId?: number;
    busca?: string;
}

export interface ContagemPendentesResponse {
    totalPendentes: number;
}

export async function listarBaseConhecimento(
    filtros?: FiltrosBaseConhecimento
): Promise<RegistroServico[]> {
    const params = new URLSearchParams();
    if (filtros?.status) params.append('status', filtros.status);
    if (filtros?.termoId) params.append('termoId', filtros.termoId.toString());
    if (filtros?.busca) params.append('busca', filtros.busca);

    const query = params.toString();
    const url = query ? `/api/licoes?${query}` : '/api/licoes';
    return request<RegistroServico[]>(url);
}

export async function listarPendentesValidacao(): Promise<RegistroServico[]> {
    return request<RegistroServico[]>('/api/licoes/validacao');
}

export async function contarPendentesValidacao(): Promise<ContagemPendentesResponse> {
    return request<ContagemPendentesResponse>('/api/licoes/validacao/contagem');
}

export async function reenviarLicao(
    servicoId: number,
    payload: ReenviarLicaoPayload
): Promise<RegistroServico> {
    return request<RegistroServico>(`/api/licoes/${servicoId}/reenviar`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}

export async function aprovarLicao(servicoId: number): Promise<RegistroServico> {
    return request<RegistroServico>(`/api/licoes/${servicoId}/aprovar`, {
        method: 'PATCH',
    });
}

export async function devolverLicao(
    servicoId: number,
    payload: DevolverLicaoPayload
): Promise<RegistroServico> {
    return request<RegistroServico>(`/api/licoes/${servicoId}/devolver`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
}

export async function marcarComoSuperada(servicoId: number): Promise<RegistroServico> {
    return request<RegistroServico>(`/api/licoes/${servicoId}/superar`, {
        method: 'PATCH',
    });
}

export async function reativarLicao(servicoId: number): Promise<RegistroServico> {
    return request<RegistroServico>(`/api/licoes/${servicoId}/reativar`, {
        method: 'PATCH',
    });
}
