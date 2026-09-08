import React, {useState} from 'react';
import './ImageCarousel.scss'

export function ImageCarousel({images}) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) return null;

    if (images.length === 1) {
        return (
            <div className="carousel-container">
                <div className="service-img-wrapper portrait-3-4">
                    <img src={images[0].src} alt={images[0].alt} className="service-img"/>
                    <div className="service-img-overlay"/>
                </div>
            </div>
        );
    }
    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }

    return (
        <div className="carousel-container">
            <div className="service-img-wrapper portrait-3-4">
                <img
                    src={images[currentIndex].src}
                    alt={images[currentIndex].alt}
                    className="service-img"
                />
                <div className="service-img-overlay" />
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