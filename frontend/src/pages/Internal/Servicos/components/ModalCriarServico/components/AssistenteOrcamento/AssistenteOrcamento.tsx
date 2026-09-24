import React, { useEffect, useState } from 'react';
import {
    obterRecomendacaoOrcamento,
    RecomendacaoOrcamento,
    isModoDemoAtivo,
    setModoDemoAtivo
} from '../../../../../../../services/estatisticaServiceMock';
import './AssistenteOrcamento.scss';

export interface AssistenteOrcamentoProps {
    tipoServicoId: number | '';
    tipoServicoNome?: string;
    caracteristicasIds: number[];
    caracteristicasNomes?: string[];
    horasInformadas?: number | '';
    onAplicarHoras?: (horas: number) => void;
    onRecomendacaoAtualizada?: (recomendacao: RecomendacaoOrcamento) => void;
}

export const AssistenteOrcamento: React.FC<AssistenteOrcamentoProps> = ({
    tipoServicoId,
    tipoServicoNome = '',
    caracteristicasIds,
    caracteristicasNomes = [],
    horasInformadas = '',
    onAplicarHoras,
    onRecomendacaoAtualizada
}) => {
    const [carregando, setCarregando] = useState(false);
    const [recomendacao, setRecomendacao] = useState<RecomendacaoOrcamento | null>(null);
    const [modalCasosAberto, setModalCasosAberto] = useState(false);
    const [modoDemo, setModoDemo] = useState(isModoDemoAtivo());

    // Sincroniza estado de demonstração
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

    // Fecha o card sobreposto se os filtros mudarem
    useEffect(() => {
        setModalCasosAberto(false);
    }, [tipoServicoId, caracteristicasIds]);

    // Consulta reativa
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
                console.error('Erro ao consultar assistente:', err);
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

    const aguardandoGatilho = !tipoServicoId || caracteristicasIds.length === 0;

    return (
        <div className="assistente-minimalista">
            {/* Header Limpo */}
            <div className="assistente-header-clean">
                <div className="assistente-brand">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sparkle-icon">
                        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
                    </svg>
                    <span className="titulo-assistente">Assistente de Estimativa</span>
                </div>

                <div className="assistente-header-right">
                    <button
                        type="button"
                        className={`toggle-demo-clean ${modoDemo ? 'ativo' : ''}`}
                        onClick={handleAlternarDemo}
                        title="Alternar entre base estrita da API ou base expandida de demonstração"
                    >
                        <span className="demo-dot"></span>
                        <span className="demo-txt">{modoDemo ? 'Demo: Ativo' : 'Apenas API'}</span>
                    </button>

                    {!aguardandoGatilho && recomendacao && (
                        <span className={`status-pill ${recomendacao.nivelConfianca.toLowerCase()}`}>
                            {recomendacao.nivelConfianca === 'SEM_HISTORICO' && 'Sem Histórico'}
                            {recomendacao.nivelConfianca === 'BAIXA' && `Baixa Confiança (${recomendacao.quantidadeCasos})`}
                            {recomendacao.nivelConfianca === 'MEDIA' && `Média Confiança (${recomendacao.quantidadeCasos})`}
                            {recomendacao.nivelConfianca === 'ALTA' && `Alta Confiança (${recomendacao.quantidadeCasos})`}
                        </span>
                    )}
                </div>
            </div>

            {/* Conteúdo Central */}
            <div className="assistente-content-area">
                {aguardandoGatilho ? (
                    <div className="estado-espera-clean">
                        <div className="espera-circulo-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                        </div>
                        <p className="espera-lead">Inteligência baseada no histórico</p>
                        <p className="espera-sub">
                            Defina o <strong>Tipo de Serviço</strong> e ao menos uma <strong>Característica da Peça</strong> para carregar as referências históricas do laboratório.
                        </p>
                    </div>
                ) : carregando ? (
                    <div className="estado-carregando-clean">
                        <div className="spinner-clean"></div>
                        <span>Consultando acervo de lições formalizadas...</span>
                    </div>
                ) : recomendacao ? (
                    <>
                        {/* CENÁRIO 1: SEM HISTÓRICO (0 Casos) */}
                        {recomendacao.nivelConfianca === 'SEM_HISTORICO' && (
                            <div className="secao-roteiro-clean">
                                <p className="orientacao-texto-clean">{recomendacao.mensagemOrientacao}</p>
                                <div className="checklist-passos">
                                    <div className="passo-item">
                                        <span className="passo-num">1</span>
                                        <div className="passo-info">
                                            <strong>Geometria & Tolerâncias</strong>
                                            <p>Analise a quantidade de cotas críticas e alinhamento GD&T no desenho.</p>
                                        </div>
                                    </div>
                                    <div className="passo-item">
                                        <span className="passo-num">2</span>
                                        <div className="passo-info">
                                            <strong>Setup & Climatização</strong>
                                            <p>Preveja estabilização térmica (20°C) e fixadores magnéticos/dedicados.</p>
                                        </div>
                                    </div>
                                    <div className="passo-item">
                                        <span className="passo-num">3</span>
                                        <div className="passo-info">
                                            <strong>Ciclo & Relatório</strong>
                                            <p>Calcule tempo de apalpação/escaneamento e elaboração do laudo.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CENÁRIO 2: CONFIANÇA BAIXA (1 a 4 Casos) */}
                        {recomendacao.nivelConfianca === 'BAIXA' && (
                            <div className="secao-baixa-clean">
                                <p className="orientacao-texto-clean">{recomendacao.mensagemOrientacao}</p>
                                <div className="card-aviso-baixa">
                                    <div className="aviso-icone">ℹ️</div>
                                    <div className="aviso-conteudo">
                                        <strong>Poucos registros prévios encontrados</strong>
                                        <p>Para estimar com segurança, consulte os detalhes individuais dos casos similares.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn-abrir-overlay-casos"
                                    onClick={() => setModalCasosAberto(true)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                    </svg>
                                    <span>Visualizar os {recomendacao.casosBase.length} casos históricos</span>
                                </button>
                            </div>
                        )}

                        {/* CENÁRIO 3 & 4: CONFIANÇA MÉDIA / ALTA (5+ Casos) */}
                        {(recomendacao.nivelConfianca === 'MEDIA' || recomendacao.nivelConfianca === 'ALTA') && (
                            <div className="secao-estimativa-clean">
                                {/* Destaque da Mediana */}
                                <div className="bloco-mediana-destaque">
                                    <div className="mediana-esquerda">
                                        <span className="mediana-caption">Mediana Sugerida</span>
                                        <div className="mediana-valor-linha">
                                            <span className="mediana-num">{recomendacao.medianaHoras}</span>
                                            <span className="mediana-unidade">horas</span>
                                        </div>
                                    </div>

                                    {onAplicarHoras && (
                                        <button
                                            type="button"
                                            className="btn-usar-mediana"
                                            onClick={() => onAplicarHoras(recomendacao.medianaHoras)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                                                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            <span>Usar {recomendacao.medianaHoras}h</span>
                                        </button>
                                    )}
                                </div>

                                {/* Régua da Faixa Provável (Q1 a Q3) */}
                                <div className="regua-faixa-container">
                                    <div className="regua-labels">
                                        <span className="regua-label-q">Mín. provável (Q1): <strong>{recomendacao.quartil1}h</strong></span>
                                        <span className="regua-label-q">Máx. provável (Q3): <strong>{recomendacao.quartil3}h</strong></span>
                                    </div>
                                    <div className="regua-trilho">
                                        <div className="regua-preenchimento"></div>
                                        <div className="regua-marcador-mediana" title={`Mediana: ${recomendacao.medianaHoras}h`}></div>
                                    </div>
                                </div>

                                {/* Fator de Correção (Apenas Alta Confiança) */}
                                {recomendacao.nivelConfianca === 'ALTA' && (
                                    <div className="tag-fator-correcao">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="12" y1="19" x2="12" y2="5"/>
                                            <polyline points="5 12 12 5 19 12"/>
                                        </svg>
                                        <span>
                                            Tendência histórica: <strong>+{Math.round((recomendacao.fatorCorrecao - 1) * 100)}% de esforço real</strong> vs. orçado.
                                        </span>
                                    </div>
                                )}

                                {/* Feedback Reativo às Horas Informadas no Formulário */}
                                {horasInformadas !== '' && (
                                    <>
                                        {(Number(horasInformadas) < recomendacao.quartil1 || Number(horasInformadas) > recomendacao.quartil3) ? (
                                            <div className="card-feedback-horas desvio">
                                                <div className="feedback-horas-head">
                                                    <span className="feedback-horas-icon">⚠️</span>
                                                    <strong>{horasInformadas}h informadas</strong>
                                                    <span className="badge-tag-desvio">Fora da faixa</span>
                                                </div>
                                                <p>
                                                    Diverge da faixa provável ({recomendacao.quartil1}h - {recomendacao.quartil3}h). A justificativa técnica é obrigatória para salvar.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="card-feedback-horas alinhado">
                                                <div className="feedback-horas-head">
                                                    <span className="feedback-horas-icon">✓</span>
                                                    <strong>{horasInformadas}h informadas</strong>
                                                    <span className="badge-tag-alinhado">Alinhado à faixa histórica</span>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                <p className="orientacao-texto-clean">{recomendacao.mensagemOrientacao}</p>

                                {/* Botão para Abrir Card de Casos Sobreposto */}
                                <div className="transparencia-clean">
                                    <button
                                        type="button"
                                        className="btn-abrir-overlay-link"
                                        onClick={() => setModalCasosAberto(true)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M15 3h6v6"/>
                                            <path d="M10 14 21 3"/>
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                        </svg>
                                        <span>Consultar os {recomendacao.casosBase.length} casos que geraram o cálculo</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : null}
            </div>

            {/* CARD SOBREPOSTO DE CASOS HISTÓRICOS (OVERLAY CARD) */}
            {modalCasosAberto && recomendacao && recomendacao.casosBase.length > 0 && (
                <div className="card-sobreposto-casos">
                    {/* Header do Card Sobreposto */}
                    <div className="sobreposto-header">
                        <div className="sobreposto-titulo-area">
                            <span className="sobreposto-titulo">
                                Casos Históricos de Referência ({recomendacao.casosBase.length})
                            </span>
                            <span className="sobreposto-subtitulo">
                                {tipoServicoNome || 'Serviços'} • Lições formalizadas no encerramento
                            </span>
                        </div>
                        <button
                            type="button"
                            className="btn-fechar-sobreposto"
                            onClick={() => setModalCasosAberto(false)}
                            title="Voltar ao Assistente"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>

                    {/* Lista com scroll dos casos */}
                    <div className="sobreposto-lista-casos">
                        {recomendacao.casosBase.map((c) => (
                            <div key={c.id} className="card-caso-detalhe">
                                <div className="caso-detalhe-topo">
                                    <span className="os-badge">{c.codigoOS}</span>
                                    <div className="caso-badges-right">
                                        <span className={`pill-desvio-clean ${c.desvioPercentual > 0 ? 'pos' : 'neg'}`}>
                                            {c.desvioPercentual > 0 ? `+${c.desvioPercentual}%` : `${c.desvioPercentual}%`}
                                        </span>
                                        <span className="data-conclusao">{c.dataConclusao}</span>
                                    </div>
                                </div>

                                <div className="caso-metricas-row">
                                    <div className="metrica-item">
                                        <span className="m-label">Orçado:</span>
                                        <span className="m-val">{c.horasEstimadas}h</span>
                                    </div>
                                    <div className="metrica-item destaque">
                                        <span className="m-label">Realizado:</span>
                                        <span className="m-val">{c.horasRealizadas}h</span>
                                    </div>
                                    <div className="metrica-item">
                                        <span className="m-label">Faturado:</span>
                                        <span className="m-val">R$ {c.valorFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>

                                {c.observacao && (
                                    <div className="caso-licao-box">
                                        <span className="licao-tag">Lição / Observação:</span>
                                        <p className="licao-texto">{c.observacao}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer do Card Sobreposto */}
                    <div className="sobreposto-footer">
                        <button
                            type="button"
                            className="btn-fechar-rodape"
                            onClick={() => setModalCasosAberto(false)}
                        >
                            Voltar ao Assistente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
