export type StatusSolicitacao = 'PENDENTE' | 'REGISTRADA' | 'IGNORADA';

export const STATUS_SOLICITACAO_LABELS: Record<StatusSolicitacao, string> = {
    PENDENTE: 'Pendente',
    REGISTRADA: 'Registrada',
    IGNORADA: 'Ignorada',
};

export const SERVICOS_LABELS: Record<string, string> = {
    'cmm': 'Medição por Coordenadas (CMM)',
    'rugosidade': 'Rugosimetria & Perfilometria',
    'tomografia': 'Tomografia Computadorizada Industrial',
    'digitalizacao-3d': 'Digitalização 3D & Engenharia Reversa',
    'calibracao': 'Calibração de Instrumentos',
    'treinamento': 'Consultoria & Treinamento Técnico',
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
