import React, { useEffect, useMemo, useState } from 'react';
import { CriarServicoPayload, RegistroServico } from '../../../../../types/servico';
import { Solicitacao } from '../../../../../types/solicitacao';
import { TermoVocabulario } from '../../../../../types/vocabulario';
import { criarServico } from '../../../../../services/servicoService';
import { listarClasses, listarTermosPorClasse } from '../../../../../services/vocabularioService';
import { RecomendacaoOrcamento } from '../../../../../services/estatisticaServiceMock';
import { obterConfiguracoes } from '../../../../../services/configuracaoService';
import { useToast } from '../../../../../components/Toast';
import { VocabularioMultiSelect, TermoComClasse } from '../../../../../components/VocabularioMultiSelect/VocabularioMultiSelect';
import { AssistenteOrcamento } from './components/AssistenteOrcamento/AssistenteOrcamento';
import './ModalCriarServico.scss';

export interface ModalCriarServicoProps {
    aberto: boolean;
    onClose: () => void;
    onSucesso: (servicoCriado: RegistroServico) => void;
    solicitacaoOrigem?: Solicitacao | null;
    totalServicos?: number;
}

/**
 * Tenta identificar de forma inteligente o Tipo de Serviço baseado no valor da solicitação.
 */
function encontrarTipoServicoInteligente(servicoSolicitacao: string, termos: TermoVocabulario[]): number | '' {
    if (!servicoSolicitacao || termos.length === 0) return '';

    const s = servicoSolicitacao.toLowerCase().trim();

    // 1. Mapeamento semântico
    let termoCorrespondente = termos.find(t => {
        const desc = t.descricao.toLowerCase().trim();
        if (s === 'cmm' && (desc.includes('cmm') || desc.includes('mmc') || desc.includes('coordenadas'))) return true;
        if (s === 'tomografia' && (desc.includes('tomografia') || desc.includes('raio-x') || desc.includes('raio x'))) return true;
        if (s === 'digitalizacao-3d' && (desc.includes('digitalização 3d') || desc.includes('digitalizacao 3d') || desc.includes('engenharia reversa') || desc.includes('3d'))) return true;
        if (s === 'rugosidade' && (desc.includes('rugosidade') || desc.includes('rugosimetria') || desc.includes('perfilometria'))) return true;
        if (s === 'calibracao' && desc.includes('calibra')) return true;
        return s === 'treinamento' && (desc.includes('treinamento') || desc.includes('consultoria') || desc.includes('laudo'));
    });

    // 2. Fallback de substring direta
    if (!termoCorrespondente) {
        termoCorrespondente = termos.find(t =>
            s.includes(t.descricao.toLowerCase()) || t.descricao.toLowerCase().includes(s)
        );
    }

    return termoCorrespondente ? termoCorrespondente.id : '';
}

export const ModalCriarServico: React.FC<ModalCriarServicoProps> = ({
    aberto,
    onClose,
    onSucesso,
    solicitacaoOrigem,
    totalServicos = 0,
}) => {
    const { mostrarToast } = useToast();

    // Vocabulários carregados da base
    const [tiposServico, setTiposServico] = useState<TermoVocabulario[]>([]);
    const [recursos, setRecursos] = useState<TermoVocabulario[]>([]);
    const [caracteristicasPeca, setCaracteristicasPeca] = useState<TermoVocabulario[]>([]);

    // Estados do Formulário (Bloco A - Orçamento)
    const [codigo, setCodigo] = useState('');
    const [tipoServicoId, setTipoServicoId] = useState<number | ''>('');
    const [recursoId, setRecursoId] = useState<number | ''>('');
    const [caracteristicasPecaIds, setCaracteristicasPecaIds] = useState<number[]>([]);
    const [horasEstimadas, setHorasEstimadas] = useState<number | ''>('');
    const [custoEstimado, setCustoEstimado] = useState<number | ''>('');
    const [valorProposto, setValorProposto] = useState<number | ''>('');
    const [premissasAssumidas, setPremissasAssumidas] = useState('');
    const [justificativaDesvioAssistente, setJustificativaDesvioAssistente] = useState('');

    const [salvando, setSalvando] = useState(false);
    const [recomendacaoAtual, setRecomendacaoAtual] = useState<RecomendacaoOrcamento | null>(null);
    const [configuracoes, setConfiguracoes] = useState(obterConfiguracoes());

    // Sincroniza alterações nas configurações do sistema
    useEffect(() => {
        const handleConfig = () => setConfiguracoes(obterConfiguracoes());
        window.addEventListener('zeiss-configuracoes-alteradas', handleConfig);
        return () => window.removeEventListener('zeiss-configuracoes-alteradas', handleConfig);
    }, []);

    // Carregar Vocabulários
    useEffect(() => {
        if (!aberto) return;

        const carregarVocabularios = async () => {
            try {
                const classes = await listarClasses(true);
                for (const c of classes) {
                    const nomeLower = c.nome.toLowerCase();
                    if (nomeLower === 'tipo de serviço' || nomeLower === 'tipo de servico') {
                        const termos = await listarTermosPorClasse(c.id, true);
                        setTiposServico(termos);
                    } else if (nomeLower === 'recurso') {
                        const termos = await listarTermosPorClasse(c.id, true);
                        setRecursos(termos);
                    } else if (nomeLower === 'característica da peça' || nomeLower === 'caracteristica da peca') {
                        const termos = await listarTermosPorClasse(c.id, true);
                        setCaracteristicasPeca(termos);
                    }
                }
            } catch (err: unknown) {
                console.error('Erro ao carregar vocabulários no modal:', err);
            }
        };

        carregarVocabularios();
    }, [aberto]);

    // Inicialização ao abrir modal
    useEffect(() => {
        if (!aberto) return;

        const anoAtual = new Date().getFullYear();
        const numAleatorio = Math.floor(100 + Math.random() * 900);

        if (solicitacaoOrigem) {
            const sufixo = solicitacaoOrigem.codigo?.split('-').pop()?.replace(/\D/g, '') || numAleatorio;
            setCodigo(`OS-${anoAtual}-${sufixo}`);

            const tipoEncontrado = encontrarTipoServicoInteligente(solicitacaoOrigem.servico, tiposServico);
            setTipoServicoId(tipoEncontrado);

            setPremissasAssumidas(
                `Cliente: ${solicitacaoOrigem.empresa || solicitacaoOrigem.nome}\nContato: ${solicitacaoOrigem.email} | ${solicitacaoOrigem.telefone}\nQtd Peças: ${solicitacaoOrigem.quantidadePecas || '1'}\nDetalhes da Demanda: ${solicitacaoOrigem.mensagem || 'Conforme especificação enviada.'}`
            );
        } else {
            const sequencial = String(totalServicos + 1).padStart(3, '0');
            setCodigo(`OS-${anoAtual}-${sequencial}-${numAleatorio}`);
            setTipoServicoId('');
            setPremissasAssumidas('');
        }

        setRecursoId('');
        setCaracteristicasPecaIds([]);
        setHorasEstimadas('');
        setCustoEstimado('');
        setValorProposto('');
        setJustificativaDesvioAssistente('');
        setRecomendacaoAtual(null);
    }, [aberto, solicitacaoOrigem, tiposServico, totalServicos]);

    // 1. RECURSOS CONDICIONAIS AO TIPO DE SERVIÇO
    // - MMC → "Prismo", "DuraMax", "OInspect"
    // - Digitalização 3D → "T-Scan", "ATOS Q", "Zeiss Inspect"
    // - Raio-X / Tomografia → "Bosello", "Zeiss Inspect"
    // - Engenharia Reversa → "ZRE"
    // - Elaboração de Laudo → Todos os recursos disponíveis
    const recursosFiltrados = useMemo(() => {
        if (!tipoServicoId) return recursos;
        const tipoObj = tiposServico.find(t => t.id === tipoServicoId);
        if (!tipoObj) return recursos;

        const descTipo = tipoObj.descricao
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        const atendeRecurso = (descricaoRecurso: string, permitidos: string[]) => {
            const rNorm = descricaoRecurso
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
            return permitidos.some(p => {
                const pNorm = p.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                return rNorm.includes(pNorm) || pNorm.includes(rNorm);
            });
        };

        if (descTipo.includes('mmc') || descTipo.includes('cmm') || descTipo.includes('coordenadas')) {
            return recursos.filter(r => atendeRecurso(r.descricao, ['Prismo', 'DuraMax', 'OInspect']));
        }
        if (descTipo.includes('digitalizacao') || (descTipo.includes('3d') && !descTipo.includes('reversa'))) {
            return recursos.filter(r => atendeRecurso(r.descricao, ['T-Scan', 'ATOS Q', 'Zeiss Inspect']));
        }
        if (descTipo.includes('raio') || descTipo.includes('tomografia') || descTipo.includes('rx')) {
            return recursos.filter(r => atendeRecurso(r.descricao, ['Bosello', 'Zeiss Inspect']));
        }
        if (descTipo.includes('reversa')) {
            return recursos.filter(r => atendeRecurso(r.descricao, ['ZRE']));
        }
        if (descTipo.includes('laudo')) {
            return recursos; // Elaboração de laudo pode utilizar qualquer equipamento
        }

        return recursos;
    }, [tipoServicoId, tiposServico, recursos]);

    // Reseta recurso selecionado se não for compatível com o novo tipo de serviço
    useEffect(() => {
        if (recursoId && recursosFiltrados.length > 0) {
            const compatível = recursosFiltrados.some(r => r.id === recursoId);
            if (!compatível) {
                setRecursoId('');
            }
        }
    }, [recursosFiltrados, recursoId]);

    // Termos de Características convertidos para o MultiSelect
    const caracteristicasTermosComClasse: TermoComClasse[] = useMemo(() => {
        return caracteristicasPeca.map(c => ({
            ...c,
            classeNome: 'Características da Peça'
        }));
    }, [caracteristicasPeca]);

    // Metadados para o assistente
    const tipoServicoNomeSelecionado = useMemo(() => {
        return tiposServico.find(t => t.id === tipoServicoId)?.descricao || '';
    }, [tiposServico, tipoServicoId]);

    const caracteristicasNomesSelecionadas = useMemo(() => {
        return caracteristicasPeca
            .filter(c => caracteristicasPecaIds.includes(c.id))
            .map(c => c.descricao);
    }, [caracteristicasPeca, caracteristicasPecaIds]);

    // REVERSÃO E VERIFICAÇÃO DE DESVIO DO ASSISTENTE
    // Se a confiança for MÉDIA ou ALTA, e as horas estimadas estiverem fora do intervalo [Q1, Q3]
    // ou divergirem da mediana além da sensibilidade configurada, a justificativa torna-se obrigatória!
    const desvioAssistenteDetectado = useMemo(() => {
        if (horasEstimadas === '' || !recomendacaoAtual) return false;
        const { nivelConfianca, quartil1, quartil3, medianaHoras } = recomendacaoAtual;
        if (nivelConfianca !== 'MEDIA' && nivelConfianca !== 'ALTA') return false;

        const sensibilidadeRatio = (configuracoes.sensibilidadeDesvioAssistente || 15) / 100;

        const h = Number(horasEstimadas);
        const foraQuartis = h < quartil1 || h > quartil3;
        const foraSensibilidade = medianaHoras > 0 && Math.abs(h - medianaHoras) / medianaHoras > sensibilidadeRatio;

        return foraQuartis || foraSensibilidade;
    }, [horasEstimadas, recomendacaoAtual, configuracoes]);

    const handleSalvar = async () => {
        if (!tipoServicoId) {
            mostrarToast('error', 'Selecione o Tipo de Serviço.');
            return;
        }

        if (!recursoId) {
            mostrarToast('error', 'Selecione o Recurso / Máquina compatível.');
            return;
        }

        if (caracteristicasPecaIds.length === 0) {
            mostrarToast('error', 'Selecione ao menos uma Característica da Peça.');
            return;
        }

        if (horasEstimadas === '' || custoEstimado === '' || valorProposto === '') {
            mostrarToast('error', 'Preencha as horas estimadas, custo estimado e valor proposto.');
            return;
        }

        if (desvioAssistenteDetectado && !justificativaDesvioAssistente.trim()) {
            mostrarToast(
                'error',
                'O valor de esforço informado está fora da faixa recomendada. É obrigatório fornecer uma Justificativa de Desvio.'
            );
            return;
        }

        const codigoFinal = codigo.trim() || `OS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

        const payload: CriarServicoPayload = {
            codigo: codigoFinal,
            tipoServicoId: Number(tipoServicoId),
            recursoId: Number(recursoId),
            caracteristicasPecaIds,
            horasEstimadas: Number(horasEstimadas),
            custoEstimado: Number(custoEstimado),
            valorProposto: Number(valorProposto),
            premissasAssumidas,
            justificativaDesvioAssistente: justificativaDesvioAssistente.trim() || undefined,
        };

        setSalvando(true);
        try {
            const criado = await criarServico(payload);
            mostrarToast('success', `Ordem de Serviço ${criado.codigo} criada com sucesso!`);
            onSucesso(criado);
            onClose();
        } catch (err: unknown) {
            mostrarToast('error', 'Falha ao salvar a Ordem de Serviço.');
        } finally {
            setSalvando(false);
        }
    };

    if (!aberto) return null;

    return (
        <div className="modal-criar-servico-overlay" onClick={onClose}>
            <div className="modal-criar-servico-box" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-criar-servico-header">
                    <div className="header-meta">
                        <span className="os-title">
                            {solicitacaoOrigem ? 'Registrar Ordem de Serviço' : 'Nova Ordem de Serviço'}
                        </span>
                        <span className="header-sub">
                            {solicitacaoOrigem
                                ? `Vincular a solicitação ${solicitacaoOrigem.codigo} às estimativas do laboratório (Bloco A)`
                                : 'Cadastro da estimativa inicial do laboratório (Bloco A - Orçamento)'}
                        </span>
                    </div>
                    <button className="btn-close-modal" onClick={onClose} title="Fechar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="modal-criar-servico-body two-columns">
                    <div className="modal-col-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Tipo de Serviço *</label>
                                <select
                                    value={tipoServicoId}
                                    onChange={(e) => setTipoServicoId(e.target.value === '' ? '' : Number(e.target.value))}
                                >
                                    <option value="">Selecione o Tipo de Serviço...</option>
                                    {tiposServico.map(t => (
                                        <option key={t.id} value={t.id}>{t.descricao}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>
                                    Recurso / Máquina *
                                    {tipoServicoId && (
                                        <span style={{ fontWeight: 400, color: '#64748b', marginLeft: '4px' }}>
                                            ({recursosFiltrados.length} disponível{recursosFiltrados.length === 1 ? '' : 'is'})
                                        </span>
                                    )}
                                </label>
                                <select
                                    value={recursoId}
                                    onChange={(e) => setRecursoId(e.target.value === '' ? '' : Number(e.target.value))}
                                    disabled={!tipoServicoId}
                                >
                                    <option value="">
                                        {!tipoServicoId
                                            ? 'Selecione primeiro o Tipo de Serviço'
                                            : 'Selecione o equipamento adequado...'}
                                    </option>
                                    {recursosFiltrados.map(r => (
                                        <option key={r.id} value={r.id}>{r.descricao}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group full-width">
                                <VocabularioMultiSelect
                                    termos={caracteristicasTermosComClasse}
                                    selecionadosIds={caracteristicasPecaIds}
                                    onChange={setCaracteristicasPecaIds}
                                    placeholder="Pesquisar e selecionar características da peça..."
                                    label="Características da Peça *"
                                />
                            </div>

                            <div className="form-row-3">
                                <div className={`form-group ${desvioAssistenteDetectado ? 'campo-com-desvio' : ''}`}>
                                    <div className="label-row-compact">
                                        <label>Horas Estimadas *</label>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0.5"
                                        value={horasEstimadas}
                                        className={desvioAssistenteDetectado ? 'input-alerta-desvio' : ''}
                                        onChange={(e) => setHorasEstimadas(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="Ex: 18.5"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Custo Estimado (R$) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={custoEstimado}
                                        onChange={(e) => setCustoEstimado(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="Ex: 3800.00"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Valor Proposto (R$) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={valorProposto}
                                        onChange={(e) => setValorProposto(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="Ex: 5500.00"
                                    />
                                </div>
                            </div>

                            {(desvioAssistenteDetectado || justificativaDesvioAssistente) && (
                                <div className="form-group full-width justificativa-destaque-clean">
                                    <div className="label-row-compact">
                                        <label>Justificativa Técnica do Desvio *</label>
                                        <span className="justificativa-hint-sub">Obrigatória para horas fora da faixa recomendada</span>
                                    </div>
                                    <textarea
                                        rows={2}
                                        value={justificativaDesvioAssistente}
                                        onChange={(e) => setJustificativaDesvioAssistente(e.target.value)}
                                        placeholder="Explique tecnicamente por que o esforço desta OS difere da faixa histórica sugerida..."
                                    />
                                </div>
                            )}

                            <div className="form-group full-width">
                                <label>Premissas Assumidas</label>
                                <textarea
                                    rows={2}
                                    value={premissasAssumidas}
                                    className="premissas-area"
                                    onChange={(e) => setPremissasAssumidas(e.target.value)}
                                    placeholder="Informações preliminares, tolerâncias exigidas, restrições e condições de contorno..."
                                    style={{'minHeight': '120px'}}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-col-assistente">
                        <AssistenteOrcamento
                            tipoServicoId={tipoServicoId}
                            tipoServicoNome={tipoServicoNomeSelecionado}
                            caracteristicasIds={caracteristicasPecaIds}
                            caracteristicasNomes={caracteristicasNomesSelecionadas}
                            horasInformadas={horasEstimadas}
                            onAplicarHoras={(horas, custoCalculado) => {
                                setHorasEstimadas(horas);
                                if (custoCalculado !== undefined && custoCalculado > 0) {
                                    setCustoEstimado(custoCalculado.toFixed(2));
                                } else if ((!custoEstimado || custoEstimado === '0') && configuracoes.valorHoraLaboratorio > 0) {
                                    setCustoEstimado((horas * configuracoes.valorHoraLaboratorio).toFixed(2));
                                }
                            }}
                            onRecomendacaoAtualizada={setRecomendacaoAtual}
                        />
                    </div>
                </div>

                <div className="modal-criar-servico-footer">
                    <button type="button" className="btn-secondary" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="btn-primary-action"
                        onClick={handleSalvar}
                        disabled={salvando || (desvioAssistenteDetectado && !justificativaDesvioAssistente.trim())}
                        title={
                            desvioAssistenteDetectado && !justificativaDesvioAssistente.trim()
                                ? 'Preencha a justificativa técnica de desvio para liberar o salvamento'
                                : 'Criar e orçar Ordem de Serviço'
                        }
                    >
                        {salvando ? 'Criando OS...' : 'Criar Ordem de Serviço'}
                    </button>
                </div>
            </div>
        </div>
    );
};
