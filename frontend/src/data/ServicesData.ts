import {CarouselImage} from "../components/ImageCarousel/CarouselImage";

export interface MachineMedia {
    src: string;
    alt: string;
    fit?: 'cover' | 'contain';
    background?: string;
}

export interface MachineSpec {
    name: string;
    category: string;
    volume: string;
    accuracy: string;
    sensor: string;
    software: string;
    features: string[];
    image?: string;
    imageAlt?: string;
    imageFit?: 'cover' | 'contain';
    imageBg?: string;
}

export const machineMediaMap: Record<string, MachineMedia> = {
    'ZEISS DuraMax': {
        src: '/images/DuraMaxOfc.png',
        alt: 'ZEISS DuraMax - CMM de Chão de Fábrica e Laboratório',
        fit: 'contain',
        background: '#ffffff'
    },
    'ZEISS PRISMO': {
        src: '/images/PrismoOfc.png',
        alt: 'ZEISS PRISMO - CMM de Altíssima Exatidão',
        fit: 'cover'
    },
    'ZEISS O-INSPECT': {
        src: '/images/OInspectOfc.png',
        alt: 'ZEISS O-INSPECT - Medição Óptica e Multissensor',
        fit: 'cover'
    },
    'ZEISS BOSELLO MAX': {
        src: '/images/BoselloOfc.png',
        alt: 'ZEISS BOSELLO MAX - Sistema de Raio-X Industrial',
        fit: 'cover'
    },
    'ZEISS ATOS Q': {
        src: '/images/AtosQOfc.png',
        alt: 'ZEISS ATOS Q - Digitalizador Óptico 3D',
        fit: 'cover'
    },
    'ZEISS T-SCAN hawk 2': {
        src: '/images/TScanOfc.png',
        alt: 'ZEISS T-SCAN hawk 2 - Scanner 3D a Laser Portátil',
        fit: 'cover'
    },
    'Ecossistema ZEISS Reverse Engineering': {
        src: '/images/ZRE3.png',
        alt: 'Ecossistema ZEISS Reverse Engineering - Software CAD 3D',
        fit: 'contain',
        background: '#0d1117'
    }
};

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
            { src: '/images/Impressao-3d.jpg', alt: 'Prototipagem', objectPosition: 'center 45%' },
            { src: '/images/ZRE2.png', alt: 'Estação de Engenharia Reversa' },

        ]
    },

    'confiabilidade-mro': {
        id: 'confiabilidade-mro',
        galleryImages: [
            { src: '/images/CAD.png', alt: 'Análise de falhas em componentes' },
        ]
    }
};
