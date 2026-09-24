import { isModoDemoAtivo, setModoDemoAtivo } from './mockDataService';

export interface ConfiguracoesSistema {
    valorHoraLaboratorio: number; // R$/hora, ex: 250.00
    toleranciaAssertividade: number; // %, ex: 15 (usado no Dashboard)
    sensibilidadeDesvioAssistente: number; // %, ex: 15 (limiar para exigir justificativa)
    usarDadosMock: boolean; // Modo demo centralizado
}

const CONFIG_STORAGE_KEY = 'zeiss_configuracoes_sistema';

export const CONFIGURACOES_PADRAO: ConfiguracoesSistema = {
    valorHoraLaboratorio: 250.00,
    toleranciaAssertividade: 15,
    sensibilidadeDesvioAssistente: 15,
    usarDadosMock: true
};

/**
 * Retorna as configurações do sistema salvas ou os padrões institucionais.
 */
export function obterConfiguracoes(): ConfiguracoesSistema {
    try {
        const salvo = localStorage.getItem(CONFIG_STORAGE_KEY);
        const demoAtivo = isModoDemoAtivo();

        if (!salvo) {
            return {
                ...CONFIGURACOES_PADRAO,
                usarDadosMock: demoAtivo
            };
        }

        const parseado = JSON.parse(salvo);
        return {
            valorHoraLaboratorio: Number(parseado.valorHoraLaboratorio) || CONFIGURACOES_PADRAO.valorHoraLaboratorio,
            toleranciaAssertividade: Number(parseado.toleranciaAssertividade) || CONFIGURACOES_PADRAO.toleranciaAssertividade,
            sensibilidadeDesvioAssistente: Number(parseado.sensibilidadeDesvioAssistente) || CONFIGURACOES_PADRAO.sensibilidadeDesvioAssistente,
            usarDadosMock: demoAtivo
        };
    } catch {
        return {
            ...CONFIGURACOES_PADRAO,
            usarDadosMock: isModoDemoAtivo()
        };
    }
}

/**
 * Salva as configurações no localStorage e dispara evento de sincronização global.
 */
export function salvarConfiguracoes(novasConfiguracoes: Partial<ConfiguracoesSistema>): ConfiguracoesSistema {
    const atuais = obterConfiguracoes();

    if (novasConfiguracoes.usarDadosMock !== undefined && novasConfiguracoes.usarDadosMock !== atuais.usarDadosMock) {
        setModoDemoAtivo(novasConfiguracoes.usarDadosMock);
    }

    const atualizadas: ConfiguracoesSistema = {
        valorHoraLaboratorio: novasConfiguracoes.valorHoraLaboratorio !== undefined
            ? Number(novasConfiguracoes.valorHoraLaboratorio)
            : atuais.valorHoraLaboratorio,
        toleranciaAssertividade: novasConfiguracoes.toleranciaAssertividade !== undefined
            ? Number(novasConfiguracoes.toleranciaAssertividade)
            : atuais.toleranciaAssertividade,
        sensibilidadeDesvioAssistente: novasConfiguracoes.sensibilidadeDesvioAssistente !== undefined
            ? Number(novasConfiguracoes.sensibilidadeDesvioAssistente)
            : atuais.sensibilidadeDesvioAssistente,
        usarDadosMock: novasConfiguracoes.usarDadosMock !== undefined
            ? Boolean(novasConfiguracoes.usarDadosMock)
            : isModoDemoAtivo()
    };

    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(atualizadas));
    window.dispatchEvent(new CustomEvent('zeiss-configuracoes-alteradas', { detail: atualizadas }));

    return atualizadas;
}

/**
 * Redefine todos os parâmetros para os valores padrão de fábrica da ZEISS.
 */
export function redefinirConfiguracoesPadrao(): ConfiguracoesSistema {
    return salvarConfiguracoes(CONFIGURACOES_PADRAO);
}
