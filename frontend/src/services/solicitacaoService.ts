import { request } from './request';
import { Solicitacao, StatusSolicitacao, AtualizarStatusPayload } from '../types/solicitacao';
import { ApiError } from '../types/api';

/**
 * Envia uma solicitação pública de orçamento com múltiplos arquivos técnicos via multipart/form-data.
 */
export async function enviarSolicitacaoPublica(formData: FormData): Promise<Solicitacao> {
    try {
        const response = await fetch('/api/solicitacoes', {
            method: 'POST',
            body: formData,
            // Importante: NÃO setar Content-Type aqui para o browser gerar o boundary multipart automaticamente
        });

        if (!response.ok) {
            let data: any = null;
            let message = 'Não foi possível enviar a solicitação. Tente novamente.';
            try {
                data = await response.json();
                if (data?.erro) message = data.erro;
                else if (data?.mensagem) message = data.mensagem;
            } catch {
                // Corpo não era JSON
            }
            throw new ApiError(message, response.status, data);
        }

        return await response.json();
    } catch (err) {
        if (err instanceof ApiError) throw err;
        throw new ApiError('Falha ao conectar com o servidor. Verifique sua conexão.', 0);
    }
}

/**
 * Lista todas as solicitações (com filtro opcional por status) na área interna.
 */
export async function listarSolicitacoes(status?: StatusSolicitacao): Promise<Solicitacao[]> {
    const url = status && status !== ('TODOS' as any)
        ? `/api/solicitacoes?status=${encodeURIComponent(status)}`
        : '/api/solicitacoes';
    return request<Solicitacao[]>(url);
}

/**
 * Busca os detalhes de uma solicitação por ID.
 */
export async function buscarSolicitacaoPorId(id: number): Promise<Solicitacao> {
    return request<Solicitacao>(`/api/solicitacoes/${id}`);
}

/**
 * Atualiza o status e anotações internas da solicitação.
 */
export async function atualizarStatusSolicitacao(
    id: number,
    payload: AtualizarStatusPayload
): Promise<Solicitacao> {
    return request<Solicitacao>(`/api/solicitacoes/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
}

/**
 * Baixa um arquivo técnico anexado à solicitação.
 */
export async function baixarArquivoSolicitacao(
    solicitacaoId: number,
    arquivoId: number,
    nomeOriginal: string
): Promise<void> {
    try {
        const response = await fetch(`/api/solicitacoes/${solicitacaoId}/arquivos/${arquivoId}/download`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new ApiError('Erro ao baixar o arquivo solicitado.', response.status);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomeOriginal;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (err) {
        if (err instanceof ApiError) throw err;
        throw new ApiError('Falha ao realizar download do arquivo.', 0);
    }
}

/**
 * Exclui permanentemente uma solicitação e seus arquivos (Admin).
 */
export async function excluirSolicitacao(id: number): Promise<void> {
    return request<void>(`/api/solicitacoes/${id}`, {
        method: 'DELETE',
    });
}
