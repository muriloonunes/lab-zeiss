import {useEffect, useState} from 'react';
import {Link, NavLink} from 'react-router-dom';
import './Navbar.scss';
import {LanguageSwitcher} from '../LanguageSwitcher/LanguageSwitcher.tsx';
import {useTranslation} from "react-i18next";
import {QuoteButton} from '../QuoteButton/QuoteButton.jsx';

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const verticalOffset = window.scrollY || document.documentElement.scrollTop || 0;
            setIsScrolled(verticalOffset > 18);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const {t} = useTranslation()

    return (
        <header className={`navbar${isScrolled ? ' scrolled' : ''} ${isMobileMenuOpen ? 'menu-open' : ''}`}>
            <div className="navbar-container">
                <div className="navbar-logo">
                    <Link to="/" className="logo-link" onClick={closeMobileMenu}
                          aria-label="Página Inicial - Centro de Excelência em Metrologia">
                        <img
                            src="/images/cem-logo.png"
                            alt="Centro de Excelência em Metrologia SENAI ZEISS"
                            width="180"
                            height="45"
                            className="brand-logo"
                        />
                    </Link>
                </div>

                <div className="navbar-nav-group desktop-only">
                    <nav className="nav-links" aria-label="Navegação Principal">
                        <ul>
                            <li><NavLink to="/institucional"
                                         className={({isActive}) => isActive ? 'active' : ''}>{t('nav.institutional')}</NavLink>
                            </li>
                            <li><NavLink to="/servicos"
                                         className={({isActive}) => isActive ? 'active' : ''}>{t('nav.services')}</NavLink>
                            </li>
                            <li><NavLink to="/contato"
                                         className={({isActive}) => isActive ? 'active' : ''}>{t('nav.contact')}</NavLink>
                            </li>
                        </ul>
                    </nav>

                    <LanguageSwitcher/>

                    <QuoteButton />
                </div>

                <div className="mobile-controls mobile-only">
                    <LanguageSwitcher/>
                    <button
                        type="button"
                        className="btn-hamburger mobile-only"
                        onClick={toggleMobileMenu}
                        aria-expanded={isMobileMenuOpen}
                        aria-label="Abrir menu de navegação"
                    >
                        <span className="hamburger-bar"></span>
                        <span className="hamburger-bar"></span>
                        <span className="hamburger-bar"></span>
                    </button>
                </div>
            </div>

            <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
                <nav className="mobile-nav-links" aria-label="Navegação Mobile">
                    <ul>
                        <li><NavLink to="/institucional" onClick={closeMobileMenu}
                                     className={({isActive}) => isActive ? 'active' : ''}>{t('nav.institutional')}</NavLink></li>
                        <li><NavLink to="/servicos" onClick={closeMobileMenu}
                                     className={({isActive}) => isActive ? 'active' : ''}>{t('nav.services')}</NavLink></li>
                        <li><NavLink to="/contato" onClick={closeMobileMenu}
                                     className={({isActive}) => isActive ? 'active' : ''}>{t('nav.contact')}</NavLink></li>
                    </ul>
                </nav>
                <div className="mobile-actions">
                    <QuoteButton className="mobile-btn-full" onClick={closeMobileMenu} />
                </div>
            </div>
        </header>
    );
}