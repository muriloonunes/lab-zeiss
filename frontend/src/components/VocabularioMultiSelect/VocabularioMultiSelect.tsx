import React, { useState, useRef, useEffect, useMemo } from 'react';
import { TermoVocabulario } from '../../types/vocabulario';
import './VocabularioMultiSelect.scss';

export interface TermoComClasse extends TermoVocabulario {
    classeNome?: string;
}

interface VocabularioMultiSelectProps {
    termos: TermoComClasse[];
    selecionadosIds: number[];
    onChange: (novosIds: number[]) => void;
    placeholder?: string;
    disabled?: boolean;
    label?: string;
}

export const VocabularioMultiSelect: React.FC<VocabularioMultiSelectProps> = ({
    termos,
    selecionadosIds,
    onChange,
    placeholder = 'Pesquisar e selecionar assuntos relacionados...',
    disabled = false,
    label
}) => {
    const [aberto, setAberto] = useState(false);
    const [busca, setBusca] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputBuscaRef = useRef<HTMLInputElement>(null);

    const termosMap = useMemo(() => {
        const map = new Map<number, TermoComClasse>();
        termos.forEach(t => map.set(t.id, t));
        return map;
    }, [termos]);

    const selecionados = useMemo(() => {
        return selecionadosIds
            .map(id => termosMap.get(id))
            .filter((t): t is TermoComClasse => !!t);
    }, [selecionadosIds, termosMap]);

    const termosFiltrados = useMemo(() => {
        if (!busca.trim()) return termos;
        const q = busca.toLowerCase();
        return termos.filter(t => 
            t.descricao.toLowerCase().includes(q) || 
            (t.classeNome && t.classeNome.toLowerCase().includes(q))
        );
    }, [termos, busca]);

    const gruposPorClasse = useMemo(() => {
        const grupos: Record<string, TermoComClasse[]> = {};
        termosFiltrados.forEach(t => {
            const classe = t.classeNome || 'Outros Assuntos';
            if (!grupos[classe]) {
                grupos[classe] = [];
            }
            grupos[classe].push(t);
        });
        return grupos;
    }, [termosFiltrados]);

    useEffect(() => {
        const handleClickFora = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setAberto(false);
            }
        };

        if (aberto) {
            document.addEventListener('mousedown', handleClickFora);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickFora);
        };
    }, [aberto]);

    useEffect(() => {
        if (aberto && inputBuscaRef.current) {
            inputBuscaRef.current.focus();
        }
    }, [aberto]);

    const handleToggleTermo = (id: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (selecionadosIds.includes(id)) {
            onChange(selecionadosIds.filter(item => item !== id));
        } else {
            onChange([...selecionadosIds, id]);
        }
    };

    const handleRemoverTermo = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selecionadosIds.filter(item => item !== id));
    };

    const handleLimparTodos = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange([]);
    };

    const handleKeyDownBusca = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setAberto(false);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (termosFiltrados.length === 1) {
                handleToggleTermo(termosFiltrados[0].id);
            }
        }
    };

    return (
        <div className={`vocabulario-multi-select ${disabled ? 'disabled' : ''}`} ref={containerRef}>
            {label && <label className="select-field-label">{label}</label>}

            <div
                className={`select-trigger-box ${aberto ? 'active' : ''}`}
                onClick={() => !disabled && setAberto(!aberto)}
                tabIndex={disabled ? -1 : 0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (!disabled) setAberto(!aberto);
                    }
                }}
            >
                <div className="selected-tags-container">
                    {selecionados.length === 0 ? (
                        <span className="placeholder-text">{placeholder}</span>
                    ) : (
                        selecionados.map(termo => (
                            <span key={termo.id} className="selected-tag-pill" title={termo.classeNome ? `${termo.classeNome}: ${termo.descricao}` : termo.descricao}>
                                <span className="tag-text">{termo.descricao}</span>
                                {termo.classeNome && (
                                    <span className="tag-class-mini">({termo.classeNome})</span>
                                )}
                                <button
                                    type="button"
                                    className="tag-remove-btn"
                                    onClick={(e) => handleRemoverTermo(termo.id, e)}
                                    title="Remover termo"
                                    aria-label={`Remover ${termo.descricao}`}
                                >
                                    &times;
                                </button>
                            </span>
                        ))
                    )}
                </div>

                <div className="trigger-actions">
                    {selecionados.length > 0 && !disabled && (
                        <button
                            type="button"
                            className="clear-all-btn"
                            onClick={handleLimparTodos}
                            title="Limpar todos os termos selecionados"
                        >
                            &times;
                        </button>
                    )}
                    <div className={`chevron-indicator ${aberto ? 'open' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Dropdown Popover */}
            {aberto && (
                <div className="dropdown-popover">
                    {/* Barra de Pesquisa */}
                    <div className="search-bar-wrapper">
                        <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            ref={inputBuscaRef}
                            type="text"
                            className="search-input"
                            placeholder="Buscar termo ou categoria..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            onKeyDown={handleKeyDownBusca}
                            onClick={(e) => e.stopPropagation()}
                        />
                        {busca && (
                            <button
                                type="button"
                                className="clear-search-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setBusca('');
                                    inputBuscaRef.current?.focus();
                                }}
                                title="Limpar pesquisa"
                            >
                                &times;
                            </button>
                        )}
                    </div>

                    {/* Resumo e Ações Rápidas */}
                    <div className="dropdown-status-bar">
                        <span className="results-count">
                            {termosFiltrados.length} {termosFiltrados.length === 1 ? 'termo encontrado' : 'termos encontrados'}
                        </span>
                        <span className="selected-count">
                            {selecionados.length} selecionado{selecionados.length === 1 ? '' : 's'}
                        </span>
                    </div>

                    {/* Lista Agrupada de Termos */}
                    <div className="dropdown-options-list">
                        {Object.keys(gruposPorClasse).length === 0 ? (
                            <div className="empty-results">
                                <p>Nenhum termo encontrado para &ldquo;<strong>{busca}</strong>&rdquo;.</p>
                            </div>
                        ) : (
                            Object.entries(gruposPorClasse).map(([classeNome, termosDoGrupo]) => (
                                <div key={classeNome} className="termos-group">
                                    <div className="group-header">
                                        <span className="group-title">{classeNome}</span>
                                        <span className="group-badge">{termosDoGrupo.length}</span>
                                    </div>
                                    <div className="group-items">
                                        {termosDoGrupo.map(t => {
                                            const isSelected = selecionadosIds.includes(t.id);
                                            return (
                                                <div
                                                    key={t.id}
                                                    className={`termo-item-row ${isSelected ? 'selected' : ''}`}
                                                    onClick={(e) => handleToggleTermo(t.id, e)}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="termo-checkbox"
                                                        checked={isSelected}
                                                        onChange={() => {}} // tratado no onClick do container
                                                        tabIndex={-1}
                                                    />
                                                    <span className="termo-descricao">{t.descricao}</span>
                                                    {isSelected && (
                                                        <span className="selected-indicator">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                                                 fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
