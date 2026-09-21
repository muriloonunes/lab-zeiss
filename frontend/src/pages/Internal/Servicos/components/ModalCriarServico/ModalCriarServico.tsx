import React, { useEffect, useMemo, useState } from 'react';
import { CriarServicoPayload, RegistroServico } from '../../../../types/servico';
import { Solicitacao } from '../../../../types/solicitacao';
import { TermoVocabulario } from '../../../../types/vocabulario';
import { criarServico } from '../../../../services/servicoService';
import { listarClasses, listarTermosPorClasse } from '../../../../services/vocabularioService';
import { useToast } from '../../../../components/Toast';
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
        if (s === 'treinamento' && (desc.includes('treinamento') || desc.includes('consultoria') || desc.includes('laudo'))) return true;
        return false;
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

    // Filtro de busca para a lista de características
    const [filtroBuscaCaracteristica, setFiltroBuscaCaracteristica] = useState('');
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
        setFiltroBuscaCaracteristica('');
    }, [aberto, solicitacaoOrigem, tiposServico, totalServicos]);

    // Filtragem de características na busca
    const caracteristicasFiltradas = useMemo(() => {
        if (!filtroBuscaCaracteristica.trim()) return caracteristicasPeca;
        const q = filtroBuscaCaracteristica.toLowerCase();
        return caracteristicasPeca.filter(c => c.descricao.toLowerCase().includes(q));
    }, [caracteristicasPeca, filtroBuscaCaracteristica]);

    const toggleCaracteristica = (id: number) => {
        setCaracteristicasPecaIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

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

                        {/* Características da Peça */}
                        <div className="form-group full-width">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label>
                                    Características da Peça * ({caracteristicasPecaIds.length} selecionada{caracteristicasPecaIds.length === 1 ? '' : 's'})
                                </label>
                                <input
                                    type="text"
                                    placeholder="Filtrar características..."
                                    value={filtroBuscaCaracteristica}
                                    onChange={(e) => setFiltroBuscaCaracteristica(e.target.value)}
                                    style={{
                                        padding: '0.2rem 0.5rem',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '4px',
                                        fontSize: '0.74rem',
                                        width: '180px'
                                    }}
                                />
                            </div>
                            <div style={{
                                maxHeight: '130px',
                                overflowY: 'auto',
                                background: '#f8fafc',
                                padding: '0.6rem',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.4rem'
                            }}>
                                {caracteristicasFiltradas.length === 0 ? (
                                    <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                        Nenhuma característica encontrada.
                                    </span>
                                ) : (
                                    caracteristicasFiltradas.map(c => {
                                        const selecionado = caracteristicasPecaIds.includes(c.id);
                                        return (
                                            <button
                                                type="button"
                                                key={c.id}
                                                onClick={() => toggleCaracteristica(c.id)}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.35rem',
                                                    padding: '0.25rem 0.6rem',
                                                    borderRadius: '16px',
                                                    fontSize: '0.76rem',
                                                    cursor: 'pointer',
                                                    border: selecionado ? '1px solid #141e8c' : '1px solid #cbd5e1',
                                                    background: selecionado ? '#141e8c' : '#ffffff',
                                                    color: selecionado ? '#ffffff' : '#334155',
                                                    fontWeight: selecionado ? 600 : 400,
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                <span>{selecionado ? '✓ ' : '+ '}{c.descricao}</span>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Premissas Assumidas */}
                        <div className="form-group full-width">
                            <label>Premissas Assumidas</label>
                            <textarea
                                rows={3}
                                value={premissasAssumidas}
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
                        disabled={salvando}
                    >
                        {salvando ? 'Criando OS...' : 'Criar Ordem de Serviço'}
                    </button>
                </div>
            </div>
        </div>
    );
};
