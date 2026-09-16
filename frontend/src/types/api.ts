export interface Sessao {
    tipo: string;      // 'CONSULTA' | 'TECNICO' | 'VALIDADOR' | 'ADMINISTRADOR'
    nome: string;
    username: string;
    email: string;
}

export interface ErroApi {
    erro?: string;
    erros?: { campo: string; mensagem: string }[];
}

export class ApiError extends Error {
    status: number;
    data: ErroApi | null;

    constructor(message: string, status: number, data: ErroApi | null = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }

    get errosDeCampo(): { campo: string; mensagem: string }[] | null {
        return this.data?.erros ?? null;
    }
}