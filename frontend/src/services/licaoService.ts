import { request } from './request';
import {
    RegistroServico,
    ReenviarLicaoPayload,
    DevolverLicaoPayload,
} from '../types/servico';

export async function reenviarLicao(
    servicoId: number,
    payload: ReenviarLicaoPayload
): Promise<RegistroServico> {
    return request<RegistroServico>(`/api/servicos/${servicoId}/aprendizado/reenviar`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}

export async function aprovarLicao(servicoId: number): Promise<RegistroServico> {
    return request<RegistroServico>(`/api/servicos/${servicoId}/aprendizado/aprovar`, {
        method: 'PATCH',
    });
}

export async function devolverLicao(
    servicoId: number,
    payload: DevolverLicaoPayload
): Promise<RegistroServico> {
    return request<RegistroServico>(`/api/servicos/${servicoId}/aprendizado/devolver`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
}
