import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useAuth} from '../../../context/AuthContext';
import {useToast} from '../../../components/Toast';
import {ClasseVocabulario, TermoVocabulario} from '../../../types/vocabulario';
import {
    alternarStatusClasse,
    alternarStatusTermo,
    atualizarNomeClasse,
    atualizarTermo,
    criarClasse,
    criarTermo,
    listarClasses,
    listarTermosPorClasse,
} from '../../../services/vocabularioService';
import {
    assinarTermo,
    desassinarTermo,
    listarMinhasAssinaturas,
    listarMinhasClassesAssinadas,
} from '../../../services/assinaturaService';
import {ApiError} from '../../../types/api';
import './Vocabulario.scss';

export const Vocabulario: React.FC = () => {
    const {isAdmin} = useAuth();
    const {mostrarToast} = useToast();

    // Dados principais
    const [classes, setClasses] = useState<ClasseVocabulario[]>([]);
    const [classeSelecionada, setClasseSelecionada] = useState<ClasseVocabulario | null>(null);
    const [termos, setTermos] = useState<TermoVocabulario[]>([]);
    const [minhasAssinaturas, setMinhasAssinaturas] = useState<number[]>([]);
    const [classesComAssinatura, setClassesComAssinatura] = useState<number[]>([]);

    // Ref para preservar a classe selecionada durante recargas (ex: alternar inativos)
    const classeSelecionadaRef = useRef<ClasseVocabulario | null>(null);
    useEffect(() => {
        classeSelecionadaRef.current = classeSelecionada;
    }, [classeSelecionada]);

    // Estados de carregamento
    const [carregandoClasses, setCarregandoClasses] = useState(true);
    const [carregandoTermos, setCarregandoTermos] = useState(false);
    const [salvandoModal, setSalvandoModal] = useState(false);

    // Filtros e busca (exibirInativos com persistência em localStorage)
    const [buscaClasse, setBuscaClasse] = useState('');
    const [buscaTermo, setBuscaTermo] = useState('');
    const [filtroAba, setFiltroAba] = useState<'TODOS' | 'ASSINADOS'>('TODOS');
    const [exibirInativos, setExibirInativos] = useState<boolean>(() => {
        return localStorage.getItem('vocabulario_exibir_inativos') === 'true';
    });

    const handleToggleExibirInativos = (checked: boolean) => {
        setExibirInativos(checked);
        localStorage.setItem('vocabulario_exibir_inativos', String(checked));
    };

    // Modais
    const [modalCriarClasseAberto, setModalCriarClasseAberto] = useState(false);
    const [modalEditarClasseAberto, setModalEditarClasseAberto] = useState(false);
    const [modalStatusClasseAberto, setModalStatusClasseAberto] = useState(false);

    const [modalCriarTermoAberto, setModalCriarTermoAberto] = useState(false);
    const [modalEditarTermoAberto, setModalEditarTermoAberto] = useState(false);
    const [modalStatusTermoAberto, setModalStatusTermoAberto] = useState(false);

    // Elementos em edição/ação
    const [classeEmAcao, setClasseEmAcao] = useState<ClasseVocabulario | null>(null);
    const [termoEmAcao, setTermoEmAcao] = useState<TermoVocabulario | null>(null);

    // Formulários
    const [formClasseNome, setFormClasseNome] = useState('');
    const [formTermoDescricao, setFormTermoDescricao] = useState('');
    const [erroModal, setErroModal] = useState<string | null>(null);

    // Carregar assinaturas e classes com assinatura do usuário
    const carregarAssinaturas = async () => {
        try {
            const [termosIds, classesIds] = await Promise.all([
                listarMinhasAssinaturas(),
                listarMinhasClassesAssinadas(),
            ]);
            setMinhasAssinaturas(termosIds);
            setClassesComAssinatura(classesIds);
        } catch {
            // falha silenciosa nas assinaturas
        }
    };

    // Carregar classes
    const carregarClasses = useCallback(async (classeIdParaManter?: number) => {
        setCarregandoClasses(true);
        try {
            const apenasAtivas = !isAdmin || !exibirInativos;
            const lista = await listarClasses(apenasAtivas);
            setClasses(lista);

            if (lista.length > 0) {
                const idAlvo = classeIdParaManter ?? classeSelecionadaRef.current?.id;
                const encontrada = idAlvo ? lista.find((c) => c.id === idAlvo) : null;
                setClasseSelecionada(encontrada || lista[0]);
            } else {
                setClasseSelecionada(null);
                setTermos([]);
            }
        } catch {
            mostrarToast('error', 'Erro ao carregar classes de vocabulário.');
        } finally {
            setCarregandoClasses(false);
        }
    }, [isAdmin, exibirInativos]);

    // Carregar termos da classe selecionada
    const carregarTermos = useCallback(async (classeId: number) => {
        setCarregandoTermos(true);
        try {
            const apenasAtivos = !isAdmin || !exibirInativos;
            const lista = await listarTermosPorClasse(classeId, apenasAtivos);
            setTermos(lista);
        } catch {
            mostrarToast('error', 'Erro ao carregar termos da classe.');
        } finally {
            setCarregandoTermos(false);
        }
    }, [isAdmin, exibirInativos]);

    // Carga inicial
    useEffect(() => {
        carregarClasses();
        carregarAssinaturas();
    }, [carregarClasses]);

    // Quando mudar a classe selecionada ou o toggle de inativos, atualiza os termos
    useEffect(() => {
        if (classeSelecionada) {
            carregarTermos(classeSelecionada.id);
        }
    }, [classeSelecionada, carregarTermos]);

    // Filtro de Classes
    // REGRA 1: Na aba "Todos os Termos", classes inativas NUNCA aparecem (exceto se admin marcou exibirInativos).
    // REGRA 2: Na aba "Meus Assuntos de Interesse", aparecem APENAS as classes em que o usuário possui ao menos um assunto assinado.
    const classesFiltradas = useMemo(() => {
        return classes.filter((c) => {
            const matchBusca = !buscaClasse.trim() ||
                c.nome.toLowerCase().includes(buscaClasse.toLowerCase().trim());

            if (!matchBusca) return false;

            if (filtroAba === 'TODOS') {
                return !(!c.ativo && (!isAdmin || !exibirInativos));

            }

            if (filtroAba === 'ASSINADOS') {
                return classesComAssinatura.includes(c.id);
            }

            return true;
        });
    }, [classes, buscaClasse, filtroAba, isAdmin, exibirInativos, classesComAssinatura]);

    // Gerenciamento da classe selecionada ao alternar abas
    useEffect(() => {
        if (filtroAba === 'TODOS') {
            if (classeSelecionada && !classeSelecionada.ativo && (!isAdmin || !exibirInativos)) {
                const primeiraAtiva = classes.find((c) => c.ativo);
                setClasseSelecionada(primeiraAtiva || null);
            }
        } else if (filtroAba === 'ASSINADOS') {
            // Se a classe atual não possuir assinaturas do usuário, seleciona a primeira que possui
            const classeAtualTemAssinatura = classeSelecionada && classesComAssinatura.includes(classeSelecionada.id);
            if (!classeAtualTemAssinatura) {
                const primeiraComAssinatura = classes.find((c) => classesComAssinatura.includes(c.id));
                setClasseSelecionada(primeiraComAssinatura || null);
            }
        }
    }, [filtroAba, classeSelecionada, classes, classesComAssinatura, isAdmin, exibirInativos]);

    // Filtro de Termos
    const termosFiltrados = useMemo(() => {
        return termos.filter((t) => {
            const matchBusca = !buscaTermo.trim() ||
                t.descricao.toLowerCase().includes(buscaTermo.toLowerCase().trim());
            const matchAba = filtroAba === 'TODOS' || minhasAssinaturas.includes(t.id);
            return matchBusca && matchAba;
        });
    }, [termos, buscaTermo, filtroAba, minhasAssinaturas]);

    // Total de termos assinados no sistema
    const totalAssinados = useMemo(() => {
        return minhasAssinaturas.length;
    }, [minhasAssinaturas]);

    // ==========================================================
    // Assinar / Desassinar Assunto (Termo) com Atualização Otimista
    // ==========================================================
    const handleToggleAssinatura = async (termo: TermoVocabulario) => {
        const jaAssinado = minhasAssinaturas.includes(termo.id);

        if (!termo.ativo && !jaAssinado) {
            mostrarToast('error', 'Não é possível assinar um termo inativo.');
            return;
        }

        // 1. Guardar estado anterior para rollback em caso de falha de rede
        const assinaturasAnteriores = [...minhasAssinaturas];
        const classesAnteriores = [...classesComAssinatura];

        // 2. Atualização Otimista Imediata (resposta instantânea na UI)
        if (jaAssinado) {
            setMinhasAssinaturas((prev) => prev.filter((id) => id !== termo.id));
        } else {
            setMinhasAssinaturas((prev) => [...prev, termo.id]);
            if (classeSelecionada && !classesComAssinatura.includes(classeSelecionada.id)) {
                setClassesComAssinatura((prev) => [...prev, classeSelecionada.id]);
            }
        }

        try {
            // 3. Efetuar requisição em segundo plano
            if (jaAssinado) {
                await desassinarTermo(termo.id);
                mostrarToast('success', `Assinatura de "${termo.descricao}" removida.`);

                // Sincroniza classes com assinatura do backend após desassinar
                const classesAtualizadas = await listarMinhasClassesAssinadas();
                setClassesComAssinatura(classesAtualizadas);

                // Se o termo desassinado for inativo e o usuário não for admin com inativos ligados,
                // sincroniza a lista da classe para remover o item inativo da visualização
                if (!termo.ativo && (!isAdmin || !exibirInativos) && classeSelecionada) {
                    await carregarTermos(classeSelecionada.id);
                }
            } else {
                await assinarTermo(termo.id);
                mostrarToast('success', `Você assinou o assunto "${termo.descricao}".`);

                // Sincroniza classes com assinatura
                const classesAtualizadas = await listarMinhasClassesAssinadas();
                setClassesComAssinatura(classesAtualizadas);
            }
        } catch (err: unknown) {
            // 4. Rollback: desfaz a alteração local caso ocorra erro no servidor
            setMinhasAssinaturas(assinaturasAnteriores);
            setClassesComAssinatura(classesAnteriores);

            if (err instanceof ApiError) {
                mostrarToast('error', err.message);
            } else {
                mostrarToast('error', 'Falha ao atualizar assinatura. Tente novamente.');
            }
        }
    };

    // ==========================================
    // Handlers para Classes (Admin)
    // ==========================================
    const abrirModalCriarClasse = () => {
        setFormClasseNome('');
        setErroModal(null);
        setModalCriarClasseAberto(true);
    };

    const handleCriarClasse = async (e: React.FormEvent) => {
        e.preventDefault();
        setErroModal(null);

        const nome = formClasseNome.trim();
        if (!nome) {
            setErroModal('Informe o nome da classe.');
            return;
        }

        setSalvandoModal(true);
        try {
            const nova = await criarClasse({nome});
            setModalCriarClasseAberto(false);
            mostrarToast('success', `Classe "${nova.nome}" criada com sucesso!`);
            await carregarClasses(nova.id);
        } catch (err: unknown) {
            if (err instanceof ApiError) {
                setErroModal(err.message);
            } else {
                setErroModal('Erro ao criar classe.');
            }
        } finally {
            setSalvandoModal(false);
        }
    };

    const abrirModalEditarClasse = (classe: ClasseVocabulario, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!classe.ativo) {
            mostrarToast('error', 'Não é possível editar uma classe inativa. Reative-a primeiro.');
            return;
        }

        if (classe.classeBase) {
            mostrarToast('error', 'Classes-base do sistema não podem ter o nome alterado.');
            return;
        }

        setClasseEmAcao(classe);
        setFormClasseNome(classe.nome);
        setErroModal(null);
        setModalEditarClasseAberto(true);
    };

    const handleEditarClasse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!classeEmAcao) return;
        setErroModal(null);

        if (!classeEmAcao.ativo) {
            setErroModal('Não é possível editar uma classe inativa.');
            return;
        }

        const nome = formClasseNome.trim();
        if (!nome) {
            setErroModal('O nome da classe não pode ser vazio.');
            return;
        }

        setSalvandoModal(true);
        try {
            await atualizarNomeClasse(classeEmAcao.id, {nome});
            setModalEditarClasseAberto(false);
            mostrarToast('success', 'Nome da classe atualizado com sucesso!');
            await carregarClasses(classeEmAcao.id);
        } catch (err: unknown) {
            if (err instanceof ApiError) {
                setErroModal(err.message);
            } else {
                setErroModal('Erro ao atualizar classe.');
            }
        } finally {
            setSalvandoModal(false);
        }
    };

    const abrirModalStatusClasse = (classe: ClasseVocabulario, e: React.MouseEvent) => {
        e.stopPropagation();
        if (classe.classeBase && classe.ativo) {
            mostrarToast('error', 'Classes-base do sistema não podem ser desativadas.');
            return;
        }
        setClasseEmAcao(classe);
        setErroModal(null);
        setModalStatusClasseAberto(true);
    };

    const handleAlternarStatusClasse = async () => {
        if (!classeEmAcao) return;
        setSalvandoModal(true);
        setErroModal(null);

        try {
            const novoStatus = !classeEmAcao.ativo;
            await alternarStatusClasse(classeEmAcao.id, novoStatus);
            setModalStatusClasseAberto(false);
            mostrarToast(
                'success',
                novoStatus
                    ? `Classe "${classeEmAcao.nome}" reativada.`
                    : `Classe "${classeEmAcao.nome}" e seus termos foram inativados.`
            );
            await carregarClasses(classeEmAcao.id);
        } catch (err: unknown) {
            if (err instanceof ApiError) {
                setErroModal(err.message);
            } else {
                setErroModal('Erro ao alterar status da classe.');
            }
        } finally {
            setSalvandoModal(false);
        }
    };

    // ==========================================
    // Handlers para Termos (Admin)
    // ==========================================
    const abrirModalCriarTermo = () => {
        if (!classeSelecionada) return;
        if (!classeSelecionada.ativo) {
            mostrarToast('error', 'Não é possível adicionar termos a uma classe inativa.');
            return;
        }
        setFormTermoDescricao('');
        setErroModal(null);
        setModalCriarTermoAberto(true);
    };

    const handleCriarTermo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!classeSelecionada) return;
        setErroModal(null);

        const descricao = formTermoDescricao.trim();
        if (!descricao) {
            setErroModal('Informe a descrição do termo.');
            return;
        }

        setSalvandoModal(true);
        try {
            const novo = await criarTermo(classeSelecionada.id, {descricao});
            setModalCriarTermoAberto(false);
            mostrarToast('success', `Termo "${descricao}" adicionado com sucesso!`);
            setTermos((prev) => [novo, ...prev]);
        } catch (err: unknown) {
            if (err instanceof ApiError) {
                setErroModal(err.message);
            } else {
                setErroModal('Erro ao adicionar termo.');
            }
        } finally {
            setSalvandoModal(false);
        }
    };

    const abrirModalEditarTermo = (termo: TermoVocabulario) => {
        if (!termo.ativo) {
            mostrarToast('error', 'Não é possível editar a descrição de um termo inativo. Reative-o primeiro.');
            return;
        }
        setTermoEmAcao(termo);
        setFormTermoDescricao(termo.descricao);
        setErroModal(null);
        setModalEditarTermoAberto(true);
    };

    const handleEditarTermo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!termoEmAcao || !classeSelecionada) return;
        setErroModal(null);

        if (!termoEmAcao.ativo) {
            setErroModal('Não é possível editar a descrição de um termo inativo.');
            return;
        }

        const descricao = formTermoDescricao.trim();
        if (!descricao) {
            setErroModal('A descrição do termo não pode ser vazia.');
            return;
        }

        setSalvandoModal(true);
        try {
            const atualizado = await atualizarTermo(termoEmAcao.id, {descricao});
            setModalEditarTermoAberto(false);
            mostrarToast('success', 'Descrição do termo atualizada.');
            setTermos((prev) => prev.map((t) => (t.id === atualizado.id ? atualizado : t)));
        } catch (err: unknown) {
            if (err instanceof ApiError) {
                setErroModal(err.message);
            } else {
                setErroModal('Erro ao editar termo.');
            }
        } finally {
            setSalvandoModal(false);
        }
    };

    const abrirModalStatusTermo = (termo: TermoVocabulario) => {
        setTermoEmAcao(termo);
        setErroModal(null);
        setModalStatusTermoAberto(true);
    };

    const handleAlternarStatusTermo = async () => {
        if (!termoEmAcao || !classeSelecionada) return;
        setSalvandoModal(true);
        setErroModal(null);

        try {
            const novoStatus = !termoEmAcao.ativo;
            await alternarStatusTermo(termoEmAcao.id, novoStatus);
            setModalStatusTermoAberto(false);
            mostrarToast(
                'success',
                novoStatus
                    ? `Termo "${termoEmAcao.descricao}" reativado com sucesso.`
                    : `Termo "${termoEmAcao.descricao}" desativado.`
            );
            await carregarTermos(classeSelecionada.id);
        } catch (err: unknown) {
            if (err instanceof ApiError) {
                setErroModal(err.message);
            } else {
                setErroModal('Erro ao alterar status do termo.');
            }
        } finally {
            setSalvandoModal(false);
        }
    };

    return (
        <div className="vocabulario-page">
            {/* Header */}
            <div className="vocabulario-header">
                <div className="header-info">
                    <h1>Vocabulário Controlado</h1>
                    <p>Taxonomia de metrologia, termos técnicos e gerenciamento de assuntos de interesse.</p>
                </div>
            </div>

            {/* Toolbar com Abas de Assinaturas e Opções de Administrador */}
            <div className="vocabulario-toolbar">
                <div className="filter-tabs">
                    <button
                        className={`tab-btn ${filtroAba === 'TODOS' ? 'active' : ''}`}
                        onClick={() => setFiltroAba('TODOS')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="8" y1="6" x2="21" y2="6"/>
                            <line x1="8" y1="12" x2="21" y2="12"/>
                            <line x1="8" y1="18" x2="21" y2="18"/>
                            <line x1="3" y1="6" x2="3.01" y2="6"/>
                            <line x1="3" y1="12" x2="3.01" y2="12"/>
                            <line x1="3" y1="18" x2="3.01" y2="18"/>
                        </svg>
                        <span>Todos os Termos</span>
                    </button>

                    <button
                        className={`tab-btn ${filtroAba === 'ASSINADOS' ? 'active' : ''}`}
                        onClick={() => setFiltroAba('ASSINADOS')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                             fill={filtroAba === 'ASSINADOS' ? 'currentColor' : 'none'}
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon
                                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        <span>Meus Assuntos de Interesse</span>
                        <span className="tab-count">{totalAssinados}</span>
                    </button>
                </div>

                {isAdmin && (
                    <div className="toolbar-admin-options">
                        <label className="toggle-label">
                            <input
                                type="checkbox"
                                checked={exibirInativos}
                                onChange={(e) => handleToggleExibirInativos(e.target.checked)}
                            />
                            <span>Exibir itens inativos</span>
                        </label>
                    </div>
                )}
            </div>

            <div className="vocabulario-main-layout">
                <div className="classes-panel">
                    <div className="panel-header">
                        <span className="panel-title">Classes</span>
                        {isAdmin && (
                            <button
                                type="button"
                                className="btn-nova-classe-header"
                                onClick={abrirModalCriarClasse}
                                title="Criar nova classe de vocabulário"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                                <span>Nova Classe</span>
                            </button>
                        )}
                    </div>

                    <div className="panel-search">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                             strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar classe..."
                            value={buscaClasse}
                            onChange={(e) => setBuscaClasse(e.target.value)}
                        />
                    </div>

                    <div className="classes-list">
                        {carregandoClasses ? (
                            <div className="empty-classes">Carregando classes...</div>
                        ) : classesFiltradas.length === 0 ? (
                            <div className="empty-classes">
                                {filtroAba === 'ASSINADOS'
                                    ? 'Você ainda não possui nenhum assunto de interesse assinado.'
                                    : 'Nenhuma classe encontrada.'}
                            </div>
                        ) : (
                            classesFiltradas.map((classe) => {
                                const isSelected = classeSelecionada?.id === classe.id;
                                return (
                                    <div
                                        key={classe.id}
                                        className={`classe-item ${isSelected ? 'selected' : ''} ${!classe.ativo ? 'inativa' : ''}`}
                                        onClick={() => setClasseSelecionada(classe)}
                                    >
                                        <div className="classe-item-main">
                                            <div className="classe-name-row">
                                                <span className="classe-name">{classe.nome}</span>
                                                {!classe.ativo && <span className="badge-inativo">Inativa</span>}
                                            </div>
                                        </div>

                                        {isAdmin && (
                                            <div className="classe-item-actions">
                                                {!classe.classeBase && classe.ativo && (
                                                    <button
                                                        type="button"
                                                        className="btn-icon-classe"
                                                        onClick={(e) => abrirModalEditarClasse(classe, e)}
                                                        title="Editar nome da classe"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                                             fill="none"
                                                             stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                             strokeLinejoin="round">
                                                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                                            <path d="m15 5 4 4"/>
                                                        </svg>
                                                    </button>
                                                )}

                                                {!classe.classeBase && (<button
                                                    type="button"
                                                    className={`btn-icon-classe ${classe.ativo ? 'btn-delete' : 'btn-activate'}`}
                                                    onClick={(e) => abrirModalStatusClasse(classe, e)}
                                                    disabled={classe.classeBase && classe.ativo}
                                                    title={
                                                        classe.classeBase && classe.ativo
                                                            ? 'Classes-base não podem ser desativadas'
                                                            : classe.ativo ? 'Inativar classe' : 'Reativar classe'
                                                    }
                                                >
                                                    {classe.ativo ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                                             fill="none"
                                                             stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                             strokeLinejoin="round">
                                                            <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
                                                            <line x1="12" y1="2" x2="12" y2="12"/>
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                                             fill="none"
                                                             stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                                             strokeLinejoin="round">
                                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                                        </svg>
                                                    )}
                                                </button>)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Coluna 2: Lista de Termos da Classe Selecionada */}
                <div className="termos-panel">
                    <div className="termos-header">
                        <div className="termos-title-area">
                            <span className="termos-title">
                                Termos da Classe:
                                <span className="classe-focus-name">
                                    {classeSelecionada ? ` ${classeSelecionada.nome}` : ' Nenhuma classe selecionada'}
                                </span>
                            </span>
                            <span className="termos-subtitle">
                                {classeSelecionada
                                    ? classeSelecionada.ativo
                                        ? 'Selecione e assine os assuntos de seu interesse para receber atualizações.'
                                        : 'Esta classe está inativa. Seus termos encontram-se desabilitados.'
                                    : filtroAba === 'ASSINADOS'
                                        ? 'Nenhum assunto de interesse assinado. Navegue em "Todos os Termos" para assinar assuntos.'
                                        : 'Selecione uma classe à esquerda para gerenciar seus termos.'}
                            </span>
                        </div>

                        {isAdmin && classeSelecionada && classeSelecionada.ativo && (
                            <div className="termos-actions">
                                <button className="btn-novo-termo" onClick={abrirModalCriarTermo}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                         strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19"/>
                                        <line x1="5" y1="12" x2="19" y2="12"/>
                                    </svg>
                                    <span>Novo Termo</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {classeSelecionada && (
                        <div className="termos-filter-bar">
                            <div className="search-termo-box">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                     strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"/>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Buscar termo na classe..."
                                    value={buscaTermo}
                                    onChange={(e) => setBuscaTermo(e.target.value)}
                                />
                            </div>

                            <div className="termos-count-info">
                                {termosFiltrados.length} {termosFiltrados.length === 1 ? 'termo' : 'termos'}
                            </div>
                        </div>
                    )}

                    <div className="termos-list">
                        {!classeSelecionada ? (
                            <div className="empty-termos">
                                {filtroAba === 'ASSINADOS' ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                             strokeLinejoin="round">
                                            <polygon
                                                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                        </svg>
                                        <p>Você ainda não possui nenhum assunto assinado.</p>
                                        <p style={{fontSize: '0.8rem', color: '#94a3b8'}}>
                                            Vá até a aba "Todos os Termos" para assinar assuntos de seu interesse.
                                        </p>
                                    </>
                                ) : (
                                    <p>Selecione uma classe de vocabulário para visualizar os termos.</p>
                                )}
                            </div>
                        ) : carregandoTermos ? (
                            <div className="empty-termos">
                                <p>Carregando termos...</p>
                            </div>
                        ) : termosFiltrados.length === 0 ? (
                            <div className="empty-termos">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                     strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                    <line x1="9" y1="15" x2="15" y2="15"/>
                                </svg>
                                {filtroAba === 'ASSINADOS' ? (
                                    <p>Você não possui assuntos de interesse assinados nesta classe.</p>
                                ) : (
                                    <p>Nenhum termo cadastrado nesta classe.</p>
                                )}
                            </div>
                        ) : (
                            termosFiltrados.map((termo) => {
                                const assinado = minhasAssinaturas.includes(termo.id);
                                const isTermoInativoAssinado = !termo.ativo && assinado;

                                return (
                                    <div
                                        key={termo.id}
                                        className={`termo-card ${assinado ? 'assinado' : ''} ${!termo.ativo ? 'inativo' : ''} ${isTermoInativoAssinado ? 'inativo-assinado' : ''}`}
                                    >
                                        <div className="termo-content">
                                            <span className="termo-bullet"/>
                                            <span className="termo-desc">{termo.descricao}</span>
                                            {!termo.ativo && (
                                                <span
                                                    className="termo-badge-inativo"
                                                    title={isTermoInativoAssinado ? 'Este assunto foi desativado pela administração' : 'Termo inativo'}
                                                >
                                                    Inativo
                                                </span>
                                            )}
                                        </div>

                                        <div className="termo-card-actions">
                                            {/* Botão de Assinatura com Atualização Otimista */}
                                            <button
                                                type="button"
                                                className={`btn-assinatura ${assinado ? 'ativo' : ''} ${isTermoInativoAssinado ? 'inativo-assinado' : ''}`}
                                                onClick={() => handleToggleAssinatura(termo)}
                                                disabled={!termo.ativo && !assinado}
                                                title={
                                                    !termo.ativo
                                                        ? assinado
                                                            ? 'Este assunto foi desativado. Clique para remover de suas assinaturas.'
                                                            : 'Termo inativo não permite novas assinaturas'
                                                        : assinado
                                                            ? 'Clique para desassinar este assunto de interesse'
                                                            : 'Clique para assinar e acompanhar este assunto de interesse'
                                                }
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill={assinado ? (isTermoInativoAssinado ? '#ef4444' : '#f59e0b') : 'none'}
                                                    stroke={assinado ? (isTermoInativoAssinado ? '#ef4444' : '#f59e0b') : 'currentColor'}
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <polygon
                                                        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                                </svg>
                                                <span>{assinado ? 'Assinado' : 'Assinar'}</span>
                                            </button>

                                            {/* Ações do Administrador */}
                                            {isAdmin && (
                                                <div className="admin-termo-actions">
                                                    {/* Termos inativos não podem ser editados */}
                                                    {termo.ativo && (
                                                        <button
                                                            type="button"
                                                            className="btn-action-termo"
                                                            onClick={() => abrirModalEditarTermo(termo)}
                                                            title="Editar descrição do termo"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                                                 fill="none"
                                                                 stroke="currentColor" strokeWidth="2"
                                                                 strokeLinecap="round" strokeLinejoin="round">
                                                                <path
                                                                    d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                                                <path d="m15 5 4 4"/>
                                                            </svg>
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        className={`btn-action-termo ${termo.ativo ? 'btn-delete' : 'btn-activate'}`}
                                                        onClick={() => abrirModalStatusTermo(termo)}
                                                        title={termo.ativo ? 'Inativar termo' : 'Reativar termo'}
                                                    >
                                                        {termo.ativo ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                                                 fill="none"
                                                                 stroke="currentColor" strokeWidth="2"
                                                                 strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
                                                                <line x1="12" y1="2" x2="12" y2="12"/>
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                                                 fill="none"
                                                                 stroke="currentColor" strokeWidth="2"
                                                                 strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                                                <polyline points="22 4 12 14.01 9 11.01"/>
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* ======================================================== */}
            {/* Modais de Classes                                        */}
            {/* ======================================================== */}

            {/* Modal: Criar Classe */}
            {modalCriarClasseAberto && (
                <div className="modal-overlay" onClick={() => setModalCriarClasseAberto(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Criar Nova Classe de Vocabulário</h2>
                            <button className="btn-close-modal" onClick={() => setModalCriarClasseAberto(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleCriarClasse} className="modal-form">
                            {erroModal && <div className="modal-error">{erroModal}</div>}

                            <div className="form-group">
                                <label>Nome da Classe *</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={80}
                                    placeholder="Ex: TIPO_SERVICO, GRANDEZA, EQUIPAMENTO"
                                    value={formClasseNome}
                                    onChange={(e) => setFormClasseNome(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancelar"
                                        onClick={() => setModalCriarClasseAberto(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-salvar" disabled={salvandoModal}>
                                    {salvandoModal ? (
                                        <>
                                            <span className="spinner"/>
                                            <span>Criando...</span>
                                        </>
                                    ) : (
                                        'Criar Classe'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Editar Nome da Classe */}
            {modalEditarClasseAberto && classeEmAcao && (
                <div className="modal-overlay" onClick={() => setModalEditarClasseAberto(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Editar Nome da Classe</h2>
                            <button className="btn-close-modal" onClick={() => setModalEditarClasseAberto(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleEditarClasse} className="modal-form">
                            {erroModal && <div className="modal-error">{erroModal}</div>}

                            <div className="form-group">
                                <label>Novo Nome da Classe *</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={80}
                                    value={formClasseNome}
                                    onChange={(e) => setFormClasseNome(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancelar"
                                        onClick={() => setModalEditarClasseAberto(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-salvar" disabled={salvandoModal}>
                                    {salvandoModal ? (
                                        <>
                                            <span className="spinner"/>
                                            <span>Salvando...</span>
                                        </>
                                    ) : (
                                        'Salvar Nome'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Alternar Status da Classe */}
            {modalStatusClasseAberto && classeEmAcao && (
                <div className="modal-overlay" onClick={() => setModalStatusClasseAberto(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{classeEmAcao.ativo ? 'Inativar Classe' : 'Reativar Classe'}</h2>
                            <button className="btn-close-modal" onClick={() => setModalStatusClasseAberto(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        <div className="modal-form">
                            {erroModal && <div className="modal-error">{erroModal}</div>}

                            <p style={{fontSize: '0.9rem', color: '#334155', lineHeight: '1.5', margin: 0}}>
                                {classeEmAcao.ativo ? (
                                    <>
                                        Deseja realmente inativar a classe <strong>{classeEmAcao.nome}</strong>?
                                        <br/><br/>
                                        <span style={{color: '#dc2626', fontWeight: 600}}>
                                            Atenção: Ao inativar uma classe, todos os seus termos vinculados serão automaticamente inativados.
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        Deseja reativar a classe <strong>{classeEmAcao.nome}</strong>?
                                    </>
                                )}
                            </p>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancelar"
                                        onClick={() => setModalStatusClasseAberto(false)}>
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className={`btn-salvar ${classeEmAcao.ativo ? 'btn-danger' : 'btn-success'}`}
                                    onClick={handleAlternarStatusClasse}
                                    disabled={salvandoModal}
                                >
                                    {salvandoModal ? (
                                        <>
                                            <span className="spinner"/>
                                            <span>Processando...</span>
                                        </>
                                    ) : (
                                        classeEmAcao.ativo ? 'Confirmar Desativação' : 'Confirmar Reativação'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* Modais de Termos                                         */}
            {/* ======================================================== */}

            {/* Modal: Criar Termo */}
            {modalCriarTermoAberto && classeSelecionada && (
                <div className="modal-overlay" onClick={() => setModalCriarTermoAberto(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Novo Termo em {classeSelecionada.nome}</h2>
                            <button className="btn-close-modal" onClick={() => setModalCriarTermoAberto(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleCriarTermo} className="modal-form">
                            {erroModal && <div className="modal-error">{erroModal}</div>}

                            <div className="form-group">
                                <label>Descrição do Termo *</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={80}
                                    placeholder="Ex: Calibração Dimensional, Rugosidade..."
                                    value={formTermoDescricao}
                                    onChange={(e) => setFormTermoDescricao(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancelar"
                                        onClick={() => setModalCriarTermoAberto(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-salvar" disabled={salvandoModal}>
                                    {salvandoModal ? (
                                        <>
                                            <span className="spinner"/>
                                            <span>Salvando...</span>
                                        </>
                                    ) : (
                                        'Adicionar Termo'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Editar Termo */}
            {modalEditarTermoAberto && termoEmAcao && (
                <div className="modal-overlay" onClick={() => setModalEditarTermoAberto(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Editar Termo</h2>
                            <button className="btn-close-modal" onClick={() => setModalEditarTermoAberto(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleEditarTermo} className="modal-form">
                            {erroModal && <div className="modal-error">{erroModal}</div>}

                            <div className="form-group">
                                <label>Descrição do Termo *</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={80}
                                    value={formTermoDescricao}
                                    onChange={(e) => setFormTermoDescricao(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancelar"
                                        onClick={() => setModalEditarTermoAberto(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-salvar" disabled={salvandoModal}>
                                    {salvandoModal ? (
                                        <>
                                            <span className="spinner"/>
                                            <span>Salvando...</span>
                                        </>
                                    ) : (
                                        'Salvar Alterações'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Alternar Status do Termo */}
            {modalStatusTermoAberto && termoEmAcao && (
                <div className="modal-overlay" onClick={() => setModalStatusTermoAberto(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{termoEmAcao.ativo ? 'Inativar Termo' : 'Reativar Termo'}</h2>
                            <button className="btn-close-modal" onClick={() => setModalStatusTermoAberto(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        <div className="modal-form">
                            {erroModal && <div className="modal-error">{erroModal}</div>}

                            <p style={{fontSize: '0.9rem', color: '#334155', lineHeight: '1.5', margin: 0}}>
                                Deseja realmente {termoEmAcao.ativo ? 'inativar' : 'reativar'} o termo{' '}
                                <strong>"{termoEmAcao.descricao}"</strong>?
                            </p>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancelar"
                                        onClick={() => setModalStatusTermoAberto(false)}>
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className={`btn-salvar ${termoEmAcao.ativo ? 'btn-danger' : 'btn-success'}`}
                                    onClick={handleAlternarStatusTermo}
                                    disabled={salvandoModal}
                                >
                                    {salvandoModal ? (
                                        <>
                                            <span className="spinner"/>
                                            <span>Processando...</span>
                                        </>
                                    ) : (
                                        termoEmAcao.ativo ? 'Confirmar Desativação' : 'Confirmar Reativação'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
