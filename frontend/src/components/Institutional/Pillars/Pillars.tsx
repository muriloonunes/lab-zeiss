import './Pillars.scss';
import { useTranslation } from "react-i18next";

export function Pillars() {
    const { t } = useTranslation();

    return (
        <section className="inst-section" id="pilares">
            <div className="inst-container">
                <div className="inst-section-header">
                    <div className="inst-eyebrow">
                        <span className="inst-eyebrow-line"></span>
                        <span className="inst-eyebrow-text">{t("institutional.pillars.subtitle")}</span>
                    </div>
                    <div className="inst-header-split">
                        <h2 className="inst-section-title">
                            {t("institutional.pillars.title")}
                        </h2>
                        <p className="inst-section-desc">
                            {t("institutional.pillars.description")}
                        </p>
                    </div>
                </div>

                <div className="inst-pillars-grid">
                    <div className="pillar-card glass-panel">
                        <div className="pillar-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="22" y1="12" x2="18" y2="12"></line>
                                <line x1="6" y1="12" x2="2" y2="12"></line>
                                <line x1="12" y1="6" x2="12" y2="2"></line>
                                <line x1="12" y1="22" x2="12" y2="18"></line>
                            </svg>
                        </div>
                        <h3 className="pillar-card-title">{t("institutional.pillars.items.gdt.title")}</h3>
                        <p className="pillar-card-desc">
                            {t("institutional.pillars.items.gdt.description")}
                        </p>
                    </div>

                    <div className="pillar-card glass-panel">
                        <div className="pillar-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path
                                    d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                        </div>
                        <h3 className="pillar-card-title">{t("institutional.pillars.items.accessibility.title")}</h3>
                        <p className="pillar-card-desc">
                            {t("institutional.pillars.items.accessibility.description")}
                        </p>
                    </div>

                    <div className="pillar-card glass-panel">
                        <div className="pillar-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon
                                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                        </div>
                        <h3 className="pillar-card-title">{t("institutional.pillars.items.techTransfer.title")}</h3>
                        <p className="pillar-card-desc">
                            {t("institutional.pillars.items.techTransfer.description")}
                        </p>
                    </div>

                    <div className="pillar-card glass-panel">
                        <div className="pillar-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                        <h3 className="pillar-card-title">{t("institutional.pillars.items.confidentiality.title")}</h3>
                        <p className="pillar-card-desc">
                            {t("institutional.pillars.items.confidentiality.description")}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
