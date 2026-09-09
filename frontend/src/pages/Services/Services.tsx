import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {QuoteButton} from '../../components/QuoteButton/QuoteButton';
import './Services.scss';
import {useScrollToTop} from "../../hooks/useScrollToTop";
import {ImageCarousel} from "../../components/ImageCarousel/ImageCarousel";
import {CarouselImage} from "../../components/ImageCarousel/CarouselImage";

export function Services() {
    useScrollToTop();
    const {t} = useTranslation();
    const navigate = useNavigate();

    const DuraMaxImages: CarouselImage[] = [
        {src: '/images/DuraMax1.jpg', alt: 'DuraMax'},
        {src: '/images/DuraMax2.jpg', alt: 'DuraMax', objectPosition: 'center 70%'},
    ]

    const OInspectImages: CarouselImage[] = [
        {src: '/images/OInspect1.jpg', alt: 'OInspect', objectPosition: 'center 63%'},
        {src: '/images/OInspect2.jpg', alt: 'OInspect', objectPosition: 'center 57%'},
    ]

    const BoselloImages: CarouselImage[] = [
        {src: '/images/Bosello1.jpg', alt: 'Bosello'},
        {src: '/images/Bosello2.jpg', alt: 'Bosello', objectPosition: 'center 70%'},
    ]

    const ScannerImages: CarouselImage[] = [
        {src: '/images/AtosQ1.jpg', alt: 'Atos Q'},
        {src: '/images/AtosQ2.jpg', alt: 'Atos Q', objectPosition: 'center 60%'},
    ]

    const ReverseEngineeringImages: CarouselImage[] = [
        {src: '/images/Senai-Laboratorio-2.jpg', alt: 'Engenharia Reversa'},
    ]

    return (
        <div className="services-page">
            <div className="services-blob-container" aria-hidden="true">
                <div className="services-blob services-blob--top"></div>
                <div className="services-blob services-blob--middle"></div>
                <div className="services-blob services-blob--bottom"></div>
            </div>

            <section className="services-hero-section">
                <div className="services-container">
                    <div className="services-hero-content">
                        <div className="services-eyebrow">
                            <span className="services-eyebrow-line"></span>
                            <span className="services-eyebrow-text">{t('services.hero.eyebrow')}</span>
                        </div>
                        <h1 className="services-hero-title">{t('services.hero.title')}</h1>
                        <p className="services-hero-description">{t('services.hero.description')}</p>
                    </div>
                </div>
            </section>

            <section className="service-row-section">
                <div className="services-container">
                    <div className="service-row-split">
                        <div className="service-text-side">
                            <span className="service-index-num">01</span>
                            <span className="service-category-tag">{t('services.dimensional.category')}</span>
                            <h2 className="service-row-title">{t('services.dimensional.title')}</h2>
                            <p className="service-paragraph">{t('services.dimensional.description')}</p>

                            <div className="service-applications-grid">
                                <div className="app-item"><span
                                    className="app-dot"></span>{t('services.dimensional.applications.dimensions')}</div>
                                <div className="app-item"><span
                                    className="app-dot"></span>{t('services.dimensional.applications.cad')}</div>
                                <div className="app-item"><span
                                    className="app-dot"></span>{t('services.dimensional.applications.wear')}</div>
                                <div className="app-item"><span
                                    className="app-dot"></span>{t('services.dimensional.applications.gdt')}</div>
                            </div>
                        </div>

                        <div className="service-visual-side">
                            <div className="service-image-card glass-panel">
                                <ImageCarousel images={DuraMaxImages}/>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="service-row-section service-row-section--alt">
                <div className="services-container">
                    <div className="service-row-split service-row-split--reverse">
                        <div className="service-text-side">
                            <span className="service-index-num">02</span>
                            <span className="service-category-tag">{t('services.optical.category')}</span>
                            <h2 className="service-row-title">{t('services.optical.title')}</h2>
                            <p className="service-paragraph">{t('services.optical.description')}</p>

                            <div className="service-applications-grid">
                                <div className="app-item"><span
                                    className="app-dot"></span>{t('services.optical.applications.nonContact')}</div>
                                <div className="app-item"><span
                                    className="app-dot"></span>{t('services.optical.applications.surface')}</div>
                                <div className="app-item"><span
                                    className="app-dot"></span>{t('services.optical.applications.fineFeatures')}</div>
                            </div>
                        </div>

                        <div className="service-visual-side">
                            <div className="service-image-card glass-panel">
                                <ImageCarousel images={OInspectImages}/>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="service-row-section">
                <div className="services-container">
                    <div className="service-row-split">
                        <div className="service-text-side">
                            <span className="service-index-num">03</span>
                            <span className="service-category-tag">{t('services.xray.category')}</span>
                            <h2 className="service-row-title">{t('services.xray.title')}</h2>
                            <p className="service-paragraph">{t('services.xray.description')}</p>

                            <div className="service-applications-grid">
                                <div className="app-item"><span
                                    className="app-dot"></span>{t('services.xray.applications.cracks')}</div>
                                <div className="app-item"><span
                                    className="app-dot"></span>{t('services.xray.applications.voids')}</div>
                                <div className="app-item"><span
                                    className="app-dot"></span>{t('services.xray.applications.welding')}</div>
                                <div className="app-item"><span
                                    className="app-dot"></span>{t('services.xray.applications.foreign')}</div>
                            </div>
                        </div>

                        <div className="service-visual-side">
                            <div className="service-image-card glass-panel">
                                <ImageCarousel images={BoselloImages}/>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="service-row-section service-row-section--alt">
                <div className="services-container">
                    <div className="service-row-split service-row-split--reverse">
                        <div className="service-text-side">
                            <span className="service-index-num">04</span>
                            <span className="service-category-tag">{t('services.scanning.category')}</span>
                            <h2 className="service-row-title">{t('services.scanning.title')}</h2>
                            <p className="service-paragraph">{t('services.scanning.description')}</p>
                        </div>

                        <div className="service-visual-side">
                            <div className="service-image-card glass-panel">
                                <ImageCarousel images={ScannerImages}/>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="service-row-section">
                <div className="services-container">
                    <div className="service-row-split">
                        <div className="service-text-side">
                            <span className="service-index-num">05</span>
                            <span className="service-category-tag">{t('services.reverse.category')}</span>
                            <h2 className="service-row-title">{t('services.reverse.title')}</h2>
                            <p className="service-paragraph">{t('services.reverse.description')}</p>
                        </div>

                        <div className="service-visual-side">
                            <div className="service-image-card glass-panel">
                                <ImageCarousel images={ReverseEngineeringImages}/>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="selection-guide-section">
                <div className="services-container">
                    <div className="selection-header">
                        <div className="services-eyebrow">
                            <span className="services-eyebrow-line"></span>
                            <span className="services-eyebrow-text">{t('services.selection.eyebrow')}</span>
                        </div>
                        <h2 className="services-section-title">{t('services.selection.title')}</h2>
                        <p className="services-section-desc">{t('services.selection.description')}</p>
                    </div>

                    <div className="selection-grid">
                        <div className="selection-card glass-panel">
                            <h3 className="selection-card-title">{t('services.selection.items.dimensions.title')}</h3>
                            <p className="selection-card-desc">{t('services.selection.items.dimensions.description')}</p>
                        </div>
                        <div className="selection-card glass-panel">
                            <h3 className="selection-card-title">{t('services.selection.items.nonContact.title')}</h3>
                            <p className="selection-card-desc">{t('services.selection.items.nonContact.description')}</p>
                        </div>
                        <div className="selection-card glass-panel">
                            <h3 className="selection-card-title">{t('services.selection.items.internal.title')}</h3>
                            <p className="selection-card-desc">{t('services.selection.items.internal.description')}</p>
                        </div>
                        <div className="selection-card glass-panel">
                            <h3 className="selection-card-title">{t('services.selection.items.scanning.title')}</h3>
                            <p className="selection-card-desc">{t('services.selection.items.scanning.description')}</p>
                        </div>
                        <div className="selection-card glass-panel">
                            <h3 className="selection-card-title">{t('services.selection.items.cad.title')}</h3>
                            <p className="selection-card-desc">{t('services.selection.items.cad.description')}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="services-cta-section">
                <div className="services-container">
                    <div className="services-cta-card glass-panel">
                        <div className="cta-content">
                            <div className="services-eyebrow">
                                <span className="services-eyebrow-line"></span>
                                <span className="services-eyebrow-text">Vamos conversar</span>
                            </div>
                            <h2 className="cta-title">Tem um desafio de medição?</h2>
                            <p className="cta-description">
                                Conte-nos sobre sua peça, aplicação ou necessidade de inspeção. Nossa equipe pode ajudar
                                a definir a abordagem mais adequada. </p>
                        </div>
                        <div className="cta-actions">
                            <QuoteButton onClick={() => navigate('/contato')}>
                                Solicitar Análise Técnica
                            </QuoteButton>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
