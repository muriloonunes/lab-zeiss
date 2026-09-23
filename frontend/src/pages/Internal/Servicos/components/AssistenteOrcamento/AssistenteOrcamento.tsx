import React, { useState, useEffect } from 'react';
import { obterRecomendacaoOrcamento, RecomendacaoOrcamento } from '../../../../../services/estatisticaServiceMock';
import './AssistenteOrcamento.scss';

export interface AssistenteOrcamentoProps {
    tipoServicoId: number | '';
    caracteristicasPecaIds: number[];
    horasEstimadas: number | '';
    justificativa: string;
    onJustificativaChange: (valor: string) => void;
    onAplicarHorasRecomendadas?: (horas: number) => void;
    onDivergenciaChange?: (temDivergencia: boolean) => void;
}

export const AssistenteOrcamento: React.FC<AssistenteOrcamentoProps> = ({
    tipoServicoId,
    caracteristicasPecaIds,
    horasEstimadas,
    justificativa,
    onJustificativaChange,
    onAplicarHorasRecomendadas,
    onDivergenciaChange,
}) => {
    const [recomendacao, setRecomendacao] = useState<RecomendacaoOrcamento | null>(null);
    const [carregando, setCarregando] = useState(false);
    const [tabelaExpandida, setTabelaExpandida] = useState(false);

    // Estado para controlar se os casos mock de demonstração são incluídos ou se apenas dados reais da API são usados
    const [incluirMock, setIncluirMock] = useState<boolean>(() => {
        const salvo = localStorage.getItem('assistente_incluir_mock');
        return salvo !== null ? salvo === 'true' : true;
    });

    const handleToggleMock = (usarMock: boolean) => {
        setIncluirMock(usarMock);
        localStorage.setItem('assistente_incluir_mock', String(usarMock));
    };

    // Busca a recomendação quando o tipo de serviço, características ou o modo mock mudarem
    useEffect(() => {
        let isMounted = true;
        setCarregando(true);

        obterRecomendacaoOrcamento(tipoServicoId, caracteristicasPecaIds, incluirMock)
            .then(resp => {
                if (isMounted) {
                    setRecomendacao(resp);
                    setCarregando(false);
                }
            })
            .catch(() => {
                if (isMounted) setCarregando(false);
            });

        return () => {
            isMounted = false;
        };
    }, [tipoServicoId, caracteristicasPecaIds, incluirMock]);

    // Verificação de divergência >= 15% em relação à mediana
    const { temDivergencia, percentualDivergencia, tipoDivergencia } = React.useMemo(() => {
        if (
            !recomendacao ||
            recomendacao.medianaHoras <= 0 ||
            horasEstimadas === '' ||
            Number(horasEstimadas) <= 0 ||
            recomendacao.nivelConfianca === 'SEM_HISTORICO' ||
            recomendacao.nivelConfianca === 'BAIXA' // Na confiança baixa não há mediana para divergir
        ) {
            return { temDivergencia: false, percentualDivergencia: 0, tipoDivergencia: 'igual' as const };
        }

        const horas = Number(horasEstimadas);
        const med = recomendacao.medianaHoras;
        const diff = (horas - med) / med;
        const diffAbs = Math.abs(diff);

        const divergente = diffAbs >= 0.15;
        const perc = Math.round(diffAbs * 100);
        const tipo = diff > 0 ? ('maior' as const) : ('menor' as const);

        return {
            temDivergencia: divergente,
            percentualDivergencia: perc,
            tipoDivergencia: tipo,
        };
    }, [recomendacao, horasEstimadas]);

    // Notifica o componente pai sobre a divergência para validação no formulário
    useEffect(() => {
        if (onDivergenciaChange) {
            onDivergenciaChange(temDivergencia);
        }
    }, [temDivergencia, onDivergenciaChange]);

    if (!recomendacao) return null;

    const { 
        nivelConfianca, 
        quantidadeCasos, 
        quantidadeCasosReais, 
        quantidadeCasosMock, 
        medianaHoras, 
        quartil1, 
        quartil3, 
        fatorCorrecao, 
        casosBase,
        usandoApenasDadosReais 
    } = recomendacao;

    return (
        <div className={`assistente-orcamento-card confianca-${nivelConfianca.toLowerCase()}`}>
            {/* Cabeçalho do Card */}
            <div className="assistente-card-header">
                <div className="header-left">
                    <div className="icon-ai-sparkle">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                            <path d="M5 3v4"/>
                            <path d="M19 17v4"/>
                            <path d="M3 5h4"/>
                            <path d="M17 19h4"/>
                        </svg>
                    </div>
                    <div className="header-titles">
                        <h4 className="card-title">Assistente Inteligente de Orçamento</h4>
                        <span className="card-subtitle">Análise histórica do acervo de medições SENAI / ZEISS</span>
                    </div>
                </div>

                <div className="header-right">
                    {carregando ? (
                        <span className="badge-status loading">Calculando...</span>
                    ) : (
                        <>
                            {nivelConfianca === 'SEM_HISTORICO' && (
                                <span className="badge-status status-sem-historico">
                                    Sem Histórico Suficiente
                                </span>
                            )}
                            {nivelConfianca === 'BAIXA' && (
                                <span className="badge-status status-baixa" title="Amostragem entre 1 e 4 casos">
                                    <span className="dot" />
                                    Confiança Baixa ({quantidadeCasos} {quantidadeCasos === 1 ? 'caso' : 'casos'})
                                </span>
                            )}
                            {nivelConfianca === 'MEDIA' && (
                                <span className="badge-status status-media" title="Amostragem entre 5 e 14 casos">
                                    <span className="dot" />
                                    Confiança Média ({quantidadeCasos} casos)
                                </span>
                            )}
                            {nivelConfianca === 'ALTA' && (
                                <span className="badge-status status-alta" title="Amostragem estatística com 15 ou mais casos">
                                    <span className="dot" />
                                    Confiança Alta ({quantidadeCasos} casos)
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Conteúdo Dinâmico conforme Faixa de Confiança */}
            <div className="assistente-card-body">
                {/* 1. Sem Histórico */}
                {nivelConfianca === 'SEM_HISTORICO' && (
                    <div className="cenario-sem-historico">
                        <p className="orientacao-texto">
                            Sem histórico formalizado suficiente para esta combinação de características. Siga o roteiro técnico padrão.
                        </p>
                    </div>
                )}

                {/* 2. Confiança Baixa (1 a 4 casos) - SEM FAIXAS DE VALOR */}
                {nivelConfianca === 'BAIXA' && (
                    <div className="cenario-baixa-confianca">
                        <p className="orientacao-texto">
                            Amostragem histórica reduzida ({quantidadeCasos} {quantidadeCasos === 1 ? 'caso' : 'casos'}). Não há dados estatísticos suficientes para estipular faixas de valor com segurança. Consulte os casos individuais abaixo para nortear sua estimativa.
                        </p>
                    </div>
                )}

                {/* 3. Confiança Média ou Alta (5+ casos) - MOSTRA FAIXAS (Q1 a Q3 e Mediana) */}
                {(nivelConfianca === 'MEDIA' || nivelConfianca === 'ALTA') && (
                    <div className="cenario-estatistico">
                        <div className="metricas-grid">
                            <div className="metrica-box">
                                <span className="metrica-label">Faixa Provável (Q1 - Q3)</span>
                                <div className="metrica-valor-destaque">
                                    <span className="faixa">{quartil1.toFixed(1)}h – {quartil3.toFixed(1)}h</span>
                                </div>
                                <span className="metrica-desc">50% dos serviços concluídos concentram-se nesta faixa</span>
                            </div>

                            <div className="metrica-box mediana-box">
                                <span className="metrica-label">Mediana Recomendada</span>
                                <div className="metrica-valor-destaque">
                                    <span className="valor">{medianaHoras.toFixed(1)}h</span>
                                    {onAplicarHorasRecomendadas && (
                                        <button
                                            type="button"
                                            className="btn-aplicar-horas"
                                            onClick={() => onAplicarHorasRecomendadas(medianaHoras)}
                                            title="Preencher campo de horas estimadas com a mediana histórica"
                                        >
                                            Aplicar
                                        </button>
                                    )}
                                </div>
                                <span className="metrica-desc">Ponto central de esforço histórico</span>
                            </div>
                        </div>

                        {/* Destaque do FATOR DE CORREÇÃO (Confiança Alta: 15+ casos) */}
                        {nivelConfianca === 'ALTA' && fatorCorrecao > 1.0 && (
                            <div className="fator-correcao-banner">
                                <div className="fator-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                                        <line x1="12" y1="9" x2="12" y2="13"/>
                                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                                    </svg>
                                </div>
                                <div className="fator-content">
                                    <strong>Fator de Correção Histórico Aplicável: +{Math.round((fatorCorrecao - 1) * 100)}%</strong>
                                    <p>
                                        Atenção: serviços com esta combinação de características costumam levar em média <strong>+{Math.round((fatorCorrecao - 1) * 100)}% de tempo adicional</strong> na bancada devido a imprevistos operacionais recorrentes.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 4. A REGRA ANTI CAIXA-PRETA: Botão de Inspeção dos Casos */}
                {quantidadeCasos > 0 && (
                    <div className="secao-anti-caixa-preta">
                        <button
                            type="button"
                            className="btn-toggle-casos"
                            onClick={() => setTabelaExpandida(!tabelaExpandida)}
                            aria-expanded={tabelaExpandida}
                        >
                            <svg className="icon-audit" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12h20"/>
                                <path d="M20 12v8H4v-8"/>
                                <path d="m4 4 16 0"/>
                                <path d="M12 4v16"/>
                            </svg>
                            <span>
                                {tabelaExpandida ? 'Ocultar' : 'Ver'} os {quantidadeCasos} casos que geraram esta recomendação
                            </span>
                            <span className="chevron-toggle">{tabelaExpandida ? '▲' : '▼'}</span>
                        </button>

                        {tabelaExpandida && (
                            <div className="tabela-casos-wrapper">
                                <table className="tabela-casos">
                                    <thead>
                                        <tr>
                                            <th>Ordem de Serviço</th>
                                            <th>Horas Estimadas</th>
                                            <th>Horas Reais</th>
                                            <th>Desvio (%)</th>
                                            <th>Valor Faturado</th>
                                            <th>Observações / Lições da OS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {casosBase.map(caso => {
                                            const desvioPositivo = caso.desvioPercentual > 0;
                                            const badgeClass =
                                                caso.desvioPercentual <= 10
                                                    ? 'desvio-baixo'
                                                    : caso.desvioPercentual <= 20
                                                    ? 'desvio-medio'
                                                    : 'desvio-alto';

                                            return (
                                                <tr key={caso.id}>
                                                    <td className="col-codigo">
                                                        <strong>{caso.codigoOS}</strong>
                                                        <span className="data-conclusao">{caso.dataConclusao}</span>
                                                    </td>
                                                    <td>{caso.horasEstimadas}h</td>
                                                    <td>
                                                        <strong>{caso.horasRealizadas}h</strong>
                                                    </td>
                                                    <td>
                                                        <span className={`badge-desvio ${badgeClass}`}>
                                                            {desvioPositivo ? `+${caso.desvioPercentual.toFixed(1)}%` : `${caso.desvioPercentual.toFixed(1)}%`}
                                                        </span>
                                                    </td>
                                                    <td className="col-valor">
                                                        {caso.valorFaturado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    </td>
                                                    <td className="col-obs">
                                                        {caso.observacao || 'Execução em conformidade.'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* 5. A REGRA DA JUSTIFICATIVA OBRIGATÓRIA (Divergência >= 15% da mediana) */}
                {temDivergencia && (
                    <div className="justificativa-divergencia-box">
                        <div className="divergencia-header">
                            <div className="icon-warning-pill">!</div>
                            <div className="divergencia-info">
                                <strong>Divergência de {percentualDivergencia}% em relação ao Histórico ({horasEstimadas}h vs Mediana de {medianaHoras.toFixed(1)}h)</strong>
                                <p>
                                    O valor informado é {percentualDivergencia}% {tipoDivergencia} que a mediana apurada no laboratório. Para preservar a confiabilidade do processo, justifique tecnicamente a razão desta estimativa:
                                </p>
                            </div>
                        </div>

                        <div className="justificativa-input-wrapper">
                            <textarea
                                rows={3}
                                className="textarea-justificativa"
                                value={justificativa}
                                onChange={(e) => onJustificativaChange(e.target.value)}
                                placeholder="Descreva os fatores técnicos que motivam essa divergência (ex: lote maior de peças, gabarito exclusivo já existente, necessidade de usinagem prévia)... *"
                            />
                            {!justificativa.trim() && (
                                <span className="aviso-obrigatorio">
                                    * Justificativa obrigatória para habilitar o salvamento da Ordem de Serviço.
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Rodapé sutil com controle para alternar dados de demonstração na apresentação */}
            <div className="assistente-card-footer">
                <label className="toggle-mock-label" title="Marque para incluir casos simulados de teste ou desmarque para computar apenas OSs reais concluídas">
                    <input
                        type="checkbox"
                        checked={incluirMock}
                        onChange={(e) => handleToggleMock(e.target.checked)}
                    />
                    <span>Incluir dados simulados de teste (Mock)</span>
                </label>
            </div>
        </div>
    );
};
