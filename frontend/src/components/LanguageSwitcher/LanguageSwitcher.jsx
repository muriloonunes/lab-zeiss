import {useTranslation} from "react-i18next";

const languages = [
    {code: 'pt-BR', label: 'PT', flag: '🇧🇷'},
    {code: 'en', label: 'EN', flag: '🇺🇸'},
    {code: 'de', label: 'DE', flag: '🇩🇪'},
]

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const currentLang = i18n.language?.startsWith('de')
        ? 'de'
        : i18n.language?.startsWith('en')
            ? 'en'
            : 'pt-BR';

    return (
        <div className="language-switcher">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    type="button"
                    className={`lang-btn ${currentLang === lang.code ? 'active' : ''}`}
                    onClick={() => i18n.changeLanguage(lang.code)}
                    title={lang.label}
                >
                    <span className="lang-flag">{lang.flag}</span>
                    <span className="lang-code">{lang.label}</span>
                </button>
            ))}
        </div>
    );
}