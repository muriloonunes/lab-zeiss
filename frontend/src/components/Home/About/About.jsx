import './About.scss';
import {useTranslation} from "react-i18next";

export function About() {
    const {t} = useTranslation();

    const highlights = [
        {
            value: "1 de 5",
            label: "Laboratórios no mundo",
            detail: "Infraestrutura com tecnologia e capacidade analítica rara globalmente."
        },
        {
            value: "140m²",
            label: "Ambiente Climatizado",
            detail: "Sala limpa com controle rigoroso de temperatura (20°C ± 0,5°C) e umidade."
        },
        {
            value: "100%",
            label: "Padrão ZEISS",
            detail: "Equipamentos e softwares homologados internacionalmente."
        },
        {
            value: "GD&T",
            label: "Alta Exatidão",
            detail: "Inspeção geométrica micrométrica com rastreabilidade metrológica."
        }
    ];

    return (
        <section className="about-section" id="sobre">
            <div className="blob-container" aria-hidden="true">
                <div className="blob blob--about"></div>
            </div>
            <div className="about-container">
                <div className="section-header">
                    <div className="section-eyebrow">
                        <span className="eyebrow-line"></span>
                        <span className="section-sub">Nosso diferencial</span>
                    </div>
                    <div className="about-header-content">
                        <h2 className="section-title">Por que o CEM SENAI / ZEISS?</h2>
                        <p className="about-description">
                            Unimos a tecnlogia alemã de ponta da Zeiss à excelência técnica do SENAI para entregar
                            soluções metrológicas completas e atender às necessidades da indústria.
                        </p>
                    </div>
                </div>

                <div className="about-metrics-grid">
                    {highlights.map((item, index) => (
                        <article key={index} className="about-metric-card">
                            <div className="metric-header">
                                <span className="metric-value">{item.value}</span>
                            </div>
                            <div className="card-content">
                                <h3 className="metric-label">{item.label}</h3>
                                <p className="metric-detail">{item.detail}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}