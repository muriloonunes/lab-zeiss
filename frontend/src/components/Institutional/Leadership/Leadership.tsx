import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './Leadership.scss';

interface LeaderData {
    id: 'mabel' | 'weinisch' | 'queija';
    authorKey: string;
    roleKey: string;
    quoteKey: string;
    entity: string;
    tag: string;
    image: string;
    imageAlt: string;
    objectPosition?: string;
}

const LEADERS: LeaderData[] = [
    {
        id: 'weinisch',
        authorKey: 'institutional.leadership.quotes.weinisch.author',
        roleKey: 'institutional.leadership.quotes.weinisch.role',
        quoteKey: 'institutional.leadership.quotes.weinisch.quote',
        entity: 'Carl Zeiss AG',
        tag: 'Padrão Tecnológico Global',
        image: '/images/Jochen.jpg',
        imageAlt: 'Jochen Weinisch, líder de vendas da Carl Zeiss AG na América Latina',
        objectPosition: 'center 60%'
    },
    {
        id: 'mabel',
        authorKey: 'institutional.leadership.quotes.mabel.author',
        roleKey: 'institutional.leadership.quotes.mabel.role',
        quoteKey: 'institutional.leadership.quotes.mabel.quote',
        entity: 'Sistema FIEG',
        tag: 'Inovação & Competitividade',
        image: '/images/Mabel.jpg',
        imageAlt: 'Imagem do Sandro Mabel, ex-presidente da FIEG',
        objectPosition: 'center 15%'
    },
    {
        id: 'queija',
        authorKey: 'institutional.leadership.quotes.queija.author',
        roleKey: 'institutional.leadership.quotes.queija.role',
        quoteKey: 'institutional.leadership.quotes.queija.quote',
        entity: 'Faculdade SENAI Ítalo Bologna',
        tag: 'Educação & Chão de Fábrica',
        image: '/images/Dario.jpg',
        imageAlt: 'Dario Queija, diretor da Faculdade SENAI Ítalo Bologna',
        objectPosition: 'center 10%'
    }
];

const AUTOPLAY_DURATION = 7500;

export function Leadership() {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % LEADERS.length);
    }, []);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + LEADERS.length) % LEADERS.length);
    }, []);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    useEffect(() => {
        if (isPaused) {
            if (progressTimerRef.current) clearInterval(progressTimerRef.current);
            return;
        }

        progressTimerRef.current = setInterval(() => {
            nextSlide();
        }, AUTOPLAY_DURATION);

        return () => {
            if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        };
    }, [isPaused, nextSlide, currentIndex]);

    const activeLeader = LEADERS[currentIndex];

    return (
        <section className="inst-section inst-leadership-section" id="liderancas">
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

                <div
                    className="leadership-carousel glass-panel"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    aria-roledescription="carousel"
                    aria-label="Depoimentos das lideranças"
                >
                    {/* Barra de progresso dos stories */}
                    <div className="carousel-progress-bars">
                        {LEADERS.map((leader, idx) => (
                            <button
                                key={leader.id}
                                className={`progress-bar-segment ${idx === currentIndex ? 'active' : ''} ${idx < currentIndex ? 'completed' : ''} ${isPaused ? 'paused' : ''}`}
                                onClick={() => goToSlide(idx)}
                                aria-label={`Ir para citação de ${t(leader.authorKey)}`}
                            >
                                <span
                                    className="progress-fill"
                                    style={{
                                        animationDuration: `${AUTOPLAY_DURATION}ms`
                                    }}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="carousel-body">
                        <div className="carousel-visual-col">
                            <div className="visual-image-wrapper">
                                <img
                                    key={activeLeader.image}
                                    src={activeLeader.image}
                                    alt={activeLeader.imageAlt}
                                    style={{ objectPosition: activeLeader.objectPosition || 'center' }}
                                    className="visual-image"
                                />
                                <div className="visual-overlay" />
                            </div>
                        </div>

                        <div className="carousel-quote-col">
                            <div className="quote-header">
                                <div className="quote-mark" aria-hidden="true">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                                    </svg>
                                </div>
                                <div className="carousel-counter">
                                    <span className="counter-current">0{currentIndex + 1}</span>
                                    <span className="counter-sep">/</span>
                                    <span className="counter-total">0{LEADERS.length}</span>
                                </div>
                            </div>

                            <blockquote className="quote-main">
                                <p className="quote-text" key={activeLeader.id}>
                                    {t(activeLeader.quoteKey)}
                                </p>
                            </blockquote>

                            <div className="quote-footer">
                                <div className="author-info">
                                    <h3 className="author-name">{t(activeLeader.authorKey)}</h3>
                                    <p className="author-role">{t(activeLeader.roleKey)}</p>
                                </div>

                                <div className="carousel-controls">
                                    <button
                                        onClick={prevSlide}
                                        className="control-btn"
                                        aria-label="Citação anterior"
                                        title="Anterior"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="15 18 9 12 15 6" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={nextSlide}
                                        className="control-btn"
                                        aria-label="Próxima citação"
                                        title="Próxima"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

