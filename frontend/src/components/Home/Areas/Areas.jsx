import "./Areas.scss"
import {useTranslation} from "react-i18next";

export function Areas() {
    const {t} = useTranslation();

    const sectorsList = [
        {
            id: "food",
            name: t("home.areas.sectors.food.title"),
            description: t("home.areas.sectors.food.description")
        },
        {
            id: "automotive",
            name: t("home.areas.sectors.automotive.title"),
            description: t("home.areas.sectors.automotive.description"),
        },
        {
            id: "aerospace",
            name: t("home.areas.sectors.aerospace.title"),
            description: t("home.areas.sectors.aerospace.description"),
        },
        {
            id: "medical",
            name: t("home.areas.sectors.medical.title"),
            description: t("home.areas.sectors.medical.description"),
        },
        {
            id: "tooling",
            name: t("home.areas.sectors.tooling.title"),
            description: t("home.areas.sectors.tooling.description"),
        },
        {
            id: "agricultural",
            name: t("home.areas.sectors.agricultural.title"),
            description: t("home.areas.sectors.agricultural.description"),
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
                        <span className="section-sub">{t("home.areas.subtitle")}</span>
                    </div>
                    <div className="sectors-header-content section-header-split">
                        <h2 className="section-title">{t("home.areas.mainTitle")}</h2>
                        <p className="sectors-description section-description">{t("home.areas.description")}</p>
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
