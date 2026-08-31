import "./Infrastructure.scss";
import { useTranslation } from "react-i18next";

export function Infrastructure() {
    const { t } = useTranslation();

    const machineCategories = [
        {
            category: "Sistemas CMM & Raio-X",
            items: [
                { name: "ZEISS PRISMO", desc: "Máxima exatidão e velocidade para geometrias de altíssima exigência." },
                { name: "ZEISS DuraMax (500)", desc: "Medição por coordenadas robusta em ambiente fabril e laboratorial." },
                { name: "ZEISS O-INSPECT", desc: "Multisensor integrando medição óptica e apalpamento por contato." },
                { name: "ZEISS BOSELLO MAX", desc: "Inspeção não destrutiva (NDT) e análise de integridade interna por Raio-X." }
            ]
        },
        {
            category: "Digitalização 3D & Óptica",
            items: [
                { name: "ATOS Q", desc: "Sensor óptico 3D de precisão com tecnologia de luz azul estruturada (Blue Light)." },
                { name: "T-SCAN Hawk 2", desc: "Scanner a laser portátil para inspeções em campo e engenharia reversa flexível." }
            ]
        },
        {
            category: "Softwares Homologados",
            items: [
                { name: "ZEISS CALYPSO", desc: "Programação e GD&T" },
                { name: "ZEISS Reverse Engineering", desc: "Modelagem CAD/Superfícies" },
                { name: "ZEISS PiWeb", desc: "Gestão e Análise Estatística" },
                { name: "ZEISS INSPECT", desc: "Inspeção de Malhas 3D" }
            ]
        }
    ];

    return (
        <section className="infrastructure-section home-section" id="infraestrutura">
            <div className="infra-container home-container">
                <div className="section-header">
                    <div className="section-eyebrow">
                        <span className="eyebrow-line"></span>
                        <span className="section-sub">Nossa Infraestrutura</span>
                    </div>
                    <h2 className="section-title">Tecnologia ZEISS em 140m² de laboratório</h2>
                </div>

                <div className="infra-cards-grid">
                    {machineCategories.map((cat, idx) => (
                        <article key={idx} className="infra-card home-frosted-card">
                            <div className="infra-card-header">
                                <h3 className="infra-card-title">{cat.category}</h3>
                            </div>
                            <div className="infra-items-list">
                                {cat.items.map((item, i) => (
                                    <div key={i} className="infra-item">
                                        <div className="infra-item-indicator" />
                                        <div className="infra-item-text">
                                            <strong>{item.name}</strong>
                                            <span>{item.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}