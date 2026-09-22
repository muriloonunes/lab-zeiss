import {useEffect, useState, useRef} from 'react';
import {Link, NavLink, useLocation} from 'react-router-dom';
import './Navbar.scss';
import {LanguageSwitcher} from '../LanguageSwitcher/LanguageSwitcher.tsx';
import {useTranslation} from "react-i18next";
import {QuoteButton} from '../QuoteButton/QuoteButton.jsx';

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
    const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();
    const {t} = useTranslation();

    useEffect(() => {
        const handleScroll = () => {
            const verticalOffset = window.scrollY || document.documentElement.scrollTop || 0;
            setIsScrolled(verticalOffset > 18);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menus when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsMobileServicesOpen(false);
        setIsServicesDropdownOpen(false);
    }, [location.pathname]);

    // Close desktop dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsServicesDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prev => !prev);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
        setIsMobileServicesOpen(false);
    };

    const toggleMobileServices = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMobileServicesOpen(prev => !prev);
    };

    const isServicesActive = location.pathname.startsWith('/servicos');

    const serviceItems = [
        { id: 'cmm', path: '/servicos/cmm', key: 'cmm' },
        { id: 'optica', path: '/servicos/optica', key: 'optica' },
        { id: 'raio-x', path: '/servicos/raio-x', key: 'raioX' },
        { id: 'digitalizacao-3d', path: '/servicos/digitalizacao-3d', key: 'scan3d' },
        { id: 'engenharia-reversa', path: '/servicos/engenharia-reversa', key: 'reverseEng' },
        { id: 'confiabilidade-mro', path: '/servicos/confiabilidade-mro', key: 'mro' },
    ];

    return (
        <header className={`navbar${isScrolled ? ' scrolled' : ''} ${isMobileMenuOpen ? 'menu-open' : ''}`}>
            <div className="navbar-container">
                <div className="navbar-logo">
                    <Link to="/" className="logo-link" onClick={closeMobileMenu}
                          aria-label="Página Inicial - Centro de Excelência em Metrologia">
                        <img
                            src="/images/cem-logo.png"
                            alt="Centro de Excelência em Metrologia SENAI ZEISS"
                            className="brand-logo"
                        />
                        <span className="brand-divider" aria-hidden="true"></span>
                        <img
                            src="/images/zeiss-logo-coop.png"
                            alt="Cooperação Tecnológica ZEISS"
                            width="123"
                            height="65"
                            className="brand-logo-coop"
                        />
                    </Link>
                </div>

                <div className="navbar-nav-group desktop-only">
                    <nav className="nav-links" aria-label="Navegação Principal">
                        <ul>
                            <li>
                                <NavLink
                                    to="/institucional"
                                    className={({isActive}) => isActive ? 'active' : ''}
                                >
                                    {t('nav.institutional')}
                                </NavLink>
                            </li>

                            <li
                                className={`nav-item-dropdown ${isServicesActive ? 'parent-active' : ''} ${isServicesDropdownOpen ? 'dropdown-open' : ''}`}
                                ref={dropdownRef}
                                onMouseEnter={() => setIsServicesDropdownOpen(true)}
                                onMouseLeave={() => setIsServicesDropdownOpen(false)}
                            >
                                <NavLink
                                    to="/servicos"
                                    className={({isActive}) => (isActive || isServicesActive) ? 'active nav-link-with-arrow' : 'nav-link-with-arrow'}
                                    aria-haspopup="true"
                                    aria-expanded={isServicesDropdownOpen}
                                >
                                    <span>{t('nav.services')}</span>
                                    <svg
                                        className="nav-arrow-icon"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </NavLink>

                                <div className="nav-dropdown-menu" role="menu">
                                    <div className="dropdown-inner">
                                        <NavLink
                                            to="/servicos"
                                            end
                                            className={({isActive}) => `dropdown-item ${isActive ? 'active' : ''}`}
                                            role="menuitem"
                                            onClick={() => setIsServicesDropdownOpen(false)}
                                        >
                                            {t('nav.allServices', 'Todos os Serviços')}
                                        </NavLink>
                                        {serviceItems.map((item) => (
                                            <NavLink
                                                key={item.id}
                                                to={item.path}
                                                className={({isActive}) => `dropdown-item ${isActive ? 'active' : ''}`}
                                                role="menuitem"
                                                onClick={() => setIsServicesDropdownOpen(false)}
                                            >
                                                {t(`nav.servicesList.${item.key}`, item.id)}
                                            </NavLink>
                                        ))}
                                    </div>
                                </div>
                            </li>

                            <li>
                                <NavLink
                                    to="/contato"
                                    className={({isActive}) => isActive ? 'active' : ''}
                                >
                                    {t('nav.contact')}
                                </NavLink>
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
                        <li>
                            <NavLink
                                to="/institucional"
                                onClick={closeMobileMenu}
                                className={({isActive}) => isActive ? 'active' : ''}
                            >
                                {t('nav.institutional')}
                            </NavLink>
                        </li>

                        <li className={`mobile-nav-item-dropdown ${isMobileServicesOpen ? 'expanded' : ''}`}>
                            <div className="mobile-nav-row">
                                <NavLink
                                    to="/servicos"
                                    onClick={closeMobileMenu}
                                    className={({isActive}) => (isActive || isServicesActive) ? 'active mobile-parent-link' : 'mobile-parent-link'}                                >
                                    {t('nav.services')}
                                </NavLink>
                                <button
                                    type="button"
                                    className={`btn-mobile-arrow ${isMobileServicesOpen ? 'rotated' : ''}`}
                                    onClick={toggleMobileServices}
                                    aria-label="Expandir submenu de serviços"
                                    aria-expanded={isMobileServicesOpen}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </button>
                            </div>

                            <div className={`mobile-submenu ${isMobileServicesOpen ? 'expanded' : ''}`}>
                                <NavLink
                                    to="/servicos"
                                    end
                                    onClick={closeMobileMenu}
                                    className={({isActive}) => `mobile-sub-link ${isActive ? 'active' : ''}`}
                                >
                                    {t('nav.allServices', 'Todos os Serviços')}
                                </NavLink>
                                {serviceItems.map((item) => (
                                    <NavLink
                                        key={item.id}
                                        to={item.path}
                                        onClick={closeMobileMenu}
                                        className={({isActive}) => `mobile-sub-link ${isActive ? 'active' : ''}`}
                                    >
                                        {t(`nav.servicesList.${item.key}`, item.id)}
                                    </NavLink>
                                ))}
                            </div>
                        </li>

                        <li>
                            <NavLink
                                to="/contato"
                                onClick={closeMobileMenu}
                                className={({isActive}) => isActive ? 'active' : ''}
                            >
                                {t('nav.contact')}
                            </NavLink>
                        </li>
                    </ul>
                </nav>
                <div className="mobile-actions">
                    <QuoteButton className="mobile-btn-full" onClick={closeMobileMenu} />
                </div>
            </div>
        </header>
    );
}
