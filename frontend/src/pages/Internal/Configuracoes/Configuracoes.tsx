import React, { useState, useEffect } from 'react';
import {
    obterConfiguracoes,
    salvarConfiguracoes,
    redefinirConfiguracoesPadrao,
    ConfiguracoesSistema
} from '../../../services/configuracaoService';
import { useToast } from '../../../components/Toast';
import './Configuracoes.scss';

export const Configuracoes: React.FC = () => {
    const { mostrarToast } = useToast();
    const [config, setConfig] = useState<ConfiguracoesSistema>(obterConfiguracoes());
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        const handleConfigAlterada = (e: Event) => {
            const custom = e as CustomEvent<ConfiguracoesSistema>;
            if (custom.detail) {
                setConfig(custom.detail);
            }
        };

        window.addEventListener('zeiss-configuracoes-alteradas', handleConfigAlterada);
        window.addEventListener('zeiss-modo-demo-alterado', () => {
            setConfig(obterConfiguracoes());
        });

        return () => {
            window.removeEventListener('zeiss-configuracoes-alteradas', handleConfigAlterada);
            window.removeEventListener('zeiss-modo-demo-alterado', () => {});
        };
    }, []);

    const handleChangeValorHora = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        setConfig(prev => ({ ...prev, valorHoraLaboratorio: val }));
    };

    const handleChangeTolerancia = (val: number) => {
        setConfig(prev => ({ ...prev, toleranciaAssertividade: val }));
    };

    const handleChangeSensibilidade = (val: number) => {
        setConfig(prev => ({ ...prev, sensibilidadeDesvioAssistente: val }));
    };

    const handleToggleDemo = () => {
        setConfig(prev => ({ ...prev, usarDadosMock: !prev.usarDadosMock }));
    };

    const handleSalvar = () => {
        if (config.valorHoraLaboratorio <= 0) {
            mostrarToast('error', 'O valor da hora do laboratório deve ser maior que zero.');
            return;
        }

        setSalvando(true);
        try {
            salvarConfiguracoes(config);
            mostrarToast('success', 'Configurações salvas com sucesso!');
        } catch {
            mostrarToast('error', 'Erro ao salvar as configurações.');
        } finally {
            setSalvando(false);
        }
    };

    const handleRestaurarPadroes = () => {
        if (window.confirm('Deseja restaurar as configurações para os padrões recomendados?')) {
            const padrao = redefinirConfiguracoesPadrao();
            setConfig(padrao);
            mostrarToast('success', 'Configurações restauradas com sucesso.');
        }
    };

    return (
        <div className="configuracoes-container">
            {/* Header Simples */}
            <div className="config-header-simples">
                <h1>Configurações do Sistema</h1>
                <p>Gerencie os parâmetros operacionais, métricas de assertividade e dados do laboratório.</p>
            </div>

            {/* Painel Central Unificado */}
            <div className="config-painel-card">
                {/* Item 1: Valor da Hora Técnica */}
                <div className="config-row">
                    <div className="row-info">
                        <label htmlFor="valorHoraInput">Valor da Hora Técnica</label>
                        <p>Taxa horária base para cálculo de custo estimado no Assistente de Orçamento.</p>
                    </div>
                    <div className="row-control">
                        <div className="input-moeda">
                            <span className="prefixo">R$</span>
                            <input
                                id="valorHoraInput"
                                type="number"
                                min="10"
                                step="5"
                                value={config.valorHoraLaboratorio}
                                onChange={handleChangeValorHora}
                                placeholder="250.00"
                            />
                            <span className="sufixo">/h</span>
                        </div>
                    </div>
                </div>

                {/* Item 2: Tolerância do Dashboard */}
                <div className="config-row">
                    <div className="row-info">
                        <label>Tolerância de Assertividade</label>
                        <p>Faixa aceitável de variação entre esforço real e orçado no Dashboard.</p>
                    </div>
                    <div className="row-control">
                        <div className="slider-control">
                            <input
                                type="range"
                                min="5"
                                max="35"
                                step="1"
                                value={config.toleranciaAssertividade}
                                onChange={(e) => handleChangeTolerancia(Number(e.target.value))}
                                className="slider-input"
                            />
                            <span className="badge-valor">±{config.toleranciaAssertividade}%</span>
                        </div>
                    </div>
                </div>

                {/* Item 3: Sensibilidade do Assistente */}
                <div className="config-row">
                    <div className="row-info">
                        <label>Sensibilidade do Assistente</label>
                        <p>Variação máxima em relação à mediana antes de exigir justificativa técnica.</p>
                    </div>
                    <div className="row-control">
                        <div className="slider-control">
                            <input
                                type="range"
                                min="5"
                                max="30"
                                step="1"
                                value={config.sensibilidadeDesvioAssistente}
                                onChange={(e) => handleChangeSensibilidade(Number(e.target.value))}
                                className="slider-input"
                            />
                            <span className="badge-valor">±{config.sensibilidadeDesvioAssistente}%</span>
                        </div>
                    </div>
                </div>

                {/* Item 4: Modo Demonstração */}
                <div className="config-row">
                    <div className="row-info">
                        <label>Modo Demonstração</label>
                        <p>Somar dados demonstrativos aos registros reais no Dashboard e Assistente.</p>
                    </div>
                    <div className="row-control">
                        <button
                            type="button"
                            className={`toggle-switch ${config.usarDadosMock ? 'ativo' : ''}`}
                            onClick={handleToggleDemo}
                            aria-label="Alternar modo demonstração"
                        >
                            <span className="toggle-thumb" />
                        </button>
                    </div>
                </div>

                {/* Footer do Painel */}
                <div className="config-painel-footer">
                    <button
                        type="button"
                        className="btn-restaurar-link"
                        onClick={handleRestaurarPadroes}
                    >
                        Restaurar Padrões
                    </button>

                    <button
                        type="button"
                        className="btn-salvar"
                        onClick={handleSalvar}
                        disabled={salvando}
                    >
                        {salvando ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
    );
};
