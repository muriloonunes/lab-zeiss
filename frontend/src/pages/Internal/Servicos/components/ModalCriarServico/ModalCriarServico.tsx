import React, { useEffect, useMemo, useState } from 'react';
import { CriarServicoPayload, RegistroServico } from '../../../../../types/servico';
import { Solicitacao } from '../../../../../types/solicitacao';
import { TermoVocabulario } from '../../../../../types/vocabulario';
import { criarServico } from '../../../../../services/servicoService';
import { listarClasses, listarTermosPorClasse } from '../../../../../services/vocabularioService';
import { useToast } from '../../../../../components/Toast';
import { VocabularioMultiSelect, TermoComClasse } from '../../../../../components/VocabularioMultiSelect/VocabularioMultiSelect';
import { AssistenteOrcamento } from '../AssistenteOrcamento/AssistenteOrcamento';
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

    // Vocabulários
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
    const [temDivergenciaAssistente, setTemDivergenciaAssistente] = useState(false);
    const [salvando, setSalvando] = useState(false);

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
            // Criando a partir de uma solicitação
            const sufixo = solicitacaoOrigem.codigo?.split('-').pop()?.replace(/\D/g, '') || numAleatorio;
            setCodigo(`OS-${anoAtual}-${sufixo}`);

            const tipoEncontrado = encontrarTipoServicoInteligente(solicitacaoOrigem.servico, tiposServico);
            setTipoServicoId(tipoEncontrado);

            setPremissasAssumidas(
                `Cliente: ${solicitacaoOrigem.empresa || solicitacaoOrigem.nome}\nContato: ${solicitacaoOrigem.email} | ${solicitacaoOrigem.telefone}\nQtd Peças: ${solicitacaoOrigem.quantidadePecas || '1'}\nDetalhes da Demanda: ${solicitacaoOrigem.mensagem || 'Conforme especificação enviada.'}`
            );
        } else {
            // Criando OS avulsa
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
        setTemDivergenciaAssistente(false);
    }, [aberto, solicitacaoOrigem, tiposServico, totalServicos]);

    // Mapeia as características da peça para o formato TermoComClasse do VocabularioMultiSelect
    const termosCaracteristicas: TermoComClasse[] = useMemo(() => {
        return caracteristicasPeca.map(c => ({
            ...c,
            classeNome: 'Características da Peça'
        }));
    }, [caracteristicasPeca]);

    const handleSalvar = async () => {
        if (!tipoServicoId) {
            mostrarToast('error', 'Selecione o Tipo de Serviço.');
            return;
        }

        if (!recursoId) {
            mostrarToast('error', 'Selecione o Recurso / Máquina.');
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

        if (temDivergenciaAssistente && !justificativaDesvioAssistente.trim()) {
            mostrarToast('error', 'Justifique a divergência de horas em relação ao histórico do Assistente de Orçamento.');
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
            justificativaDesvioAssistente,
        };

        setSalvando(true);
        try {
            const criado = await criarServico(payload);
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

                {/* Body */}
                <div className="modal-criar-servico-body">
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
                            <label>Recurso / Máquina *</label>
                            <select
                                value={recursoId}
                                onChange={(e) => setRecursoId(e.target.value === '' ? '' : Number(e.target.value))}
                            >
                                <option value="">Selecione o equipamento...</option>
                                {recursos.map(r => (
                                    <option key={r.id} value={r.id}>{r.descricao}</option>
                                ))}
                            </select>
                        </div>

                        {/* Características da Peça com VocabularioMultiSelect */}
                        <div className="form-group full-width">
                            <VocabularioMultiSelect
                                label={`Características da Peça * (${caracteristicasPecaIds.length} selecionada${caracteristicasPecaIds.length === 1 ? '' : 's'})`}
                                termos={termosCaracteristicas}
                                selecionadosIds={caracteristicasPecaIds}
                                onChange={setCaracteristicasPecaIds}
                                placeholder="Pesquisar e selecionar características da peça..."
                            />
                        </div>

                        {/* Assistente Inteligente de Orçamento */}
                        <div className="form-group full-width">
                            <AssistenteOrcamento
                                tipoServicoId={tipoServicoId}
                                caracteristicasPecaIds={caracteristicasPecaIds}
                                horasEstimadas={horasEstimadas}
                                justificativa={justificativaDesvioAssistente}
                                onJustificativaChange={setJustificativaDesvioAssistente}
                                onAplicarHorasRecomendadas={(mediana) => setHorasEstimadas(mediana)}
                                onDivergenciaChange={setTemDivergenciaAssistente}
                            />
                        </div>

                        {/* Linha com os 3 campos de estimativas lado a lado */}
                        <div className="form-row-3">
                            <div className="form-group">
                                <label>Horas Estimadas *</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={horasEstimadas}
                                    onChange={(e) => setHorasEstimadas(e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder="Ex: 4"
                                />
                            </div>

                            <div className="form-group">
                                <label>Custo Estimado (R$) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={custoEstimado}
                                    onChange={(e) => setCustoEstimado(e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder="Ex: 400.00"
                                />
                            </div>

                            <div className="form-group">
                                <label>Valor Proposto (R$) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={valorProposto}
                                    onChange={(e) => setValorProposto(e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder="Ex: 800.00"
                                />
                            </div>
                        </div>

                        {/* Premissas Assumidas */}
                        <div className="form-group full-width">
                            <label>Premissas Assumidas</label>
                            <textarea
                                rows={3}
                                value={premissasAssumidas}
                                className="premissas-area"
                                onChange={(e) => setPremissasAssumidas(e.target.value)}
                                placeholder="Informações técnicas preliminares, tolerâncias exigidas, restrições..."
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-criar-servico-footer">
                    <button type="button" className="btn-secondary" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="btn-primary-action"
                        onClick={handleSalvar}
                        disabled={salvando || (temDivergenciaAssistente && !justificativaDesvioAssistente.trim())}
                        title={temDivergenciaAssistente && !justificativaDesvioAssistente.trim() ? 'Preencha a justificativa da divergência para habilitar a criação da OS' : ''}
                    >
                        {salvando ? 'Criando OS...' : 'Criar Ordem de Serviço'}
                    </button>
                </div>
            </div>
        </div>
    );
};
