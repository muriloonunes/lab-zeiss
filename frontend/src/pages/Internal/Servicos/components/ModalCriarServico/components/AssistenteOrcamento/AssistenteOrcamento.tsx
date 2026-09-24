import React, { useEffect, useState } from 'react';
import {
    obterRecomendacaoOrcamento,
    RecomendacaoOrcamento,
    CasoBase,
    isModoDemoAtivo,
    setModoDemoAtivo
} from '../../../../../../../services/estatisticaServiceMock';
import './AssistenteOrcamento.scss';

export interface AssistenteOrcamentoProps {
    tipoServicoId: number | '';
    tipoServicoNome?: string;
    caracteristicasIds: number[];
    caracteristicasNomes?: string[];
    onAplicarHoras?: (horas: number) => void;
    onRecomendacaoAtualizada?: (recomendacao: RecomendacaoOrcamento) => void;
}

export const AssistenteOrcamento: React.FC<AssistenteOrcamentoProps> = ({
    tipoServicoId,
    tipoServicoNome = '',
    caracteristicasIds,
    caracteristicasNomes = [],
    onAplicarHoras,
    onRecomendacaoAtualizada
}) => {
    const [carregando, setCarregando] = useState(false);
    const [recomendacao, setRecomendacao] = useState<RecomendacaoOrcamento | null>(null);
    const [tabelaExpandida, setTabelaExpandida] = useState(false);
    const [modoDemo, setModoDemo] = useState(isModoDemoAtivo());

    // Sincroniza estado de modo de demonstração via eventos globais
    useEffect(() => {
        const handleDemoAlterado = (e: Event) => {
            const custom = e as CustomEvent<{ ativo: boolean }>;
            setModoDemo(custom.detail?.ativo ?? isModoDemoAtivo());
        };

        window.addEventListener('zeiss-modo-demo-alterado', handleDemoAlterado);
        return () => {
            window.removeEventListener('zeiss-modo-demo-alterado', handleDemoAlterado);
        };
    }, []);

    // Consulta reativa ao assistente
    useEffect(() => {
        let isMounted = true;

        const consultar = async () => {
            setCarregando(true);
            try {
                const rec = await obterRecomendacaoOrcamento({
                    tipoServicoId,
                    tipoServicoNome,
                    caracteristicasIds,
                    caracteristicasNomes
                });
                if (isMounted) {
                    setRecomendacao(rec);
                    if (onRecomendacaoAtualizada) {
                        onRecomendacaoAtualizada(rec);
                    }
                }
            } catch (err) {
                console.error('Erro ao consultar assistente de orçamento:', err);
            } finally {
                if (isMounted) {
                    setCarregando(false);
                }
            }
        };

        consultar();

        return () => {
            isMounted = false;
        };
    }, [tipoServicoId, tipoServicoNome, caracteristicasIds, caracteristicasNomes, modoDemo]);

    const handleAlternarDemo = () => {
        const novo = !modoDemo;
        setModoDemo(novo);
        setModoDemoAtivo(novo);
    };

    // 1. Estado de Espera Ativa (antes de selecionar Tipo E Característica)
    const aguardandoGatilho = !tipoServicoId || caracteristicasIds.length === 0;

    if (aguardandoGatilho) {
        return (
            <div className="assistente-orcamento-container espera-ativa">
                <div className="assistente-top-bar">
                    <div className="assistente-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sparkle-icon">
                            <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
                        </svg>
                        <span>Assistente de Orçamento ZEISS</span>
                    </div>
                    <button
                        type="button"
                        className={`btn-toggle-demo ${modoDemo ? 'ativo' : ''}`}
                        onClick={handleAlternarDemo}
                        title="Alternar entre base estrita da API ou base expandida de demonstração"
                    >
                        <span className="dot"></span>
                        <span className="label-demo">{modoDemo ? 'Dados de Demonstração: Ligado' : 'Apenas Dados da API'}</span>
                    </button>
                </div>
                <div className="espera-mensagem">
                    <div className="espera-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                    </div>
                    <p>
                        Selecione o <strong>Tipo de Serviço</strong> e ao menos uma <strong>Característica da Peça</strong> para carregar as recomendações históricas do laboratório.
                    </p>
                </div>
            </div>
        );
    }

    if (carregando) {
        return (
            <div className="assistente-orcamento-container carregando">
                <div className="spinner-assistente"></div>
                <span>Consultando acervo de lições formalizadas do laboratório...</span>
            </div>
        );
    }

    if (!recomendacao) return null;

    const { nivelConfianca, quantidadeCasos, medianaHoras, quartil1, quartil3, fatorCorrecao, mensagemOrientacao, casosBase } = recomendacao;

    return (
        <div className={`assistente-orcamento-container confianca-${nivelConfianca.toLowerCase()}`}>
            {/* Top Bar */}
            <div className="assistente-top-bar">
                <div className="assistente-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sparkle-icon">
                        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
                    </svg>
                    <span>Assistente de Orçamento ZEISS</span>
                </div>

                <div className="top-acoes">
                    <button
                        type="button"
                        className={`btn-toggle-demo ${modoDemo ? 'ativo' : ''}`}
                        onClick={handleAlternarDemo}
                        title="Alternar entre base estrita da API ou base expandida de demonstração"
                    >
                        <span className="dot"></span>
                        <span className="label-demo">{modoDemo ? 'Dados de Demonstração: Ligado' : 'Apenas Dados da API'}</span>
                    </button>

                    {/* Badge da Escada de Confiança */}
                    {nivelConfianca === 'SEM_HISTORICO' && (
                        <span className="badge-confianca badge-sem-historico">
                            Sem Histórico (0 casos)
                        </span>
                    )}
                    {nivelConfianca === 'BAIXA' && (
                        <span className="badge-confianca badge-baixa">
                            Confiança Baixa ({quantidadeCasos} {quantidadeCasos === 1 ? 'caso' : 'casos'})
                        </span>
                    )}
                    {nivelConfianca === 'MEDIA' && (
                        <span className="badge-confianca badge-media">
                            Confiança Média ({quantidadeCasos} casos)
                        </span>
                    )}
                    {nivelConfianca === 'ALTA' && (
                        <span className="badge-confianca badge-alta">
                            Confiança Alta ({quantidadeCasos} casos)
                        </span>
                    )}
                </div>
            </div>

            {/* Mensagem de Orientação */}
            <div className="assistente-orientacao">
                <p>{mensagemOrientacao}</p>
            </div>

            {/* CENÁRIO 0 CASOS: Roteiro Técnico Padrão de Estimativa */}
            {nivelConfianca === 'SEM_HISTORICO' && (
                <div className="roteiro-estimativa-padrao">
                    <div className="roteiro-titulo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10 9 9 9 8 9"/>
                        </svg>
                        <span>Roteiro Padrão de Estimativa Técnica</span>
                    </div>
                    <ul className="roteiro-passos">
                        <li>
                            <strong>1. Análise Geométrica e Tolerâncias:</strong> Inspecione no modelo CAD/desenho o número de elementos dimensionais, complexidade de alinhamento e tolerâncias críticas GD&T.
                        </li>
                        <li>
                            <strong>2. Preparação & Fixação:</strong> Considere o tempo de climatização da peça no laboratório (20°C ± 1°C), construção de dispositivos de fixação dedicados ou magnéticos e calibração das ponteiras/sensores.
                        </li>
                        <li>
                            <strong>3. Ciclo de Medição & Relatório:</strong> Calcule o tempo de escaneamento/palpação por ciclo, repetibilidade exigida e elaboração do laudo final formalizado.
                        </li>
                    </ul>
                </div>
            )}

            {/* CENÁRIO 1 a 4 CASOS: Exibição Individual dos Casos Sem Faixa */}
            {nivelConfianca === 'BAIXA' && casosBase.length > 0 && (
                <div className="casos-individuais-bloco">
                    <div className="subtitulo-secao">Casos Similares Encontrados no Acervo:</div>
                    <div className="cards-casos-grid">
                        {casosBase.map(c => (
                            <div key={c.id} className="card-caso-simples">
                                <div className="card-caso-head">
                                    <span className="os-cod">{c.codigoOS}</span>
                                    <span className={`desvio-pill ${c.desvioPercentual > 0 ? 'pos' : 'neg'}`}>
                                        {c.desvioPercentual > 0 ? `+${c.desvioPercentual}%` : `${c.desvioPercentual}%`}
                                    </span>
                                </div>
                                <div className="card-caso-body">
                                    <div><strong>Horas Realizadas:</strong> {c.horasRealizadas}h (Orçado: {c.horasEstimadas}h)</div>
                                    <div className="card-obs">{c.observacao}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CENÁRIO 5+ CASOS: Faixa Provável (Quartis e Mediana) */}
            {(nivelConfianca === 'MEDIA' || nivelConfianca === 'ALTA') && (
                <div className="faixas-metricas-grid">
                    <div className="metrica-box quartil">
                        <span className="metrica-label">Quartil 1 (Q1)</span>
                        <span className="metrica-valor">{quartil1}h</span>
                        <span className="metrica-sub">Limite Mínimo Provável</span>
                    </div>

                    <div className="metrica-box mediana-destaque">
                        <span className="metrica-label">Mediana Histórica</span>
                        <span className="metrica-valor">{medianaHoras}h</span>
                        <span className="metrica-sub">Tendência Central</span>
                        {onAplicarHoras && (
                            <button
                                type="button"
                                className="btn-aplicar-horas"
                                onClick={() => onAplicarHoras(medianaHoras)}
                                title="Preencher Horas Estimadas com a Mediana Histórica"
                            >
                                Aplicar {medianaHoras}h
                            </button>
                        )}
                    </div>

                    <div className="metrica-box quartil">
                        <span className="metrica-label">Quartil 3 (Q3)</span>
                        <span className="metrica-valor">{quartil3}h</span>
                        <span className="metrica-sub">Limite Superior Provável</span>
                    </div>

                    {/* Exibe Fator de Correção APENAS se Confiança Alta (>= 15 casos) */}
                    {nivelConfianca === 'ALTA' && (
                        <div className="metrica-box fator-correcao">
                            <span className="metrica-label">Fator de Correção</span>
                            <span className="metrica-valor">{fatorCorrecao}x</span>
                            <span className="metrica-sub">
                                {fatorCorrecao > 1
                                    ? `+${Math.round((fatorCorrecao - 1) * 100)}% de Esforço Real`
                                    : 'Aderência Estável'}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Transparência Total: Botão Expansor de Casos Passados */}
            {casosBase.length > 0 && (
                <div className="transparencia-secao">
                    <button
                        type="button"
                        className="btn-expansor-casos"
                        onClick={() => setTabelaExpandida(!tabelaExpandida)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`chevron-icon ${tabelaExpandida ? 'aberto' : ''}`}
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                        <span>
                            {tabelaExpandida
                                ? 'Ocultar casos que compuseram esta estimativa'
                                : `Ver histórico completo de casos formalizados (${casosBase.length})`}
                        </span>
                    </button>

                    {tabelaExpandida && (
                        <div className="tabela-casos-wrapper">
                            <table className="tabela-casos-base">
                                <thead>
                                    <tr>
                                        <th>Código OS</th>
                                        <th>Tipo Serviço</th>
                                        <th>Horas Orçadas</th>
                                        <th>Horas Reais</th>
                                        <th>Desvio</th>
                                        <th>Valor Faturado</th>
                                        <th>Conclusão</th>
                                        <th>Aprendizado / Observação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {casosBase.map(c => (
                                        <tr key={c.id}>
                                            <td className="col-codigo">{c.codigoOS}</td>
                                            <td>{c.tipoServico}</td>
                                            <td>{c.horasEstimadas}h</td>
                                            <td className="col-reais">{c.horasRealizadas}h</td>
                                            <td>
                                                <span className={`pill-desvio ${c.desvioPercentual > 0 ? 'pos' : 'neg'}`}>
                                                    {c.desvioPercentual > 0 ? `+${c.desvioPercentual}%` : `${c.desvioPercentual}%`}
                                                </span>
                                            </td>
                                            <td>R$ {c.valorFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                            <td>{c.dataConclusao}</td>
                                            <td className="col-obs">{c.observacao || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
