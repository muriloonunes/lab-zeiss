import './Leadership.scss';
import {useTranslation} from "react-i18next";

export function Leadership() {
    const { t } = useTranslation();

    return (
        <section className="inst-section" id="liderancas">
            <div className="inst-container">
                <div className="inst-section-header">
                    <div className="inst-eyebrow">
                        <span className="inst-eyebrow-line"></span>
                        <span className="inst-eyebrow-text">{t("institutional.leadership.subtitle")}</span>
                    </div>
                    <div className="inst-header-split">
                        <h2 className="inst-section-title">{t("institutional.leadership.title")}</h2>
                        <p className="inst-section-desc">{t("institutional.leadership.description")}</p>
                    </div>
                </div>

                <div className="inst-quotes-grid">
                    <article className="quote-card glass-panel">
                        <p className="quote-text">
                            {t("institutional.leadership.quotes.mabel.quote")}
                        </p>
                        <div className="quote-author">
                            <strong>{t("institutional.leadership.quotes.mabel.author")}</strong>
                            <span>{t("institutional.leadership.quotes.mabel.role")}</span>
                        </div>
                    </article>

                    <article className="quote-card glass-panel">
                        <p className="quote-text">
                            {t("institutional.leadership.quotes.weinisch.quote")}
                        </p>
                        <div className="quote-author">
                            <strong>{t("institutional.leadership.quotes.weinisch.author")}</strong>
                            <span>{t("institutional.leadership.quotes.weinisch.role")}</span>
                        </div>
                    </article>

                    <article className="quote-card glass-panel">
                        <p className="quote-text">
                            {t("institutional.leadership.quotes.queija.quote")}
                        </p>
                        <div className="quote-author">
                            <strong>{t("institutional.leadership.quotes.queija.author")}</strong>
                            <span>{t("institutional.leadership.quotes.queija.role")}</span>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
}
