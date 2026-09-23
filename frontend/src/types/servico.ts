import { TermoVocabulario } from './vocabulario';

export type StatusServico = 'ORCADO' | 'EM_EXECUCAO' | 'CONCLUIDO' | 'CANCELADO';
export type StatusLicao = 'RASCUNHO' | 'EM_VALIDACAO' | 'FORMALIZADA' | 'SUPERADA';

export const STATUS_SERVICO_LABELS: Record<StatusServico, string> = {
    ORCADO: 'Orçado',
    EM_EXECUCAO: 'Em Execução',
    CONCLUIDO: 'Concluído',
    CANCELADO: 'Cancelado',
};

export const STATUS_LICAO_LABELS: Record<StatusLicao, string> = {
    RASCUNHO: 'Rascunho / Devolvida',
    EM_VALIDACAO: 'Em Validação',
    FORMALIZADA: 'Formalizada',
    SUPERADA: 'Superada',
};

export interface UsuarioResumo {
    id: number;
    nome: string;
    username: string;
    email: string;
}

export interface BlocoOrcamento {
    tipoServico: TermoVocabulario;
    caracteristicasPeca: TermoVocabulario[];
    recurso: TermoVocabulario;
    horasEstimadas: number;
    custoEstimado: number;
    valorProposto: number;
    responsavelEstimativa: UsuarioResumo;
    premissasAssumidas?: string;
    justificativaDesvioAssistente?: string;
}

export interface BlocoRealizado {
    horasRealizadas?: number;
    custoReal?: number;
    valorFaturado?: number;
    dataRealEntrega?: string;
    houveRetrabalho?: boolean;
    houveMudancaEscopo?: boolean;
}

export interface BlocoAprendizado {
    causaDesvio?: TermoVocabulario;
    licaoAprendida?: string;
    assuntosRelacionados?: TermoVocabulario[];
    statusLicao?: StatusLicao;
    restrito?: boolean;
    motivoRejeicao?: string;
}

export interface RegistroServico {
    id: number;
    codigo: string;
    status: StatusServico;
    motivoCancelamento?: string;
    dataCriacao: string;
    dataAtualizacao?: string;
    blocoOrcamento: BlocoOrcamento;
    blocoRealizado?: BlocoRealizado;
    blocoAprendizado?: BlocoAprendizado;
}

export interface CriarServicoPayload {
    codigo: string;
    tipoServicoId: number;
    recursoId: number;
    caracteristicasPecaIds: number[];
    horasEstimadas: number;
    custoEstimado: number;
    valorProposto: number;
    premissasAssumidas?: string;
    justificativaDesvioAssistente?: string;
}

export interface CancelarServicoPayload {
    motivoCancelamento: string;
}

export interface FinalizarServicoPayload {
    horasRealizadas: number;
    custoReal: number;
    valorFaturado: number;
    dataRealEntrega?: string;
    houveRetrabalho?: boolean;
    houveMudancaEscopo?: boolean;
    causaDesvioId: number;
    licaoAprendida: string;
    assuntosRelacionadosIds?: number[];
    restrito?: boolean;
}

export interface ReenviarLicaoPayload {
    causaDesvioId: number;
    licaoAprendida: string;
    assuntosRelacionadosIds?: number[];
    restrito: boolean;
}

export interface DevolverLicaoPayload {
    motivoRejeicao: string;
}
