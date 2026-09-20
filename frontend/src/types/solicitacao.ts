export type StatusSolicitacao = 'PENDENTE' | 'RESPONDIDA' | 'IGNORADA';

export const STATUS_SOLICITACAO_LABELS: Record<StatusSolicitacao, string> = {
    PENDENTE: 'Pendente',
    RESPONDIDA: 'Registrada / Respondida',
    IGNORADA: 'Ignorada',
};

export interface ArquivoSolicitacao {
    id: number;
    nomeOriginal: string;
    tipoMime?: string;
    tamanhoBytes: number;
    dataCriacao: string;
}

export interface Solicitacao {
    id: number;
    codigo: string;
    nome: string;
    empresa: string;
    email: string;
    telefone: string;
    servico: string;
    quantidadePecas?: string;
    mensagem?: string;
    status: StatusSolicitacao;
    observacoesInternas?: string;
    dataCriacao: string;
    dataAtualizacao?: string;
    arquivos: ArquivoSolicitacao[];
}

export interface AtualizarStatusPayload {
    status: StatusSolicitacao;
    observacoesInternas?: string;
}
