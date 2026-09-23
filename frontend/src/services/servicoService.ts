import { request } from './request';
import {
    RegistroServico,
    CriarServicoPayload,
    FinalizarServicoPayload,
    StatusServico,
} from '../types/servico';

export {
    aprovarLicao,
    devolverLicao,
    reenviarLicao,
    marcarComoSuperada,
    reativarLicao,
    listarBaseConhecimento,
    listarPendentesValidacao,
    contarPendentesValidacao,
} from './licaoService';

export async function listarServicos(status?: StatusServico): Promise<RegistroServico[]> {
    const url = status ? `/api/servicos?status=${status}` : '/api/servicos';
    return request<RegistroServico[]>(url);
}

export async function obterServicoPorId(id: number): Promise<RegistroServico> {
    return request<RegistroServico>(`/api/servicos/${id}`);
}

export async function criarServico(payload: CriarServicoPayload): Promise<RegistroServico> {
    return request<RegistroServico>('/api/servicos', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function iniciarExecucaoServico(id: number): Promise<RegistroServico> {
    return request<RegistroServico>(`/api/servicos/${id}/iniciar`, {
        method: 'PATCH',
    });
}

export async function cancelarServico(id: number, motivoCancelamento: string): Promise<RegistroServico> {
    return request<RegistroServico>(`/api/servicos/${id}/cancelar`, {
        method: 'PATCH',
        body: JSON.stringify({ motivoCancelamento }),
    });
}

export async function salvarRascunhoServico(
    id: number,
    payload: FinalizarServicoPayload
): Promise<RegistroServico> {
    return request<RegistroServico>(`/api/servicos/${id}/rascunho`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
}

export async function concluirServico(
    id: number,
    payload: FinalizarServicoPayload
): Promise<RegistroServico> {
    return request<RegistroServico>(`/api/servicos/${id}/concluir`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}
