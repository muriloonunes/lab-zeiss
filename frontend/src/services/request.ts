import {ApiError, ErroApi} from '../types/api';

const MENSAGENS_PADRAO: Record<number, string> = {
    400: 'Dados inválidos.',
    401: 'Sessão expirada ou credenciais inválidas.',
    403: 'Acesso não autorizado para o seu perfil.',
    404: 'Recurso não encontrado.',
    409: 'Conflito com dados já existentes.',
    500: 'Erro interno do servidor.',
};

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    let response: Response;

    try {
        response = await fetch(endpoint, {
            ...options,
            credentials: 'include',
            headers: {
                ...(options.body ? {'Content-Type': 'application/json'} : {}),
                ...(options.headers || {}),
            },
        });
    } catch {
        // falha de rede / servidor fora do ar
        throw new ApiError('Sem conexão com o servidor.', 0);
    }

    // 204: sucesso sem corpo (login, logout, alterações de senha)
    if (response.status === 204) return null as T;

    // 401 fora dos fluxos com validação de senha própria = sessão expirou — avisa o app inteiro
    const isValidationEndpoint = endpoint.includes('/api/auth/') || endpoint.includes('/api/usuarios/me/senha');
    if (response.status === 401 && !isValidationEndpoint) {
        window.dispatchEvent(new Event('sessao-expirada'));
    }

    if (!response.ok) {
        let data: ErroApi | null = null;
        let message = MENSAGENS_PADRAO[response.status] || 'Erro ao processar requisição.';

        try {
            data = await response.json();
            if (data?.erro) message = data.erro;
            else if (data?.erros) message = 'Verifique os campos informados.';
        } catch {
            // corpo não era JSON — usa a mensagem padrão do status
        }

        throw new ApiError(message, response.status, data);
    }

    const contentType = response.headers.get('content-type');
    return contentType?.includes('application/json')
        ? response.json()
        : (response.text() as T);
}
