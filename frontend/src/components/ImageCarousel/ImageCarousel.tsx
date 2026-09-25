import React, {useCallback, useEffect, useRef, useState} from 'react';
import './ImageCarousel.scss'
import {CarouselImage} from "./CarouselImage";

export interface ImageCarouselProps {
    images: CarouselImage[];
    intervalTime?: number,
    autoPlay?: boolean,
}

export function ImageCarousel({images, intervalTime = 4000, autoPlay = true}: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length]);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images.length]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
        touchEndX.current = null;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;

        const distance = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 50; // Mínimo de pixels para disparar a troca

        if (distance > minSwipeDistance) {
            // Arrastou para a esquerda -> próximo slide
            nextSlide();
        } else if (distance < -minSwipeDistance) {
            // Arrastou para a direita -> slide anterior
            prevSlide();
        }

        touchStartX.current = null;
        touchEndX.current = null;
    };

    useEffect(() => {
        if (!autoPlay || !images || images.length <= 1 || isHovered) return;

        const timer = setInterval(() => {
            nextSlide();
        }, intervalTime);

        return () => clearInterval(timer);
    }, [currentIndex, isHovered, autoPlay, intervalTime, nextSlide, images]);

    if (!images || images.length === 0) return null;

    if (images.length === 1) {
        return (
            <div className="carousel-container">
                <div className="service-img-wrapper img-frame">
                    <img
                        src={images[0].src}
                        alt={images[0].alt}
                        style={{objectPosition: images[0].objectPosition || 'center'}}
                        className="service-img"
                    />
                    <div className="service-img-overlay"/>
                </div>
            </div>
        );
    }

    return (
        <div
            className="carousel-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="service-img-wrapper img-frame">
                <div
                    className="carousel-track"
                    style={{transform: `translateX(-${currentIndex * 100}%)`}}
                >
                    {images.map((img, idx) => (
                        <div key={idx} className="carousel-slide">
                            <img
                                src={img.src}
                                alt={img.alt}
                                className="service-img"
                                style={{objectPosition: img.objectPosition || 'center'}}
                            />
                        </div>
                    ))}
                </div>
                <div className="service-img-overlay"/>
                <button
                    type="button"
                    className="carousel-btn carousel-btn--prev"
                    onClick={prevSlide}
                    aria-label="Imagem anterior"
                >
                    &#10094;
                </button>
                <button
                    type="button"
                    className="carousel-btn carousel-btn--next"
                    onClick={nextSlide}
                    aria-label="Próxima imagem"
                >
                    &#10095;
                </button>
                <div className="carousel-dots">
                    {images.map((_, idx) => (
                        <span
                            key={idx}
                            className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(idx)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}