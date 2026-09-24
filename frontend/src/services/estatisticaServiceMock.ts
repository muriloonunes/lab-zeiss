import { listarServicos } from './servicoService';
import type { RegistroServico } from '../types/servico';

import type { CasoBase } from './mockDataService';
import {
    CASOS_MOCK_DEMO,
    isModoDemoAtivo,
    setModoDemoAtivo,
} from './mockDataService';

export type { CasoBase };
export {
    CASOS_MOCK_DEMO,
    isModoDemoAtivo,
    setModoDemoAtivo,
};

export type NivelConfianca = 'SEM_HISTORICO' | 'BAIXA' | 'MEDIA' | 'ALTA';

/**
 * Normaliza strings para comparação flexível.
 */
function normalizar(texto?: string): string {
    if (!texto) return '';
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

/**
 * Calcula Quartis (Q1, Mediana, Q3) segundo a regra estatística padrão.
 */
function calcularEstatisticas(valores: number[]): { mediana: number; q1: number; q3: number } {
    if (valores.length === 0) {
        return { mediana: 0, q1: 0, q3: 0 };
    }

    const ordenados = [...valores].sort((a, b) => a - b);
    const n = ordenados.length;

    const obterPercentil = (p: number): number => {
        const index = (n - 1) * p;
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;
        if (lower === upper) return ordenados[lower];
        return Number((ordenados[lower] * (1 - weight) + ordenados[upper] * weight).toFixed(1));
    };

    return {
        mediana: obterPercentil(0.5),
        q1: obterPercentil(0.25),
        q3: obterPercentil(0.75)
    };
}

/**
 * Converte um RegistroServico concluído com lição formalizada em CasoBase unificado.
 */
function converterServicoParaCasoBase(s: RegistroServico): CasoBase {
    const horasEstimadas = s.blocoOrcamento.horasEstimadas || 1;
    const horasRealizadas = s.blocoRealizado?.horasRealizadas ?? horasEstimadas;
    const desvioPercentual = Number((((horasRealizadas - horasEstimadas) / horasEstimadas) * 100).toFixed(1));

    return {
        id: s.id,
        codigoOS: s.codigo,
        tipoServico: s.blocoOrcamento.tipoServico?.descricao || 'Serviço Metrológico',
        horasEstimadas,
        horasRealizadas,
        desvioPercentual,
        valorFaturado: s.blocoRealizado?.valorFaturado || s.blocoOrcamento.valorProposto || 0,
        dataConclusao: s.blocoRealizado?.dataRealEntrega || s.dataAtualizacao || s.dataCriacao,
        observacao: s.blocoAprendizado?.licaoAprendida || s.blocoOrcamento.premissasAssumidas || 'Lição formalizada registrada no encerramento.',
        caracteristicas: s.blocoOrcamento.caracteristicasPeca?.map(c => c.descricao) || []
    };
}

export interface FiltroOrcamentoParams {
    tipoServicoId?: number | '';
    tipoServicoNome?: string;
    caracteristicasIds?: number[];
    caracteristicasNomes?: string[];
}

/**
 * Retorna a recomendação histórica com base nos critérios inegociáveis de negócio:
 * 1. Gatilho: Tipo de Serviço E pelo menos 1 Característica da Peça.
 * 2. Recurso NÃO entra no filtro histórico.
 * 3. Apenas registros FORMALIZADOS são computados (SUPERADA e outros descartados).
 * 4. Combina API + Mock se o Modo Demo estiver ativo. Se desativado, usa estritamente API.
 * 5. Escada de histórico:
 *    - 0 casos: Sem Histórico (Sem faixas, roteiro padrão)
 *    - 1 a 4 casos: Confiança Baixa (Exibe casos, sem faixas, sem fator)
 *    - 5 a 14 casos: Confiança Média (Mediana, Q1, Q3)
 *    - 15+ casos: Confiança Alta (Mediana, Q1, Q3 + Fator de Correção)
 */
export async function obterRecomendacaoOrcamento(
    params: FiltroOrcamentoParams
): Promise<RecomendacaoOrcamento> {
    const { tipoServicoId, tipoServicoNome = '', caracteristicasIds = [], caracteristicasNomes = [] } = params;

    const temTipo = Boolean(tipoServicoId) || Boolean(tipoServicoNome.trim());
    const temCaracteristicas = caracteristicasIds.length > 0 || caracteristicasNomes.length > 0;

    const modoDemo = isModoDemoAtivo();

    // Se não atingiu o gatilho mínimo (Tipo E pelo menos 1 Característica), retorna estado inicial
    if (!temTipo || !temCaracteristicas) {
        return {
            quantidadeCasos: 0,
            nivelConfianca: 'SEM_HISTORICO',
            medianaHoras: 0,
            quartil1: 0,
            quartil3: 0,
            fatorCorrecao: 1.0,
            mensagemOrientacao: 'Aguardando seleção de Tipo de Serviço e ao menos uma Característica da Peça para consultar a base de conhecimento.',
            casosBase: [],
            modoDemoAtivo: modoDemo
        };
    }

    // 1. Busca dados reais da API
    let servicosReais: RegistroServico[] = [];
    try {
        servicosReais = await listarServicos();
    } catch (err) {
        console.warn('Não foi possível carregar serviços reais da API, prosseguindo com fallback:', err);
    }

    const tipoNomeNorm = normalizar(tipoServicoNome);
    const caracNomesNorm = caracteristicasNomes.map(normalizar);

    // 2. Filtra serviços reais: APENAS CONCLUÍDOS e FORMALIZADOS (SUPERADA descartada)
    const casosReaisValidos = servicosReais.filter(s => {
        if (s.status !== 'CONCLUIDO') return false;
        if (s.blocoAprendizado?.statusLicao !== 'FORMALIZADA') return false;

        // Filtro por Tipo de Serviço
        const sTipoId = s.blocoOrcamento?.tipoServico?.id;
        const sTipoNome = normalizar(s.blocoOrcamento?.tipoServico?.descricao);
        const tipoBate = (tipoServicoId && sTipoId === Number(tipoServicoId)) ||
            (tipoNomeNorm && (sTipoNome.includes(tipoNomeNorm) || tipoNomeNorm.includes(sTipoNome)));

        if (!tipoBate) return false;

        // Filtro por Característica da Peça (ao menos uma em comum)
        const sCaracs = s.blocoOrcamento?.caracteristicasPeca || [];
        const temCaracComum = sCaracs.some(sc => {
            if (caracteristicasIds.includes(sc.id)) return true;
            const scNomeNorm = normalizar(sc.descricao);
            return caracNomesNorm.some(cn => cn === scNomeNorm || scNomeNorm.includes(cn) || cn.includes(scNomeNorm));
        });

        return temCaracComum;
    }).map(converterServicoParaCasoBase);

    // 3. Casos mockados filtrados (apenas se Modo Demo estiver ativo)
    let casosMockValidos: CasoBase[] = [];
    if (modoDemo) {
        casosMockValidos = CASOS_MOCK_DEMO.filter(cm => {
            const cmTipoNorm = normalizar(cm.tipoServico);
            const tipoBate = tipoNomeNorm && (cmTipoNorm.includes(tipoNomeNorm) || tipoNomeNorm.includes(cmTipoNorm));

            if (!tipoBate) return false;

            const cmCaracs = cm.caracteristicas?.map(normalizar) || [];
            const temCaracComum = cmCaracs.some(cmc =>
                caracNomesNorm.some(cn => cn === cmc || cmc.includes(cn) || cn.includes(cmc))
            );

            return temCaracComum;
        });

        // Caso a combinação específica no mock seja restrita, garantimos casos para demonstrar a escada
        if (casosMockValidos.length === 0 && tipoNomeNorm) {
            casosMockValidos = CASOS_MOCK_DEMO.filter(cm => normalizar(cm.tipoServico).includes(tipoNomeNorm));
        }
    }

    // 4. Unificação dos dados (zero distinção visual, sem IDs duplicados)
    const idsExistentes = new Set(casosReaisValidos.map(c => c.id));
    const casosFinais: CasoBase[] = [
        ...casosReaisValidos,
        ...(modoDemo ? casosMockValidos.filter(cm => !idsExistentes.has(cm.id)) : [])
    ];

    const N = casosFinais.length;

    // Escada de Histórico
    if (N === 0) {
        return {
            quantidadeCasos: 0,
            nivelConfianca: 'SEM_HISTORICO',
            medianaHoras: 0,
            quartil1: 0,
            quartil3: 0,
            fatorCorrecao: 1.0,
            mensagemOrientacao: 'Sem histórico formalizado suficiente para esta combinação. Não há faixas sugeridas. Siga o roteiro técnico padrão para sua estimativa.',
            casosBase: [],
            modoDemoAtivo: modoDemo
        };
    }

    if (N >= 1 && N <= 4) {
        // Confiança Baixa: NÃO exibe faixas nem fator de correção na interface
        return {
            quantidadeCasos: N,
            nivelConfianca: 'BAIXA',
            medianaHoras: 0,
            quartil1: 0,
            quartil3: 0,
            fatorCorrecao: 1.0,
            mensagemOrientacao: `Amostragem histórica reduzida (${N} ${N === 1 ? 'caso encontrado' : 'casos encontrados'}). Não há densidade para sugerir faixa estatística. Avalie os casos individuais abaixo antes de arbitrar as horas.`,
            casosBase: casosFinais,
            modoDemoAtivo: modoDemo
        };
    }

    const horasRealizadasArr = casosFinais.map(c => c.horasRealizadas);
    const { mediana, q1, q3 } = calcularEstatisticas(horasRealizadasArr);

    if (N >= 5 && N <= 14) {
        // Confiança Média: Exibe faixa provável (Q1 a Q3 e Mediana)
        return {
            quantidadeCasos: N,
            nivelConfianca: 'MEDIA',
            medianaHoras: mediana,
            quartil1: q1,
            quartil3: q3,
            fatorCorrecao: 1.0,
            mensagemOrientacao: `Histórico consistente (${N} casos formalizados). A faixa de esforço mais provável situa-se entre ${q1}h e ${q3}h (Mediana: ${mediana}h).`,
            casosBase: casosFinais,
            modoDemoAtivo: modoDemo
        };
    }

    // N >= 15: Confiança Alta: Quartis + Fator de Correção
    const totalEstimadas = casosFinais.reduce((acc, c) => acc + c.horasEstimadas, 0);
    const totalRealizadas = casosFinais.reduce((acc, c) => acc + c.horasRealizadas, 0);
    const fatorCorrecao = totalEstimadas > 0 ? Number((totalRealizadas / totalEstimadas).toFixed(2)) : 1.15;

    const diffPercent = Math.round((fatorCorrecao - 1) * 100);
    let orientacao = `Alta confiabilidade estatística (${N} casos formalizados). Faixa provável entre ${q1}h e ${q3}h (Mediana: ${mediana}h).`;
    if (diffPercent > 0) {
        orientacao += ` Alerta: serviços similares apresentam tendência histórica de +${diffPercent}% de esforço real em relação ao orçamento inicial.`;
    } else if (diffPercent < 0) {
        orientacao += ` Observação: histórico apresenta ligeira superestimação (${diffPercent}% de esforço real vs. estimado).`;
    }

    return {
        quantidadeCasos: N,
        nivelConfianca: 'ALTA',
        medianaHoras: mediana,
        quartil1: q1,
        quartil3: q3,
        fatorCorrecao,
        mensagemOrientacao: orientacao,
        casosBase: casosFinais,
        modoDemoAtivo: modoDemo
    };
}

/**
 * Retorna os dados executivos do Dashboard unificados (API + Mock se ativo).
 */
export async function obterDadosDashboard(): Promise<DadosDashboard> {
    const modoDemo = isModoDemoAtivo();

    const toleranciaConfigurada = (() => {
        try {
            const salvo = localStorage.getItem('zeiss_configuracoes_sistema');
            if (salvo) {
                const p = JSON.parse(salvo);
                return Number(p.toleranciaAssertividade) || 15;
            }
        } catch {}
        return 15;
    })();

    let servicosReais: RegistroServico[] = [];
    try {
        servicosReais = await listarServicos();
    } catch (e) {
        console.warn('Erro ao obter serviços para o dashboard:', e);
    }

    const concluidosReais = servicosReais.filter(s => s.status === 'CONCLUIDO');
    const formalizadosReais = concluidosReais.filter(s => s.blocoAprendizado?.statusLicao === 'FORMALIZADA');

    // Se o modo demo estiver desativado, calculamos tudo estritamente com base nos dados reais
    if (!modoDemo) {
        if (concluidosReais.length === 0) {
            return {
                indicadores: {
                    indiceAssertividade: 0,
                    desvioMedioEsforco: 0,
                    margemOrcadaVsRealizada: 0,
                    totalOSConcluidas: 0,
                    licoesFormalizadas: formalizadosReais.length,
                    mediaHorasPorOS: 0
                },
                historicoMensal: [],
                causasFrequentes: [],
                modoDemoAtivo: false,
                toleranciaAssertividade: toleranciaConfigurada
            };
        }

        let somaHoras = 0;
        let osDentroMargem = 0;
        let somaDesvio = 0;
        let somaMargem = 0;

        const mesesMap = new Map<string, { orcadas: number; realizadas: number }>();
        const causasMap = new Map<string, number>();

        concluidosReais.forEach(s => {
            const hEst = s.blocoOrcamento.horasEstimadas || 0;
            const hReal = s.blocoRealizado?.horasRealizadas || hEst;
            somaHoras += hReal;

            const desvio = hEst > 0 ? ((hReal - hEst) / hEst) * 100 : 0;
            somaDesvio += desvio;

            if (Math.abs(desvio) <= toleranciaConfigurada) {
                osDentroMargem++;
            }

            const cEst = s.blocoOrcamento.custoEstimado || 0;
            const vFat = s.blocoRealizado?.valorFaturado || s.blocoOrcamento.valorProposto || 0;
            if (vFat > 0) {
                const margem = ((vFat - cEst) / vFat) * 100;
                somaMargem += margem;
            }

            // Agrupamento mensal
            const dataStr = s.blocoRealizado?.dataRealEntrega || s.dataAtualizacao || s.dataCriacao;
            const d = new Date(dataStr);
            const mesNome = isNaN(d.getTime())
                ? 'Geral'
                : d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

            const mesAtual = mesesMap.get(mesNome) || { orcadas: 0, realizadas: 0 };
            mesAtual.orcadas += hEst;
            mesAtual.realizadas += hReal;
            mesesMap.set(mesNome, mesAtual);

            // Causas de desvio
            const causa = s.blocoAprendizado?.causaDesvio?.descricao || 'Nenhum Desvio';
            causasMap.set(causa, (causasMap.get(causa) || 0) + 1);
        });

        const total = concluidosReais.length;
        const indiceAssertividade = Number(((osDentroMargem / total) * 100).toFixed(1));
        const desvioMedioEsforco = Number((somaDesvio / total).toFixed(1));
        const margemOrcadaVsRealizada = Number((somaMargem / total).toFixed(1));
        const mediaHorasPorOS = Number((somaHoras / total).toFixed(1));

        const historicoMensal: HistoricoMensalHoras[] = Array.from(mesesMap.entries()).map(([mes, vals]) => ({
            mes,
            horasOrcadas: Math.round(vals.orcadas),
            horasRealizadas: Math.round(vals.realizadas)
        }));

        const cores = ['#141e8c', '#3b82f6', '#0284c7', '#f59e0b', '#10b981', '#94a3b8'];
        const causasFrequentes: CausaDesvioFrequente[] = Array.from(causasMap.entries())
            .map(([causa, qtd], idx) => ({
                causa,
                quantidade: qtd,
                percentual: Number(((qtd / total) * 100).toFixed(1)),
                cor: cores[idx % cores.length]
            }))
            .sort((a, b) => b.quantidade - a.quantidade);

        return {
            indicadores: {
                indiceAssertividade,
                desvioMedioEsforco,
                margemOrcadaVsRealizada,
                totalOSConcluidas: total,
                licoesFormalizadas: formalizadosReais.length,
                mediaHorasPorOS
            },
            historicoMensal,
            causasFrequentes,
            modoDemoAtivo: false,
            toleranciaAssertividade: toleranciaConfigurada
        };
    }

    // Modo Demonstração Ativo: combina dados reais com a base de demonstração
    const totalOSConcluidas = 148 + concluidosReais.length;
    const licoesFormalizadas = 52 + formalizadosReais.length;

    // Ajusta a assertividade da demonstração se o admin calibrou a tolerância
    const assertividadeDemo = Number(
        Math.min(99.5, Math.max(40, 84.5 + (toleranciaConfigurada - 15) * 1.2)).toFixed(1)
    );

    return {
        indicadores: {
            indiceAssertividade: assertividadeDemo,
            desvioMedioEsforco: 13.2,
            margemOrcadaVsRealizada: 29.4,
            totalOSConcluidas,
            licoesFormalizadas,
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
            { causa: 'Fixação mais complexa', quantidade: 48, percentual: 39.0, cor: '#141e8c' },
            { causa: 'Peça com geometria complexa', quantidade: 36, percentual: 29.3, cor: '#3b82f6' },
            { causa: 'Mudança de escopo pelo cliente', quantidade: 24, percentual: 19.5, cor: '#f59e0b' },
            { causa: 'Nenhum Desvio', quantidade: 15, percentual: 12.2, cor: '#10b981' }
        ],
        modoDemoAtivo: true,
        toleranciaAssertividade: toleranciaConfigurada
    };
}
