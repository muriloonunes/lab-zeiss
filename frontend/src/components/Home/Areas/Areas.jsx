import "./Areas.scss"

export function Areas() {
    const sectorsList = [
        {
            id: "food",
            name: "Alimentícia",
            description: "Mapa de desgaste de peças e inspeção de equipamentos de processamento e envase.",
        },
        {
            id: "automotive",
            name: "Automotivo & Autopeças",
            description: "Engenharia reversa e prototipagem de novas peças de alta performance.",
        },
        {
            id: "aerospace",
            name: "Aeroespacial & Defesa",
            description: "Controle dimensional de alta exatidão, análise de pás de turbinas e conformidade estrutural.",
        },
        {
            id: "medical",
            name: "Médico-Hospitalar & Implantes",
            description: "Digitalização e inspeção de próteses, dispositivos cirúrgicos e geometrias complexas.",
        },
        {
            id: "tooling",
            name: "Ferramentaria & Moldes",
            description: "Engenharia reversa e validação de matrizes, moldes de injeção e ferramentas de corte.",
        },
        {
            id: "agro",
            name: "Máquinas Agrícolas & Linha Pesada",
            description: "Verificação de peças de grande porte, carcaças fundidas e estruturas montadas.",
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
