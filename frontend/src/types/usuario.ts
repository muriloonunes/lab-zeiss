export const TIPOS_USUARIO = ['CONSULTA', 'TECNICO', 'VALIDADOR', 'ADMINISTRADOR'] as const;
export type TipoUsuario = typeof TIPOS_USUARIO[number];

export interface Usuario {
    id: number;
    nome: string;
    username: string;
    email: string;
    tipoUsuario: TipoUsuario;
    ativo: boolean;
    dataCriacao: string;
}

export interface CriarUsuarioPayload {
    nome: string;
    username: string;
    email: string;
    senha: string;
    tipoUsuario: TipoUsuario;
}

export interface AtualizarUsuarioPayload {
    nome: string;
    username: string;
    email: string;
    tipoUsuario: TipoUsuario;
}