import {useTranslation} from "react-i18next";
import './LanguageSwitcher.scss';
import {useEffect, useRef, useState} from "react";

interface LanguageOption {
    code: string;
    label: string;
    countryCode: string;
}

const languages: LanguageOption[] = [
    { code: 'pt-BR', label: 'PT', countryCode: 'br' },
    { code: 'en', label: 'EN', countryCode: 'us' },
    { code: 'de', label: 'DE', countryCode: 'de' },
];

export function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLangCode = i18n.language?.startsWith('de')
        ? 'de'
        : i18n.language?.startsWith('en')
            ? 'en'
            : 'pt-BR';

    const currentLanguage = languages.find((l) => l.code === currentLangCode) || languages[0];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (code: string) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
    };

    return (
        <div className="lang-dropdown-wrapper" ref={dropdownRef}>
            <button
                type="button"
                className={`lang-dropdown-trigger ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <span className={`fi fi-${currentLanguage.countryCode} lang-flag-svg`} />
                <span className="lang-label">{currentLanguage.label}</span>
                <svg
                    className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {isOpen && (
                <ul className="lang-dropdown-menu" role="listbox">
                    {languages.map((lang) => (
                        <li key={lang.code} role="option" aria-selected={currentLangCode === lang.code}>
                            <button
                                type="button"
                                className={`lang-menu-item ${currentLangCode === lang.code ? 'selected' : ''}`}
                                onClick={() => handleSelect(lang.code)}
                            >
                                <span className={`fi fi-${lang.countryCode} lang-flag-svg`} />
                                <span className="lang-label">{lang.label}</span>
                                {currentLangCode === lang.code && (
                                    <span className="active-dot" />
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}