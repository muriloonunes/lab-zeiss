import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './Hero.scss';

export function Hero() {
    const { t } = useTranslation();
    const videoRef = useRef<HTMLVideoElement>(null);

    const [isVideoReady, setIsVideoReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [shouldLoadVideo, setShouldLoadVideo] = useState(true);

    useEffect(() => {
        const nav = navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } };
        const isDataSaver = nav.connection?.saveData;
        const isSlowConnection = nav.connection?.effectiveType === '2g' || nav.connection?.effectiveType === 'slow-2g';
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (isDataSaver || isSlowConnection || prefersReducedMotion) {
            setShouldLoadVideo(false);
            setIsPlaying(false);
        }
    }, []);

    const togglePlay = () => {
        if (!videoRef.current) return;

        if (!shouldLoadVideo) {
            setShouldLoadVideo(true);
        }

        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(() => {
                setIsPlaying(false);
            });
        }
    };

    return (
        <section className="inst-hero-section">
            <div className="inst-container">
                <div className="inst-hero-cinema-card glass-panel">
                    <div className="cinema-media-wrapper">
                        <img
                            src="/images/Lab-Fachada-3.jpg"
                            alt={t('institutional.hero.imageAlt')}
                            className={`cinema-poster-img ${isVideoReady ? 'hidden' : ''}`}
                            loading="eager"
                        />

                        {shouldLoadVideo && (
                            <video
                                ref={videoRef}
                                className={`cinema-video ${isVideoReady ? 'ready' : ''}`}
                                autoPlay
                                loop
                                muted
                                playsInline
                                disablePictureInPicture
                                preload="metadata"
                                poster="/images/Lab-Fachada-3.jpg"
                                onCanPlayThrough={() => setIsVideoReady(true)}
                                onLoadedData={() => setIsVideoReady(true)}
                            >
                                <source src="/videos/lab-showcase.mp4" type="video/mp4" />
                            </video>
                        )}

                        {/* Máscara de vinheta cinematográfica garantindo contraste WCAG perfeito */}
                        <div className="cinema-overlay-gradient" />
                    </div>

                    {/* Conteúdo sobreposto na área cinematográfica */}
                    <div className="cinema-content-overlay">
                        <div className="cinema-text-block">
                            <h1 className="cinema-hero-title">
                                {t('institutional.hero.title')}
                            </h1>
                            <p className="cinema-hero-desc">
                                {t('institutional.hero.description')}
                            </p>
                        </div>

                        {/* Controle sutil de reprodução no canto do widescreen */}
                        <div className="cinema-controls-bottom">
                            <button
                                type="button"
                                className="cinema-control-btn"
                                onClick={togglePlay}
                                aria-label={isPlaying ? 'Pausar vídeo do laboratório' : 'Reproduzir vídeo do laboratório'}
                                title={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
                            >
                                {isPlaying ? (
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                        <rect x="6" y="4" width="4" height="16" />
                                        <rect x="14" y="4" width="4" height="16" />
                                    </svg>
                                ) : (
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

