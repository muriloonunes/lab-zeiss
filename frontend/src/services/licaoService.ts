import { request } from './request';
import type {
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

import {
    isModoDemoAtivo,
    obterServicosMockComoRegistros,
    marcarMockLicaoSuperada,
    reativarMockLicao,
} from './mockDataService';

export async function listarBaseConhecimento(
    filtros?: FiltrosBaseConhecimento
): Promise<RegistroServico[]> {
    const params = new URLSearchParams();
    if (filtros?.status) params.append('status', filtros.status);
    if (filtros?.termoId) params.append('termoId', filtros.termoId.toString());
    if (filtros?.busca) params.append('busca', filtros.busca);

    const query = params.toString();
    const url = query ? `/api/licoes?${query}` : '/api/licoes';
    let licoesReais: RegistroServico[] = [];
    try {
        licoesReais = await request<RegistroServico[]>(url);
    } catch (err) {
        console.warn('Erro ao carregar lições da API:', err);
    }

    if (!isModoDemoAtivo()) {
        return licoesReais;
    }

    // Modo demonstração: unifica as lições aprendidas mockadas
    let mocks = obterServicosMockComoRegistros().filter(
        (m) => m.blocoAprendizado && m.blocoAprendizado.licaoAprendida
    );

    if (filtros?.status) {
        mocks = mocks.filter((m) => m.blocoAprendizado?.statusLicao === filtros.status);
    }

    if (filtros?.termoId) {
        const tId = filtros.termoId;
        mocks = mocks.filter((m) => {
            const orc = m.blocoOrcamento;
            const apr = m.blocoAprendizado;
            if (orc?.tipoServico?.id === tId) return true;
            if (orc?.recurso?.id === tId) return true;
            if (orc?.caracteristicasPeca?.some((c) => c.id === tId)) return true;
            if (apr?.causaDesvio?.id === tId) return true;
            if (apr?.assuntosRelacionados?.some((a) => a.id === tId)) return true;
            return false;
        });
    }

    if (filtros?.busca) {
        const buscaNorm = filtros.busca.toLowerCase().trim();
        mocks = mocks.filter((m) => {
            const cod = (m.codigo || '').toLowerCase();
            const lic = (m.blocoAprendizado?.licaoAprendida || '').toLowerCase();
            const causa = (m.blocoAprendizado?.causaDesvio?.descricao || '').toLowerCase();
            const tipo = (m.blocoOrcamento?.tipoServico?.descricao || '').toLowerCase();
            return (
                cod.includes(buscaNorm) ||
                lic.includes(buscaNorm) ||
                causa.includes(buscaNorm) ||
                tipo.includes(buscaNorm)
            );
        });
    }

    const idsReais = new Set(licoesReais.map((l) => l.id));
    const codigosReais = new Set(licoesReais.map((l) => l.codigo));
    const mocksNaoDuplicados = mocks.filter(
        (m) => !idsReais.has(m.id) && !codigosReais.has(m.codigo)
    );

    return [...licoesReais, ...mocksNaoDuplicados];
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
    payload: DevolverLicaoPayload | string
): Promise<RegistroServico> {
    const body: DevolverLicaoPayload =
        typeof payload === 'string' ? { motivoRejeicao: payload } : payload;

    return request<RegistroServico>(`/api/licoes/${servicoId}/devolver`, {
        method: 'PATCH',
        body: JSON.stringify(body),
    });
}

export async function marcarComoSuperada(servicoId: number): Promise<RegistroServico> {
    if (servicoId >= 900) {
        marcarMockLicaoSuperada(servicoId);
        const mock = obterServicosMockComoRegistros().find((m) => m.id === servicoId);
        if (mock) return mock;
    }
    return request<RegistroServico>(`/api/licoes/${servicoId}/superar`, {
        method: 'PATCH',
    });
}

export async function reativarLicao(servicoId: number): Promise<RegistroServico> {
    if (servicoId >= 900) {
        reativarMockLicao(servicoId);
        const mock = obterServicosMockComoRegistros().find((m) => m.id === servicoId);
        if (mock) return mock;
    }
    return request<RegistroServico>(`/api/licoes/${servicoId}/reativar`, {
        method: 'PATCH',
    });
}
