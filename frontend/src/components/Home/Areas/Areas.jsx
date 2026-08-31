import "./Areas.scss"

export function Areas() {
    const sectorsList = [
        {
            id: "automotive",
            name: "Automotivo & Autopeças",
            description: "Inspeção geométrica GD&T de componentes usinados, estamparia e conjuntos soldados.",
            tag: "CMM & Escaneamento 3D"
        },
        {
            id: "aerospace",
            name: "Aeroespacial & Defesa",
            description: "Controle dimensional de alta exatidão, análise de pás de turbinas e conformidade estrutural.",
            tag: "Alta Precisão"
        },
        {
            id: "medical",
            name: "Médico-Hospitalar & Implantes",
            description: "Digitalização e inspeção de próteses, dispositivos cirúrgicos e geometrias complexas.",
            tag: "Microtomografia / Óptica"
        },
        {
            id: "tooling",
            name: "Ferramentaria & Moldes",
            description: "Engenharia reversa e validação de matrizes, moldes de injeção e ferramentas de corte.",
            tag: "Engenharia Reversa"
        },
        {
            id: "energy",
            name: "Energia & Óleo e Gás",
            description: "Análise de desvios e integridade de válvulas, flanges e tubulações industriais.",
            tag: "Ensaios Não Destrutivos"
        },
        {
            id: "agro",
            name: "Máquinas Agrícolas & Linha Pesada",
            description: "Verificação de peças de grande porte, carcaças fundidas e estruturas montadas.",
            tag: "Laser Scanner Portátil"
        }
    ];

    return (
        <section className="sectors-section home-section" id="setores">
            <div className="blob-container" aria-hidden="true">
                <div className="blob blob--sectors"></div>
            </div>

            <div className="sectors-container home-container">
                <div className="section-header">
                    <div className="section-eyebrow">
                        <span className="eyebrow-line"></span>
                        <span className="section-sub">Atuação Multissetorial</span>
                    </div>
                    <div className="sectors-header-content section-header-split">
                        <h2 className="section-title">Segmentos Industriais Atendidos</h2>
                        <p className="sectors-description section-description">
                            Nossa infraestrutura e corpo técnico atendem aos mais rigorosos padrões
                            de conformidade técnica de indústrias que exigem tolerâncias micrométricas.
                        </p>
                    </div>
                </div>

                <div className="sectors-grid">
                    {sectorsList.map((sector) => (
                        <article key={sector.id} className="sector-card home-frosted-card">
                            <div className="sector-card-content">
                                <h3 className="sector-name">{sector.name}</h3>
                                <p className="sector-desc">{sector.description}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
