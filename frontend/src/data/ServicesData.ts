import {CarouselImage} from "../components/ImageCarousel/CarouselImage";

export interface MachineSpec {
    name: string;
    category: string;
    volume: string;
    accuracy: string;
    sensor: string;
    software: string;
    features: string[];
}

export interface ServiceSubSection {
    index: string;
    category: string;
    title: string;
    description: string;
    applications: string[];
}

export interface ServiceDetailContent {
    title: string;
    headline: string;
    overview: string;
    trainingDirectNotice?: string;
    targetAudience?: string[];
    applications?: string[];
    deliverables?: string[];
    machines?: MachineSpec[];
    subServices?: ServiceSubSection[];
}

export interface ServiceMeta {
    id: string;
    galleryImages: CarouselImage[];
}

export const servicesData: Record<string, ServiceMeta> = {
    'cmm': {
        id: 'cmm',
        galleryImages: [
            { src: '/images/DuraMax1.jpg', alt: 'ZEISS DuraMax' },
            { src: '/images/DuraMax2.jpg', alt: 'Detalhe do apalpador CMM', objectPosition: 'center 60%' }
        ]
    },

    'optica': {
        id: 'optica',
        galleryImages: [
            { src: '/images/OInspect3.jpg', alt: 'ZEISS O-INSPECT em bancada', objectPosition: 'center 65%' },
            { src: '/images/OInspect2.jpg', alt: 'Sensor multissensor óptico', objectPosition: 'center 57%' }
        ]
    },

    'raio-x': {
        id: 'raio-x',
        galleryImages: [
            { src: '/images/Bosello1.jpg', alt: 'Cabine ZEISS BOSELLO MAX' },
            { src: '/images/Bosello2.jpg', alt: 'Posicionamento para ensaio de Raio-X', objectPosition: 'center 70%' }
        ]
    },

    'digitalizacao-3d': {
        id: 'digitalizacao-3d',
        galleryImages: [
            { src: '/images/AtosQ1.jpg', alt: 'Scanner óptico ZEISS ATOS Q' },
            { src: '/images/AtosQ2.jpg', alt: 'Digitalização com mesa rotativa', objectPosition: 'center 60%' }
        ]
    },

    'engenharia-reversa': {
        id: 'engenharia-reversa',
        galleryImages: [
            { src: '/images/ZRE1.png', alt: 'Estação de Engenharia Reversa' },
            { src: '/images/ZRE2.png', alt: 'Estação de Engenharia Reversa' }
        ]
    },

    'confiabilidade-mro': {
        id: 'confiabilidade-mro',
        galleryImages: []
    }
};
