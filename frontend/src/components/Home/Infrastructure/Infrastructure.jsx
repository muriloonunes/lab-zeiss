import "./Infrastructure.scss";
import { useTranslation } from "react-i18next";

export function Infrastructure() {
    const { t } = useTranslation();

    const machineCategories = [
        {
            category: t("home.infrastructure.categories.cmmXray.title"),
            items: [
                {
                    name: t("home.infrastructure.categories.cmmXray.items.prismo.name"),
                    desc: t("home.infrastructure.categories.cmmXray.items.prismo.desc")
                },
                {
                    name: t("home.infrastructure.categories.cmmXray.items.duramax.name"),
                    desc: t("home.infrastructure.categories.cmmXray.items.duramax.desc")
                },
                {
                    name: t("home.infrastructure.categories.cmmXray.items.oInspect.name"),
                    desc: t("home.infrastructure.categories.cmmXray.items.oInspect.desc")
                },
                {
                    name: t("home.infrastructure.categories.cmmXray.items.bosello.name"),
                    desc: t("home.infrastructure.categories.cmmXray.items.bosello.desc")
                }
            ]
        },
        {
            category: t("home.infrastructure.categories.optical3d.title"),
            items: [
                {
                    name: t("home.infrastructure.categories.optical3d.items.atos.name"),
                    desc: t("home.infrastructure.categories.optical3d.items.atos.desc")
                },
                {
                    name: t("home.infrastructure.categories.optical3d.items.tscan.name"),
                    desc: t("home.infrastructure.categories.optical3d.items.tscan.desc")
                }
            ]
        },
        {
            category: t("home.infrastructure.categories.software.title"),
            items: [
                {
                    name: t("home.infrastructure.categories.software.items.calypso.name"),
                    desc: t("home.infrastructure.categories.software.items.calypso.desc")
                },
                {
                    name: t("home.infrastructure.categories.software.items.reverseEngineering.name"),
                    desc: t("home.infrastructure.categories.software.items.reverseEngineering.desc")
                },
                {
                    name: t("home.infrastructure.categories.software.items.piweb.name"),
                    desc: t("home.infrastructure.categories.software.items.piweb.desc")
                },
                {
                    name: t("home.infrastructure.categories.software.items.inspect.name"),
                    desc: t("home.infrastructure.categories.software.items.inspect.desc")
                }
            ]
        }
    ];

    return (
        <section className="infrastructure-section home-section" id="infraestrutura">
            <div className="infra-container home-container">
                <div className="section-header">
                    <div className="section-eyebrow">
                        <span className="eyebrow-line"></span>
                        <span className="section-sub">{t("home.infrastructure.subtitle")}</span>
                    </div>
                    <h2 className="section-title">{t("home.infrastructure.mainTitle")}</h2>
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
