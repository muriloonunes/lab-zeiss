export interface Notificacao {
    id: number;
    usuarioId: number;
    titulo: string;
    mensagem: string;
    lida: boolean;
    dataCriacao: string;
}

export interface ContagemNaoLidasResponse {
    totalNaoLidas: number;
}
