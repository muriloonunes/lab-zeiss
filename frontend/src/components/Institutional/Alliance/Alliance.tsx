import './Alliance.scss';
import {useTranslation} from "react-i18next";

export function Alliance() {
    const {t} = useTranslation();

    return (
        <section className="inst-section" id="alianca">
            <div className="inst-container">
                <div className="inst-split-grid">
                    <div className="inst-alliance-visual">
                        <div className="alliance-image-card glass-panel">
                            <div className="alliance-img-wrapper">
                                <img
                                    src="/images/Logo-Zeiss-OInspect-Cortada.png"
                                    alt="Visão geral do Laboratório de Metrologia SENAI ZEISS"
                                    className="alliance-img"
                                />
                                <div className="alliance-overlay-gradient"></div>
                            </div>
                        </div>
                    </div>
                    <div className="inst-alliance-content">
                        <div className="inst-eyebrow">
                            <span className="inst-eyebrow-line"></span>
                            <span className="inst-eyebrow-text">{t("institutional.alliance.subtitle")}</span>
                        </div>
                        <h2 className="inst-section-title">{t("institutional.alliance.title")}</h2>
                        <p className="inst-paragraph">{t("institutional.alliance.intro")}</p>
                        <p className="inst-paragraph">{t("institutional.alliance.paragraph")}</p>
                    </div>
                </div>

                <div className="governance-strip glass-panel">
                    <div className="governance-col">
                        <div className="gov-header">
                            <span className="gov-dot"></span>
                            <strong className="gov-entity">{t("institutional.alliance.governance.zeiss.name")}</strong>
                        </div>
                        <p className="gov-desc">{t("institutional.alliance.governance.zeiss.description")}</p>
                    </div>

                    <div className="governance-col">
                        <div className="gov-header">
                            <span className="gov-dot"></span>
                            <strong className="gov-entity">{t("institutional.alliance.governance.senai.name")}</strong>
                        </div>
                        <p className="gov-desc">{t("institutional.alliance.governance.senai.description")}</p>
                    </div>

                    <div className="governance-col">
                        <div className="gov-header">
                            <span className="gov-dot"></span>
                            <strong className="gov-entity">{t("institutional.alliance.governance.fieg.name")}</strong>
                        </div>
                        <p className="gov-desc">{t("institutional.alliance.governance.fieg.description")}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
