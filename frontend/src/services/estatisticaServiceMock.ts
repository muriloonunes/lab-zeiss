import { listarServicos } from './servicoService';
import { RegistroServico } from '../types/servico';

export type NivelConfianca = 'SEM_HISTORICO' | 'BAIXA' | 'MEDIA' | 'ALTA';
export type OrigemCaso = 'REAL' | 'MOCK';

export interface CasoBase {
    id: number;
    codigoOS: string;
    origem: OrigemCaso;
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
    quantidadeCasosReais: number;
    quantidadeCasosMock: number;
    nivelConfianca: NivelConfianca;
    medianaHoras: number;
    quartil1: number;
    quartil3: number;
    fatorCorrecao: number; // Ex: 1.15 representa +15% de esforço observado
    mensagemOrientacao: string;
    casosBase: CasoBase[];
    usandoApenasDadosReais: boolean;
}

export interface IndicadoresDashboard {
    indiceAssertividade: number; // Em %, ex: 82.4
    desvioMedioEsforco: number; // Em %, ex: 12.8 (positivo = levou mais tempo)
    margemOrcadaVsRealizada: number; // Em %, ex: 28.5
    totalOSConcluidas: number;
    licoesFormalizadas: number;
    mediaHorasPorOS: number;
    totalOSReais: number;
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
    { id: 101, codigoOS: 'OS-2025-012', origem: 'MOCK', tipoServico: 'Medição por Coordenadas (CMM)', horasEstimadas: 16, horasRealizadas: 18.5, desvioPercentual: 15.6, valorFaturado: 3800, dataConclusao: '2025-11-10', observacao: 'Geometria complexa exigiu fixações auxiliares' },
    { id: 102, codigoOS: 'OS-2025-019', origem: 'MOCK', tipoServico: 'Medição por Coordenadas (CMM)', horasEstimadas: 20, horasRealizadas: 23.0, desvioPercentual: 15.0, valorFaturado: 4500, dataConclusao: '2025-11-24', observacao: 'Calibração prévia do apalpador necessária' },
    { id: 103, codigoOS: 'OS-2025-027', origem: 'MOCK', tipoServico: 'Digitalização Óptica 3D', horasEstimadas: 14, horasRealizadas: 16.0, desvioPercentual: 14.3, valorFaturado: 3200, dataConclusao: '2025-12-05', observacao: 'Variação térmica no laboratório durante medição longa' },
    { id: 104, codigoOS: 'OS-2025-034', origem: 'MOCK', tipoServico: 'Tomografia Computadorizada', horasEstimadas: 18, horasRealizadas: 21.0, desvioPercentual: 16.7, valorFaturado: 4100, dataConclusao: '2025-12-18', observacao: 'Rugosidade superficial gerou incerteza nos pontos de contato' },
    { id: 105, codigoOS: 'OS-2026-003', origem: 'MOCK', tipoServico: 'Medição por Coordenadas (CMM)', horasEstimadas: 22, horasRealizadas: 25.5, desvioPercentual: 15.9, valorFaturado: 5100, dataConclusao: '2026-01-12', observacao: 'Setup complexo na placa magnética' },
    { id: 106, codigoOS: 'OS-2026-008', origem: 'MOCK', tipoServico: 'Medição de Rugosidade e Forma', horasEstimadas: 15, horasRealizadas: 17.5, desvioPercentual: 16.7, valorFaturado: 3500, dataConclusao: '2026-01-20', observacao: 'Alinhamento por 3 planos em peça flexível' },
    { id: 107, codigoOS: 'OS-2026-015', origem: 'MOCK', tipoServico: 'Digitalização Óptica 3D', horasEstimadas: 16, horasRealizadas: 18.0, desvioPercentual: 12.5, valorFaturado: 3700, dataConclusao: '2026-02-02', observacao: 'Rotina de medição automatizada CNC' },
    { id: 108, codigoOS: 'OS-2026-021', origem: 'MOCK', tipoServico: 'Medição por Coordenadas (CMM)', horasEstimadas: 19, horasRealizadas: 22.0, desvioPercentual: 15.8, valorFaturado: 4400, dataConclusao: '2026-02-14', observacao: 'Necessário criar ponta especial estrela' },
    { id: 109, codigoOS: 'OS-2026-029', origem: 'MOCK', tipoServico: 'Tomografia Computadorizada', horasEstimadas: 17, horasRealizadas: 19.5, desvioPercentual: 14.7, valorFaturado: 3950, dataConclusao: '2026-02-28', observacao: 'Desvio de forma em superfície livre' },
    { id: 110, codigoOS: 'OS-2026-033', origem: 'MOCK', tipoServico: 'Medição por Coordenadas (CMM)', horasEstimadas: 24, horasRealizadas: 28.0, desvioPercentual: 16.7, valorFaturado: 5600, dataConclusao: '2026-03-05', observacao: 'Peça de grande porte exigiu reposicionamento' },
    { id: 111, codigoOS: 'OS-2026-039', origem: 'MOCK', tipoServico: 'Digitalização Óptica 3D', horasEstimadas: 16, horasRealizadas: 18.5, desvioPercentual: 15.6, valorFaturado: 3850, dataConclusao: '2026-03-12', observacao: 'Ajuste de filtros gaussianos no software ZEISS Calypso' },
    { id: 112, codigoOS: 'OS-2026-042', origem: 'MOCK', tipoServico: 'Medição por Coordenadas (CMM)', horasEstimadas: 18, horasRealizadas: 20.5, desvioPercentual: 13.9, valorFaturado: 4200, dataConclusao: '2026-03-20', observacao: 'Inspeção de tolerâncias geométricas GD&T' },
    { id: 113, codigoOS: 'OS-2026-048', origem: 'MOCK', tipoServico: 'Medição de Rugosidade e Forma', horasEstimadas: 15, horasRealizadas: 17.0, desvioPercentual: 13.3, valorFaturado: 3600, dataConclusao: '2026-04-02', observacao: 'Padronização de fixador rápido' },
    { id: 114, codigoOS: 'OS-2026-053', origem: 'MOCK', tipoServico: 'Digitalização Óptica 3D', horasEstimadas: 20, horasRealizadas: 23.5, desvioPercentual: 17.5, valorFaturado: 4800, dataConclusao: '2026-04-15', observacao: 'Revisão de malha CAD x Malha escaneada' },
    { id: 115, codigoOS: 'OS-2026-059', origem: 'MOCK', tipoServico: 'Medição por Coordenadas (CMM)', horasEstimadas: 17, horasRealizadas: 19.0, desvioPercentual: 11.8, valorFaturado: 3900, dataConclusao: '2026-05-03', observacao: 'Medição por apalpação contínua (scanning)' },
    { id: 116, codigoOS: 'OS-2026-064', origem: 'MOCK', tipoServico: 'Tomografia Computadorizada', horasEstimadas: 21, horasRealizadas: 24.0, desvioPercentual: 14.3, valorFaturado: 4950, dataConclusao: '2026-05-18', observacao: 'Validação de repetibilidade e reprodutibilidade R&R' },
    { id: 117, codigoOS: 'OS-2026-071', origem: 'MOCK', tipoServico: 'Medição por Coordenadas (CMM)', horasEstimadas: 16, horasRealizadas: 18.5, desvioPercentual: 15.6, valorFaturado: 3800, dataConclusao: '2026-06-01', observacao: 'Controle de temperatura do bloco padrão' },
    { id: 118, codigoOS: 'OS-2026-077', origem: 'MOCK', tipoServico: 'Digitalização Óptica 3D', horasEstimadas: 18, horasRealizadas: 21.0, desvioPercentual: 16.7, valorFaturado: 4300, dataConclusao: '2026-06-15', observacao: 'Dificuldade de acesso ótico em canal interno' },
    { id: 119, codigoOS: 'OS-2026-083', origem: 'MOCK', tipoServico: 'Tomografia Computadorizada', horasEstimadas: 22, horasRealizadas: 25.0, desvioPercentual: 13.6, valorFaturado: 5200, dataConclusao: '2026-07-02', observacao: 'Calibração de padrão escalonado' },
    { id: 120, codigoOS: 'OS-2026-089', origem: 'MOCK', tipoServico: 'Medição por Coordenadas (CMM)', horasEstimadas: 19, horasRealizadas: 22.0, desvioPercentual: 15.8, valorFaturado: 4600, dataConclusao: '2026-07-20', observacao: 'Programação de ciclo automático parametrizado' },
];

/**
 * Converte serviços concluídos do backend em instâncias de CasoBase
 */
function converterServicosReaisParaCasosBase(servicos: RegistroServico[]): CasoBase[] {
    return servicos.map(s => {
        const horasEst = Number(s.blocoOrcamento?.horasEstimadas || 0);
        const horasReal = Number(s.blocoRealizado?.horasRealizadas || horasEst);
        const desvio = horasEst > 0 ? Number((((horasReal - horasEst) / horasEst) * 100).toFixed(1)) : 0;
        
        let dataConclusao = '';
        if (s.blocoRealizado?.dataRealEntrega) {
            dataConclusao = s.blocoRealizado.dataRealEntrega.substring(0, 10);
        } else if (s.dataAtualizacao) {
            dataConclusao = s.dataAtualizacao.substring(0, 10);
        } else if (s.dataCriacao) {
            dataConclusao = s.dataCriacao.substring(0, 10);
        }

        const causa = s.blocoAprendizado?.causaDesvio?.termo;
        const licao = s.blocoAprendizado?.licaoAprendida;
        const observacao = licao ? (causa ? `${causa}: ${licao}` : licao) : (causa || 'Serviço concluído via banco de dados.');

        return {
            id: s.id,
            codigoOS: s.codigo,
            origem: 'REAL',
            tipoServico: s.blocoOrcamento?.tipoServico?.termo,
            horasEstimadas: horasEst,
            horasRealizadas: horasReal,
            desvioPercentual: desvio,
            valorFaturado: Number(s.blocoRealizado?.valorFaturado || s.blocoOrcamento?.valorProposto || 0),
            dataConclusao,
            observacao
        };
    });
}

/**
 * Calcula estatísticas descritivas (mediana, quartis, fator de correção) sobre um conjunto de casos
 */
function calcularEstatisticas(casos: CasoBase[], apenasReais: boolean): RecomendacaoOrcamento {
    const qtd = casos.length;
    const qtdReais = casos.filter(c => c.origem === 'REAL').length;
    const qtdMock = casos.filter(c => c.origem === 'MOCK').length;

    if (qtd === 0) {
        return {
            quantidadeCasos: 0,
            quantidadeCasosReais: 0,
            quantidadeCasosMock: 0,
            nivelConfianca: 'SEM_HISTORICO',
            medianaHoras: 0,
            quartil1: 0,
            quartil3: 0,
            fatorCorrecao: 1.0,
            mensagemOrientacao: apenasReais
                ? 'Nenhuma ordem de serviço real concluída encontrada no banco de dados para os critérios selecionados.'
                : 'Sem histórico formalizado suficiente para esta combinação. Siga o roteiro técnico padrão.',
            casosBase: [],
            usandoApenasDadosReais: apenasReais
        };
    }

    // Nível de confiança baseado no tamanho amostral
    let nivelConfianca: NivelConfianca = 'SEM_HISTORICO';
    if (qtd >= 1 && qtd <= 4) {
        nivelConfianca = 'BAIXA';
    } else if (qtd >= 5 && qtd <= 14) {
        nivelConfianca = 'MEDIA';
    } else {
        nivelConfianca = 'ALTA';
    }

    // Ordenação por horas realizadas
    const horasRealizadas = casos.map(c => c.horasRealizadas).sort((a, b) => a - b);
    
    // Mediana
    const meio = Math.floor(horasRealizadas.length / 2);
    const medianaHoras = horasRealizadas.length % 2 !== 0
        ? horasRealizadas[meio]
        : Number(((horasRealizadas[meio - 1] + horasRealizadas[meio]) / 2).toFixed(1));

    // Quartis Q1 e Q3
    const q1Idx = Math.floor(horasRealizadas.length * 0.25);
    const q3Idx = Math.min(horasRealizadas.length - 1, Math.floor(horasRealizadas.length * 0.75));
    const quartil1 = horasRealizadas[q1Idx];
    const quartil3 = horasRealizadas[q3Idx];

    // Fator de correção (Soma Horas Reais / Soma Horas Estimadas)
    const somaEstimadas = casos.reduce((acc, c) => acc + c.horasEstimadas, 0);
    const somaReais = casos.reduce((acc, c) => acc + c.horasRealizadas, 0);
    const fatorCorrecao = somaEstimadas > 0 ? Number((somaReais / somaEstimadas).toFixed(2)) : 1.0;

    let mensagemOrientacao = '';
    if (nivelConfianca === 'BAIXA') {
        mensagemOrientacao = `Amostragem histórica reduzida (${qtd} ${qtd === 1 ? 'caso' : 'casos'}). Avalie os casos individualmente abaixo antes de fixar o orçamento.`;
    } else if (nivelConfianca === 'MEDIA') {
        mensagemOrientacao = `Histórico consistente (${qtd} casos). A faixa de esforço mais provável situa-se entre ${quartil1.toFixed(1)}h e ${quartil3.toFixed(1)}h.`;
    } else {
        const percAdicional = Math.round((fatorCorrecao - 1) * 100);
        mensagemOrientacao = `Alta confiabilidade estatística (${qtd} casos). Alerta: serviços similares apresentam tendência de ${percAdicional >= 0 ? `+${percAdicional}%` : `${percAdicional}%`} de esforço real versus estimativa inicial.`;
    }

    return {
        quantidadeCasos: qtd,
        quantidadeCasosReais: qtdReais,
        quantidadeCasosMock: qtdMock,
        nivelConfianca,
        medianaHoras,
        quartil1,
        quartil3,
        fatorCorrecao,
        mensagemOrientacao,
        casosBase: casos,
        usandoApenasDadosReais: apenasReais
    };
}

/**
 * Retorna a recomendação histórica com base no Tipo de Serviço e Características selecionadas.
 * 
 * Lê serviços reais concluídos da API (backend) e opcionalmente combina com dados simulados
 * de demonstração.
 */
export async function obterRecomendacaoOrcamento(
    tipoServicoId: number | '',
    caracteristicasIds: number[],
    incluirMock: boolean = true
): Promise<RecomendacaoOrcamento> {
    // 1. Busca serviços concluídos reais do backend
    let servicosReais: RegistroServico[] = [];
    try {
        const todosServicos = await listarServicos('CONCLUIDO');
        servicosReais = (todosServicos || []).filter(s => {
            if (s.status !== 'CONCLUIDO') return false;
            if (!s.blocoRealizado?.horasRealizadas || s.blocoRealizado.horasRealizadas <= 0) return false;
            
            // Filtro por tipo de serviço (se informado)
            if (tipoServicoId && s.blocoOrcamento?.tipoServico?.id !== Number(tipoServicoId)) {
                return false;
            }

            // Filtro por características (se informadas, verifica interseção)
            if (caracteristicasIds.length > 0) {
                const pecaCaracs = s.blocoOrcamento?.caracteristicasPeca || [];
                const temIntersecao = pecaCaracs.some(c => caracteristicasIds.includes(c.id));
                return temIntersecao;
            }

            return true;
        });
    } catch (e) {
        console.warn('Não foi possível conectar à API de serviços reais para o assistente. Usando fallback.', e);
        servicosReais = [];
    }

    const casosReais = converterServicosReaisParaCasosBase(servicosReais);

    // Se o usuário desativou os dados mock (Modo 100% API Real)
    if (!incluirMock) {
        return calcularEstatisticas(casosReais, true);
    }

    // Modo Demonstração (com Mock):
    // Se não há filtro de tipo ou características, retorna sem histórico se também não há dados reais
    if (!tipoServicoId || caracteristicasIds.length === 0) {
        if (casosReais.length > 0) {
            return calcularEstatisticas(casosReais, false);
        }
        return {
            quantidadeCasos: 0,
            quantidadeCasosReais: 0,
            quantidadeCasosMock: 0,
            nivelConfianca: 'SEM_HISTORICO',
            medianaHoras: 0,
            quartil1: 0,
            quartil3: 0,
            fatorCorrecao: 1.0,
            mensagemOrientacao: 'Selecione o Tipo de Serviço e ao menos uma Característica para consultar o histórico.',
            casosBase: [],
            usandoApenasDadosReais: false
        };
    }

    // Mock graduado por quantidade de características selecionadas para simular faixas de confiança na demo
    const qtdCarac = caracteristicasIds.length;
    let mockSlice: CasoBase[] = [];

    if (qtdCarac === 1) {
        mockSlice = CASOS_MOCK_COMPLETOS.slice(0, 3);
    } else if (qtdCarac === 2) {
        mockSlice = CASOS_MOCK_COMPLETOS.slice(0, 8);
    } else {
        mockSlice = CASOS_MOCK_COMPLETOS;
    }

    // Casos reais têm prioridade no topo da lista
    const casosCombinados = [...casosReais, ...mockSlice];
    return calcularEstatisticas(casosCombinados, false);
}

/**
 * Retorna os indicadores e dados para o Dashboard gerencial (/interno).
 * Suporta modo 100% API Real e modo Demonstração (combinado).
 */
export async function obterDadosDashboard(incluirMock: boolean = true): Promise<DadosDashboard> {
    let servicosReais: RegistroServico[] = [];
    try {
        servicosReais = await listarServicos();
    } catch (e) {
        console.warn('Erro ao obter serviços para o dashboard:', e);
    }

    const concluidosReais = (servicosReais || []).filter(s => s.status === 'CONCLUIDO');
    const licoesFormalizadasReais = (servicosReais || []).filter(s => s.blocoAprendizado?.statusLicao === 'FORMALIZADA').length;
    const totalOSReais = concluidosReais.length;

    // Filtra serviços concluídos com horas apontadas
    const comHoras = concluidosReais.filter(s => 
        (s.blocoRealizado?.horasRealizadas || 0) > 0 && 
        (s.blocoOrcamento?.horasEstimadas || 0) > 0
    );

    // Contagem de causas de desvio reais
    const causasContagem: Record<string, number> = {};
    concluidosReais.forEach(s => {
        const termo = s.blocoAprendizado?.causaDesvio?.termo;
        if (termo) {
            causasContagem[termo] = (causasContagem[termo] || 0) + 1;
        }
    });

    // Se o usuário optou por 100% dados reais da API
    if (!incluirMock) {
        let somaDesvio = 0;
        let dentroMargem = 0;
        let somaHoras = 0;
        let somaFaturado = 0;
        let somaCustoReal = 0;

        comHoras.forEach(s => {
            const est = s.blocoOrcamento.horasEstimadas;
            const real = s.blocoRealizado!.horasRealizadas!;
            const diffPerc = ((real - est) / est) * 100;
            somaDesvio += diffPerc;
            somaHoras += real;
            if (Math.abs(diffPerc) <= 15) dentroMargem++;
            somaFaturado += s.blocoRealizado?.valorFaturado || s.blocoOrcamento.valorProposto || 0;
            somaCustoReal += s.blocoRealizado?.custoReal || s.blocoOrcamento.custoEstimado || 0;
        });

        const indiceAssertividade = comHoras.length > 0 ? Number(((dentroMargem / comHoras.length) * 100).toFixed(1)) : (totalOSReais > 0 ? 100 : 0);
        const desvioMedioEsforco = comHoras.length > 0 ? Number((somaDesvio / comHoras.length).toFixed(1)) : 0;
        const mediaHorasPorOS = comHoras.length > 0 ? Number((somaHoras / comHoras.length).toFixed(1)) : 0;
        const margem = somaFaturado > 0 ? Number((((somaFaturado - somaCustoReal) / somaFaturado) * 100).toFixed(1)) : 0;

        const causasArray: CausaDesvioFrequente[] = Object.entries(causasContagem).map(([causa, qtd], idx) => {
            const cores = ['#3b82f6', '#6366f1', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'];
            return {
                causa,
                quantidade: qtd,
                percentual: Number(((qtd / Math.max(1, concluidosReais.length)) * 100).toFixed(1)),
                cor: cores[idx % cores.length]
            };
        });

        return {
            indicadores: {
                indiceAssertividade,
                desvioMedioEsforco,
                margemOrcadaVsRealizada: Math.max(0, margem),
                totalOSConcluidas: totalOSReais,
                licoesFormalizadas: licoesFormalizadasReais,
                mediaHorasPorOS,
                totalOSReais
            },
            historicoMensal: [
                { 
                    mes: 'Acervo Real', 
                    horasOrcadas: comHoras.reduce((a, c) => a + c.blocoOrcamento.horasEstimadas, 0), 
                    horasRealizadas: somaHoras 
                }
            ],
            causasFrequentes: causasArray.length > 0 ? causasArray : [
                { causa: totalOSReais > 0 ? 'Sem desvios cadastrados' : 'Nenhuma OS concluída', quantidade: totalOSReais, percentual: 100, cor: '#10b981' }
            ]
        };
    }

    // Modo Demonstração (com Mock):
    return {
        indicadores: {
            indiceAssertividade: 84.5,
            desvioMedioEsforco: 13.2,
            margemOrcadaVsRealizada: 29.4,
            totalOSConcluidas: 148 + totalOSReais,
            licoesFormalizadas: 52 + licoesFormalizadasReais,
            mediaHorasPorOS: 18.7,
            totalOSReais
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
