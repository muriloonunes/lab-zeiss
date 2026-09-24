/**
 * Serviço de Mock para Estatísticas e Assistente de Orçamento (Laboratório SENAI/ZEISS)
 * 
 * Simula os cálculos de inteligência histórica e estatísticas enquanto o backend
 * finaliza os módulos matemáticos definitivos.
 */

export type NivelConfianca = 'SEM_HISTORICO' | 'BAIXA' | 'MEDIA' | 'ALTA';

export interface CasoBase {
    id: number;
    codigoOS: string;
    tipoServico?: string;
    horasEstimadas: number;
    horasRealizadas: number;
    desvioPercentual: number;
    valorFaturado: number;
    dataConclusao: string;
    observacao?: string;
}

export interface RecomendacaoOrcamento {
    quantidadeCasos: number;
    nivelConfianca: NivelConfianca;
    medianaHoras: number;
    quartil1: number;
    quartil3: number;
    fatorCorrecao: number; // Ex: 1.15 representa +15% de esforço observado
    mensagemOrientacao: string;
    casosBase: CasoBase[];
}

export interface IndicadoresDashboard {
    indiceAssertividade: number; // Em %, ex: 82.4
    desvioMedioEsforco: number; // Em %, ex: 12.8 (positivo = levou mais tempo)
    margemOrcadaVsRealizada: number; // Em %, ex: 28.5
    totalOSConcluidas: number;
    licoesFormalizadas: number;
    mediaHorasPorOS: number;
}

export interface HistoricoMensalHoras {
    mes: string;
    horasOrcadas: number;
    horasRealizadas: number;
}

export interface CausaDesvioFrequente {
    causa: string;
    quantidade: number;
    percentual: number;
    cor: string;
}

export interface DadosDashboard {
    indicadores: IndicadoresDashboard;
    historicoMensal: HistoricoMensalHoras[];
    causasFrequentes: CausaDesvioFrequente[];
}

const CASOS_MOCK_COMPLETOS: CasoBase[] = [
    { id: 101, codigoOS: 'OS-2025-012', horasEstimadas: 16, horasRealizadas: 18.5, desvioPercentual: 15.6, valorFaturado: 3800, dataConclusao: '2025-11-10', observacao: 'Geometria complexa exigiu fixações auxiliares' },
    { id: 102, codigoOS: 'OS-2025-019', horasEstimadas: 20, horasRealizadas: 23.0, desvioPercentual: 15.0, valorFaturado: 4500, dataConclusao: '2025-11-24', observacao: 'Calibração prévia do apalpador necessária' },
    { id: 103, codigoOS: 'OS-2025-027', horasEstimadas: 14, horasRealizadas: 16.0, desvioPercentual: 14.3, valorFaturado: 3200, dataConclusao: '2025-12-05', observacao: 'Variação térmica no laboratório durante medição longa' },
    { id: 104, codigoOS: 'OS-2025-034', horasEstimadas: 18, horasRealizadas: 21.0, desvioPercentual: 16.7, valorFaturado: 4100, dataConclusao: '2025-12-18', observacao: 'Rugosidade superficial gerou incerteza nos pontos de contato' },
    { id: 105, codigoOS: 'OS-2026-003', horasEstimadas: 22, horasRealizadas: 25.5, desvioPercentual: 15.9, valorFaturado: 5100, dataConclusao: '2026-01-12', observacao: 'Setup complexo na placa magnética' },
    { id: 106, codigoOS: 'OS-2026-008', horasEstimadas: 15, horasRealizadas: 17.5, desvioPercentual: 16.7, valorFaturado: 3500, dataConclusao: '2026-01-20', observacao: 'Alinhamento por 3 planos em peça flexível' },
    { id: 107, codigoOS: 'OS-2026-015', horasEstimadas: 16, horasRealizadas: 18.0, desvioPercentual: 12.5, valorFaturado: 3700, dataConclusao: '2026-02-02', observacao: 'Rotina de medição automatizada CNC' },
    { id: 108, codigoOS: 'OS-2026-021', horasEstimadas: 19, horasRealizadas: 22.0, desvioPercentual: 15.8, valorFaturado: 4400, dataConclusao: '2026-02-14', observacao: 'Necessário criar ponta especial estrela' },
    { id: 109, codigoOS: 'OS-2026-029', horasEstimadas: 17, horasRealizadas: 19.5, desvioPercentual: 14.7, valorFaturado: 3950, dataConclusao: '2026-02-28', observacao: 'Desvio de forma em superfície livre' },
    { id: 110, codigoOS: 'OS-2026-033', horasEstimadas: 24, horasRealizadas: 28.0, desvioPercentual: 16.7, valorFaturado: 5600, dataConclusao: '2026-03-05', observacao: 'Peça de grande porte exigiu reposicionamento' },
    { id: 111, codigoOS: 'OS-2026-039', horasEstimadas: 16, horasRealizadas: 18.5, desvioPercentual: 15.6, valorFaturado: 3850, dataConclusao: '2026-03-12', observacao: 'Ajuste de filtros gaussianos no software ZEISS Calypso' },
    { id: 112, codigoOS: 'OS-2026-042', horasEstimadas: 18, horasRealizadas: 20.5, desvioPercentual: 13.9, valorFaturado: 4200, dataConclusao: '2026-03-20', observacao: 'Inspeção de tolerâncias geométricas GD&T' },
    { id: 113, codigoOS: 'OS-2026-048', horasEstimadas: 15, horasRealizadas: 17.0, desvioPercentual: 13.3, valorFaturado: 3600, dataConclusao: '2026-04-02', observacao: 'Padronização de fixador rápido' },
    { id: 114, codigoOS: 'OS-2026-053', horasEstimadas: 20, horasRealizadas: 23.5, desvioPercentual: 17.5, valorFaturado: 4800, dataConclusao: '2026-04-15', observacao: 'Revisão de malha CAD x Malha escaneada' },
    { id: 115, codigoOS: 'OS-2026-059', horasEstimadas: 17, horasRealizadas: 19.0, desvioPercentual: 11.8, valorFaturado: 3900, dataConclusao: '2026-05-03', observacao: 'Medição por apalpação contínua (scanning)' },
    { id: 116, codigoOS: 'OS-2026-064', horasEstimadas: 21, horasRealizadas: 24.0, desvioPercentual: 14.3, valorFaturado: 4950, dataConclusao: '2026-05-18', observacao: 'Validação de repetibilidade e reprodutibilidade R&R' },
    { id: 117, codigoOS: 'OS-2026-071', horasEstimadas: 16, horasRealizadas: 18.5, desvioPercentual: 15.6, valorFaturado: 3800, dataConclusao: '2026-06-01', observacao: 'Controle de temperatura do bloco padrão' },
    { id: 118, codigoOS: 'OS-2026-077', horasEstimadas: 18, horasRealizadas: 21.0, desvioPercentual: 16.7, valorFaturado: 4300, dataConclusao: '2026-06-15', observacao: 'Dificuldade de acesso ótico em canal interno' },
    { id: 119, codigoOS: 'OS-2026-083', horasEstimadas: 22, horasRealizadas: 25.0, desvioPercentual: 13.6, valorFaturado: 5200, dataConclusao: '2026-07-02', observacao: 'Calibração de padrão escalonado' },
    { id: 120, codigoOS: 'OS-2026-089', horasEstimadas: 19, horasRealizadas: 22.0, desvioPercentual: 15.8, valorFaturado: 4600, dataConclusao: '2026-07-20', observacao: 'Programação de ciclo automático parametrizado' },
];

/**
 * Retorna a recomendação histórica com base no Tipo de Serviço e Características selecionadas.
 * 
 * Regras de Demonstração Inteligente:
 * - Se nenhum tipo for selecionado ou características vazias: retorna 0 casos (Sem histórico).
 * - Se selecionada 1 característica: retorna 3 casos (Confiança Baixa: 1 a 4 casos).
 * - Se selecionadas 2 características: retorna 8 casos (Confiança Média: 5 a 14 casos).
 * - Se selecionadas 3 ou mais características: retorna 20 casos (Confiança Alta: 15+ casos, com Fator de Correção).
 */
export async function obterRecomendacaoOrcamento(
    tipoServicoId: number | '',
    caracteristicasIds: number[]
): Promise<RecomendacaoOrcamento> {
    // Simula uma pequena latência realista de cálculo assíncrono
    await new Promise(resolve => setTimeout(resolve, 200));

    if (!tipoServicoId || caracteristicasIds.length === 0) {
        return {
            quantidadeCasos: 0,
            nivelConfianca: 'SEM_HISTORICO',
            medianaHoras: 0,
            quartil1: 0,
            quartil3: 0,
            fatorCorrecao: 1.0,
            mensagemOrientacao: 'Sem histórico formalizado suficiente para esta combinação. Siga o roteiro técnico padrão.',
            casosBase: []
        };
    }

    const qtd = caracteristicasIds.length;

    // Cenário 1: 1 a 4 casos (Confiança Baixa)
    if (qtd === 1) {
        const casos = CASOS_MOCK_COMPLETOS.slice(0, 3);
        return {
            quantidadeCasos: 3,
            nivelConfianca: 'BAIXA',
            medianaHoras: 18.5, // Mantido internamente, mas na UI de Baixa Confiança não exibe faixas
            quartil1: 16.0,
            quartil3: 21.0,
            fatorCorrecao: 1.0,
            mensagemOrientacao: 'Amostragem histórica reduzida (3 casos). Avalie os casos individualmente abaixo antes de fixar o orçamento.',
            casosBase: casos
        };
    }

    // Cenário 2: 5 a 14 casos (Confiança Média)
    if (qtd === 2) {
        const casos = CASOS_MOCK_COMPLETOS.slice(0, 8);
        return {
            quantidadeCasos: 8,
            nivelConfianca: 'MEDIA',
            medianaHoras: 19.5,
            quartil1: 17.5,
            quartil3: 22.5,
            fatorCorrecao: 1.08,
            mensagemOrientacao: 'Histórico consistente (8 casos). A faixa de esforço mais provável situa-se entre 17.5h e 22.5h.',
            casosBase: casos
        };
    }

    // Cenário 3: 15+ casos (Confiança Alta com Fator de Correção)
    const casos = CASOS_MOCK_COMPLETOS;
    return {
        quantidadeCasos: 20,
        nivelConfianca: 'ALTA',
        medianaHoras: 20.0,
        quartil1: 18.0,
        quartil3: 23.5,
        fatorCorrecao: 1.15, // +15% de desvio observado recorrente
        mensagemOrientacao: 'Alta confiabilidade estatística (20 casos). Alerta: serviços similares apresentam tendência de +15% de esforço real versus estimativa inicial.',
        casosBase: casos
    };
}

/**
 * Retorna os indicadores e dados para o Dashboard gerencial (/interno).
 */
export async function obterDadosDashboard(): Promise<DadosDashboard> {
    await new Promise(resolve => setTimeout(resolve, 250));

    return {
        indicadores: {
            indiceAssertividade: 84.5, // 84.5% das OSs dentro da margem esperada
            desvioMedioEsforco: 13.2, // +13.2% média de tempo adicional
            margemOrcadaVsRealizada: 29.4, // Margem média de lucro/contribuição realizada
            totalOSConcluidas: 148,
            licoesFormalizadas: 52,
            mediaHorasPorOS: 18.7
        },
        historicoMensal: [
            { mes: 'Out/25', horasOrcadas: 240, horasRealizadas: 275 },
            { mes: 'Nov/25', horasOrcadas: 310, horasRealizadas: 352 },
            { mes: 'Dez/25', horasOrcadas: 280, horasRealizadas: 315 },
            { mes: 'Jan/26', horasOrcadas: 360, horasRealizadas: 405 },
            { mes: 'Fev/26', horasOrcadas: 410, horasRealizadas: 462 },
            { mes: 'Mar/26', horasOrcadas: 390, horasRealizadas: 438 }
        ],
        causasFrequentes: [
            { causa: 'Complexidade de Fixação da Peça', quantidade: 24, percentual: 38.5, cor: '#3b82f6' },
            { causa: 'Variação Térmica / Estabilização', quantidade: 16, percentual: 25.6, cor: '#6366f1' },
            { causa: 'Mudança de Escopo do Cliente', quantidade: 11, percentual: 17.6, cor: '#f59e0b' },
            { causa: 'Incerteza em Rugosidade / Ponta', quantidade: 7, percentual: 11.2, cor: '#10b981' },
            { causa: 'Outras Ocorrências Operacionais', quantidade: 4, percentual: 7.1, cor: '#94a3b8' }
        ]
    };
}
