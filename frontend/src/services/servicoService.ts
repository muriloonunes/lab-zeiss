import { request } from './request';
import type {
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

import { isModoDemoAtivo, obterServicosMockComoRegistros } from './mockDataService';

export async function listarServicos(status?: StatusServico): Promise<RegistroServico[]> {
    const url = status ? `/api/servicos?status=${status}` : '/api/servicos';
    let servicosReais: RegistroServico[] = [];
    try {
        servicosReais = await request<RegistroServico[]>(url);
    } catch (err) {
        console.warn('Erro ao carregar serviços da API:', err);
    }

    if (!isModoDemoAtivo()) {
        return servicosReais;
    }

    // Modo demonstração: unifica os casos mockados
    const mocks = obterServicosMockComoRegistros();
    const mocksFiltrados = status ? mocks.filter((m) => m.status === status) : mocks;

    const idsReais = new Set(servicosReais.map((s) => s.id));
    const codigosReais = new Set(servicosReais.map((s) => s.codigo));
    const mocksNaoDuplicados = mocksFiltrados.filter(
        (m) => !idsReais.has(m.id) && !codigosReais.has(m.codigo)
    );

    return [...servicosReais, ...mocksNaoDuplicados];
}

export async function obterServicoPorId(id: number): Promise<RegistroServico> {
    if (isModoDemoAtivo() && id >= 900) {
        const mock = obterServicosMockComoRegistros().find((m) => m.id === id);
        if (mock) return mock;
    }
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
