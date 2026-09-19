export interface ClasseVocabulario {
    id: number;
    nome: string;
    ativo: boolean;
    classeBase: boolean;
}

export interface TermoVocabulario {
    id: number;
    descricao: string;
    ativo: boolean;
    classeId: number;
}

export interface CriarClassePayload {
    nome: string;
}

export interface AtualizarClassePayload {
    nome: string;
}

export interface CriarTermoPayload {
    descricao: string;
}

export interface AtualizarTermoPayload {
    descricao: string;
}
