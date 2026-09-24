import type { RegistroServico, StatusLicao, StatusServico } from '../types/servico';

export const MODO_DEMO_STORAGE_KEY = 'zeiss_modo_demonstracao_ativo';

export interface CasoBase {
    id: number;
    codigoOS: string;
    tipoServico: string;
    horasEstimadas: number;
    horasRealizadas: number;
    desvioPercentual: number;
    valorFaturado: number;
    dataConclusao: string;
    observacao?: string;
    caracteristicas?: string[];
}

/**
 * Verifica se o Modo Demonstração (dados mock adicionais) está habilitado.
 * Padrão: true (ativado).
 */
export function isModoDemoAtivo(): boolean {
    const salvo = localStorage.getItem(MODO_DEMO_STORAGE_KEY);
    return salvo === null ? true : salvo === 'true';
}

/**
 * Altera o estado do Modo Demonstração e dispara eventos para sincronizar toda a UI.
 */
export function setModoDemoAtivo(ativo: boolean): void {
    localStorage.setItem(MODO_DEMO_STORAGE_KEY, String(ativo));
    window.dispatchEvent(new CustomEvent('zeiss-modo-demo-alterado', { detail: { ativo } }));
}

// Armazena lições mockadas que o usuário marcou como SUPERADA durante a sessão
const mockLicoesSuperadas = new Set<number>();

export function marcarMockLicaoSuperada(id: number): void {
    mockLicoesSuperadas.add(id);
}

export function reativarMockLicao(id: number): void {
    mockLicoesSuperadas.delete(id);
}

export function isMockLicaoSuperada(id: number): boolean {
    return mockLicoesSuperadas.has(id);
}

/**
 * Base de casos mock estruturada exatamente com os tipos e características do vocabulário ZEISS.
 * Permite demonstrar todas as faixas da escada de histórico (0, 1-4, 5-14, 15+ casos).
 */
export const CASOS_MOCK_DEMO: CasoBase[] = [
    // Casos para MMC (Coordenadas)
    { id: 901, codigoOS: 'OS-2025-012', tipoServico: 'MMC', horasEstimadas: 16, horasRealizadas: 18.5, desvioPercentual: 15.6, valorFaturado: 3800, dataConclusao: '2025-11-10', observacao: 'Fixação complexa com placa magnética em peça flexível.', caracteristicas: ['Peça Complexa', 'Médio Porte'] },
    { id: 902, codigoOS: 'OS-2025-019', tipoServico: 'MMC', horasEstimadas: 20, horasRealizadas: 23.0, desvioPercentual: 15.0, valorFaturado: 4500, dataConclusao: '2025-11-24', observacao: 'Calibração prévia do apalpador necessária para geometrias estreitas.', caracteristicas: ['Peça Complexa', 'Grande Porte'] },
    { id: 903, codigoOS: 'OS-2025-027', tipoServico: 'MMC', horasEstimadas: 14, horasRealizadas: 16.0, desvioPercentual: 14.3, valorFaturado: 3200, dataConclusao: '2025-12-05', observacao: 'Variação térmica no laboratório durante ciclo longo.', caracteristicas: ['Médio Porte', 'Peça em Série'] },
    { id: 904, codigoOS: 'OS-2025-034', tipoServico: 'MMC', horasEstimadas: 18, horasRealizadas: 21.0, desvioPercentual: 16.7, valorFaturado: 4100, dataConclusao: '2025-12-18', observacao: 'Rugosidade superficial gerou incerteza nos pontos de contato.', caracteristicas: ['Peça Complexa', 'Diâmetro Médio'] },
    { id: 905, codigoOS: 'OS-2025-003', tipoServico: 'MMC', horasEstimadas: 22, horasRealizadas: 25.5, desvioPercentual: 15.9, valorFaturado: 5100, dataConclusao: '2026-01-12', observacao: 'Setup complexo para evitar deformação na fixação.', caracteristicas: ['Grande Porte', 'Peça Complexa'] },
    { id: 906, codigoOS: 'OS-2025-008', tipoServico: 'MMC', horasEstimadas: 15, horasRealizadas: 17.5, desvioPercentual: 16.7, valorFaturado: 3500, dataConclusao: '2026-01-20', observacao: 'Alinhamento por 3 planos em peça de geometria livre.', caracteristicas: ['Peça Única', 'Peça Complexa'] },
    { id: 907, codigoOS: 'OS-2025-015', tipoServico: 'MMC', horasEstimadas: 16, horasRealizadas: 18.0, desvioPercentual: 12.5, valorFaturado: 3700, dataConclusao: '2026-02-02', observacao: 'Rotina de medição CNC automatizada no software Calypso.', caracteristicas: ['Peça em Série', 'Médio Porte'] },
    { id: 908, codigoOS: 'OS-2025-021', tipoServico: 'MMC', horasEstimadas: 19, horasRealizadas: 22.0, desvioPercentual: 15.8, valorFaturado: 4400, dataConclusao: '2026-02-14', observacao: 'Necessário criar ponta especial estrela para reentrância.', caracteristicas: ['Peça Complexa', 'Diâmetro Pequeno'] },
    { id: 909, codigoOS: 'OS-2025-029', tipoServico: 'MMC', horasEstimadas: 17, horasRealizadas: 19.5, desvioPercentual: 14.7, valorFaturado: 3950, dataConclusao: '2026-02-28', observacao: 'Desvio de forma em superfície cilíndrica.', caracteristicas: ['Diâmetro Grande', 'Grande Porte'] },
    { id: 910, codigoOS: 'OS-2025-033', tipoServico: 'MMC', horasEstimadas: 24, horasRealizadas: 28.0, desvioPercentual: 16.7, valorFaturado: 5600, dataConclusao: '2026-03-05', observacao: 'Peça de grande porte exigiu reposicionamento seguro.', caracteristicas: ['Grande Porte', 'Peça Única'] },
    { id: 911, codigoOS: 'OS-2025-039', tipoServico: 'MMC', horasEstimadas: 16, horasRealizadas: 18.5, desvioPercentual: 15.6, valorFaturado: 3850, dataConclusao: '2026-03-12', observacao: 'Ajuste de filtros gaussianos para eliminar ruído.', caracteristicas: ['Peça Simples', 'Pequeno Porte'] },
    { id: 912, codigoOS: 'OS-2025-042', tipoServico: 'MMC', horasEstimadas: 18, horasRealizadas: 20.5, desvioPercentual: 13.9, valorFaturado: 4200, dataConclusao: '2026-03-20', observacao: 'Inspeção de tolerâncias geométricas GD&T completas.', caracteristicas: ['Peça Complexa', 'Médio Porte'] },
    { id: 913, codigoOS: 'OS-2025-048', tipoServico: 'MMC', horasEstimadas: 15, horasRealizadas: 17.0, desvioPercentual: 13.3, valorFaturado: 3600, dataConclusao: '2026-04-02', observacao: 'Padronização de fixador rápido modular.', caracteristicas: ['Peça em Série', 'Pequeno Porte'] },
    { id: 914, codigoOS: 'OS-2025-053', tipoServico: 'MMC', horasEstimadas: 20, horasRealizadas: 23.5, desvioPercentual: 17.5, valorFaturado: 4800, dataConclusao: '2026-04-15', observacao: 'Revisão de alinhamento com referências parciais.', caracteristicas: ['Peça Complexa', 'Grande Porte'] },
    { id: 915, codigoOS: 'OS-2025-059', tipoServico: 'MMC', horasEstimadas: 17, horasRealizadas: 19.0, desvioPercentual: 11.8, valorFaturado: 3900, dataConclusao: '2026-05-03', observacao: 'Medição por apalpação contínua (scanning de alta densidade).', caracteristicas: ['Médio Porte', 'Peça Única'] },
    { id: 916, codigoOS: 'OS-2025-064', tipoServico: 'MMC', horasEstimadas: 21, horasRealizadas: 24.0, dataConclusao: '2026-05-18', desvioPercentual: 14.3, valorFaturado: 4950, observacao: 'Validação de repetibilidade e reprodutibilidade (R&R).', caracteristicas: ['Peça Complexa', 'Diâmetro Médio'] },
    { id: 917, codigoOS: 'OS-2025-071', tipoServico: 'MMC', horasEstimadas: 16, horasRealizadas: 18.5, desvioPercentual: 15.6, valorFaturado: 3800, dataConclusao: '2026-06-01', observacao: 'Controle de temperatura do bloco padrão.', caracteristicas: ['Pequeno Porte', 'Peça Simples'] },
    { id: 918, codigoOS: 'OS-2025-077', tipoServico: 'MMC', horasEstimadas: 18, horasRealizadas: 21.0, desvioPercentual: 16.7, valorFaturado: 4300, dataConclusao: '2026-06-15', observacao: 'Dificuldade de acesso em canal interno cego.', caracteristicas: ['Diâmetro Pequeno', 'Peça Complexa'] },

    // Casos para Digitalização 3D
    { id: 920, codigoOS: 'OS-2025-088', tipoServico: 'Digitalização 3D', horasEstimadas: 8, horasRealizadas: 10.0, desvioPercentual: 25.0, valorFaturado: 2400, dataConclusao: '2025-10-14', observacao: 'Aplicação de spray antirreflexo e pontos de referência ópticos.', caracteristicas: ['Grande Porte', 'Peça Complexa'] },
    { id: 921, codigoOS: 'OS-2025-095', tipoServico: 'Digitalização 3D', horasEstimadas: 10, horasRealizadas: 12.0, desvioPercentual: 20.0, valorFaturado: 2900, dataConclusao: '2025-11-05', observacao: 'Mesclagem de múltiplas tomadas no Zeiss Inspect.', caracteristicas: ['Médio Porte', 'Peça Complexa'] },
    { id: 922, codigoOS: 'OS-2025-004', tipoServico: 'Digitalização 3D', horasEstimadas: 6, horasRealizadas: 7.5, desvioPercentual: 25.0, valorFaturado: 1800, dataConclusao: '2026-01-18', observacao: 'Escaneamento com T-Scan em geometria orgânica.', caracteristicas: ['Pequeno Porte', 'Peça Única'] },
    { id: 923, codigoOS: 'OS-2025-018', tipoServico: 'Digitalização 3D', horasEstimadas: 12, horasRealizadas: 14.5, desvioPercentual: 20.8, valorFaturado: 3500, dataConclusao: '2026-02-10', observacao: 'Peça com cavidades profundas exigiu ângulos adicionais.', caracteristicas: ['Grande Porte', 'Peça Complexa'] },
    { id: 924, codigoOS: 'OS-2025-031', tipoServico: 'Digitalização 3D', horasEstimadas: 7, horasRealizadas: 8.5, desvioPercentual: 21.4, valorFaturado: 2100, dataConclusao: '2026-03-02', observacao: 'Geração de malha poligonal estanque (watertight).', caracteristicas: ['Médio Porte', 'Peça Única'] },
    { id: 925, codigoOS: 'OS-2025-045', tipoServico: 'Digitalização 3D', horasEstimadas: 9, horasRealizadas: 11.0, desvioPercentual: 22.2, valorFaturado: 2600, dataConclusao: '2026-04-12', observacao: 'Inspeção de mapa de cores (Color Map Deviation).', caracteristicas: ['Peça Complexa', 'Médio Porte'] },

    // Casos para Engenharia Reversa
    { id: 930, codigoOS: 'OS-2025-102', tipoServico: 'Engenharia Reversa', horasEstimadas: 24, horasRealizadas: 28.0, desvioPercentual: 16.7, valorFaturado: 6200, dataConclusao: '2025-11-30', observacao: 'Reconstrução de superfícies paramétricas CAD a partir de malha STL.', caracteristicas: ['Peça Complexa', 'Médio Porte'] },
    { id: 931, codigoOS: 'OS-2025-115', tipoServico: 'Engenharia Reversa', horasEstimadas: 30, horasRealizadas: 36.0, desvioPercentual: 20.0, valorFaturado: 7800, dataConclusao: '2025-12-22', observacao: 'Identificação de ângulos de saída e concordâncias originais de fundição.', caracteristicas: ['Grande Porte', 'Peça Complexa'] },
    { id: 932, codigoOS: 'OS-2025-025', tipoServico: 'Engenharia Reversa', horasEstimadas: 18, horasRealizadas: 21.0, desvioPercentual: 16.7, valorFaturado: 4700, dataConclusao: '2026-02-18', observacao: 'Modelagem paramétrica em SolidWorks com base na nuvem de pontos.', caracteristicas: ['Pequeno Porte', 'Peça Única'] },

    // Casos para Raio-X / Tomografia
    { id: 940, codigoOS: 'OS-2025-011', tipoServico: 'Raio-X / Tomografia', horasEstimadas: 10, horasRealizadas: 11.5, desvioPercentual: 15.0, valorFaturado: 3100, dataConclusao: '2026-01-25', observacao: 'Análise não destrutiva de porosidade interna e trincas.', caracteristicas: ['Peça Complexa', 'Pequeno Porte'] },
    { id: 941, codigoOS: 'OS-2025-028', tipoServico: 'Raio-X / Tomografia', horasEstimadas: 12, horasRealizadas: 14.0, desvioPercentual: 16.7, valorFaturado: 3700, dataConclusao: '2026-02-24', observacao: 'Ajuste de penetração kV e mA no Bosello para peça de alumínio fundido.', caracteristicas: ['Médio Porte', 'Peça Complexa'] },

    // Casos para Elaboração de Laudo
    { id: 950, codigoOS: 'OS-2025-006', tipoServico: 'Elaboração de Laudo', horasEstimadas: 4, horasRealizadas: 4.5, desvioPercentual: 12.5, valorFaturado: 1200, dataConclusao: '2026-01-15', observacao: 'Emissão de parecer de conformidade dimensional e incerteza de medição.', caracteristicas: ['Peça Simples', 'Pequeno Porte'] },
    { id: 951, codigoOS: 'OS-2025-037', tipoServico: 'Elaboração de Laudo', horasEstimadas: 6, horasRealizadas: 7.0, desvioPercentual: 16.7, valorFaturado: 1800, dataConclusao: '2026-03-10', observacao: 'Laudo pericial com cálculo de capacidade de processo (Cp e Cpk).', caracteristicas: ['Peça em Série', 'Médio Porte'] }
];

/**
 * Converte os casos mock em registros completos de serviço (RegistroServico)
 * perfeitamente compatíveis com as tabelas de Ordens de Serviço e Lições Aprendidas.
 */
export function obterServicosMockComoRegistros(): RegistroServico[] {
    return CASOS_MOCK_DEMO.map((c, idx) => {
        // Seleção de recurso compatível com o tipo de serviço
        let recursoDescricao = 'Prismo';
        if (c.tipoServico.includes('Digitalização')) recursoDescricao = 'T-Scan';
        else if (c.tipoServico.includes('Reversa')) recursoDescricao = 'ZRE';
        else if (c.tipoServico.includes('Raio-X') || c.tipoServico.includes('Tomografia')) recursoDescricao = 'Bosello';
        else if (c.tipoServico.includes('Laudo')) recursoDescricao = 'Zeiss Inspect';
        else {
            const recursosMMC = ['Prismo', 'DuraMax', 'OInspect'];
            recursoDescricao = recursosMMC[idx % recursosMMC.length];
        }

        // Causa de desvio correspondente à observação técnica
        let causaDescricao = 'Peça com geometria complexa';
        let causaId = 401;
        const obsLower = (c.observacao || '').toLowerCase();
        if (obsLower.includes('fixação') || obsLower.includes('setup') || obsLower.includes('fixador')) {
            causaDescricao = 'Fixação mais complexa';
            causaId = 402;
        } else if (obsLower.includes('térmic') || obsLower.includes('temperatura')) {
            causaDescricao = 'Instabilidade térmica';
            causaId = 403;
        } else if (obsLower.includes('escopo') || obsLower.includes('cliente')) {
            causaDescricao = 'Mudança de escopo pelo cliente';
            causaId = 404;
        } else if (obsLower.includes('rugosidade') || obsLower.includes('superfície')) {
            causaDescricao = 'Rugosidade superficial elevada';
            causaId = 405;
        } else if (obsLower.includes('reentrância') || obsLower.includes('canal') || obsLower.includes('cavidade')) {
            causaDescricao = 'Dificuldade de acesso a canais internos';
            causaId = 406;
        } else if (c.desvioPercentual <= 12) {
            causaDescricao = 'Nenhum Desvio';
            causaId = 407;
        }

        const custoEstimado = Math.round(c.horasEstimadas * 250);
        const custoReal = Math.round(c.horasRealizadas * 250);
        const isSuperada = isMockLicaoSuperada(c.id);

        return {
            id: c.id,
            codigo: c.codigoOS,
            status: 'CONCLUIDO' as StatusServico,
            dataCriacao: `${c.dataConclusao}T08:00:00Z`,
            dataAtualizacao: `${c.dataConclusao}T17:30:00Z`,
            blocoOrcamento: {
                tipoServico: {
                    id: 101 + (idx % 5),
                    descricao: c.tipoServico,
                    ativo: true
                },
                caracteristicasPeca: (c.caracteristicas || []).map((carac, cIdx) => ({
                    id: 201 + cIdx + (idx * 2),
                    descricao: carac,
                    ativo: true
                })),
                recurso: {
                    id: 301 + (idx % 10),
                    descricao: recursoDescricao,
                    ativo: true
                },
                horasEstimadas: c.horasEstimadas,
                custoEstimado,
                valorProposto: c.valorFaturado,
                responsavelEstimativa: {
                    id: 1,
                    nome: 'Técnico Metrologista ZEISS',
                    username: 'tecnico.zeiss',
                    email: 'metrologia@zeiss.com'
                },
                premissasAssumidas: `OS de calibração/medição em conformidade com o procedimento operacional de ${c.tipoServico}.`
            },
            blocoRealizado: {
                horasRealizadas: c.horasRealizadas,
                custoReal,
                valorFaturado: c.valorFaturado,
                dataRealEntrega: c.dataConclusao,
                houveRetrabalho: c.desvioPercentual > 20,
                houveMudancaEscopo: obsLower.includes('escopo')
            },
            blocoAprendizado: {
                causaDesvio: {
                    id: causaId,
                    descricao: causaDescricao,
                    ativo: true
                },
                licaoAprendida: c.observacao || 'Conhecimento técnico formalizado no acervo institucional.',
                assuntosRelacionados: (c.caracteristicas || []).map((carac, cIdx) => ({
                    id: 501 + cIdx,
                    descricao: carac,
                    ativo: true
                })),
                statusLicao: (isSuperada ? 'SUPERADA' : 'FORMALIZADA') as StatusLicao,
                restrito: false
            }
        };
    });
}
