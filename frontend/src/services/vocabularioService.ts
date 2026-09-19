import { request } from './request';
import {
    ClasseVocabulario,
    TermoVocabulario,
    CriarClassePayload,
    AtualizarClassePayload,
    CriarTermoPayload,
    AtualizarTermoPayload,
} from '../types/vocabulario';

export async function listarClasses(apenasAtivas = true): Promise<ClasseVocabulario[]> {
    return request<ClasseVocabulario[]>(`/api/vocabulario/classes?apenasAtivas=${apenasAtivas}`);
}

export async function obterClassePorId(id: number): Promise<ClasseVocabulario> {
    return request<ClasseVocabulario>(`/api/vocabulario/classes/${id}`);
}

export async function listarTermosPorClasse(classeId: number, apenasAtivos = true): Promise<TermoVocabulario[]> {
    return request<TermoVocabulario[]>(`/api/vocabulario/classes/${classeId}/termos?apenasAtivos=${apenasAtivos}`);
}

export async function criarClasse(payload: CriarClassePayload): Promise<ClasseVocabulario> {
    return request<ClasseVocabulario>('/api/vocabulario/classes', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function atualizarNomeClasse(id: number, payload: AtualizarClassePayload): Promise<ClasseVocabulario> {
    return request<ClasseVocabulario>(`/api/vocabulario/classes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}

export async function alternarStatusClasse(id: number, ativo: boolean): Promise<void> {
    await request<void>(`/api/vocabulario/classes/${id}/status?ativo=${ativo}`, {
        method: 'PATCH',
    });
}

export async function criarTermo(classeId: number, payload: CriarTermoPayload): Promise<TermoVocabulario> {
    return request<TermoVocabulario>(`/api/vocabulario/termos/classe/${classeId}`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function atualizarTermo(id: number, payload: AtualizarTermoPayload): Promise<TermoVocabulario> {
    return request<TermoVocabulario>(`/api/vocabulario/termos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}

export async function alternarStatusTermo(id: number, ativo: boolean): Promise<void> {
    await request<void>(`/api/vocabulario/termos/${id}/status?ativo=${ativo}`, {
        method: 'PATCH',
    });
}
