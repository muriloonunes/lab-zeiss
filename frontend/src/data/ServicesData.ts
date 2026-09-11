export interface MachineSpec {
    name: string;
    category: string;
    volume: string;
    accuracy: string;
    sensor: string;
    software: string;
    features: string[];
}

export interface ServiceData {
    id: string;
    categoryTag: string;
    title: string;
    headline: string;
    overview: string;
    targetAudience: string[];
    applications: string[];
    deliverables: string[];
    machines: MachineSpec[];
    galleryImages: { src: string; alt: string; objectPosition?: string }[];
}

export const servicesData: Record<string, ServiceData> = {
    'cmm': {
        id: 'cmm',
        categoryTag: 'Metrologia Tátil e Dimensional',
        title: 'Medição por Coordenadas (CMM) & GD&T',
        headline: 'Exatidão submicrométrica para geometrias críticas e conformidade geométrica rigorosa.',
        overview: 'Serviço voltado à caracterização geométrica e linear tridimensional de peças de alta exigência mecânica. Utilizando sistemas CMM por contato contínuo (scanning tátil), avaliamos desvios de forma, orientação e posição segundo as normas ISO 1101 e ASME Y14.5.',
        targetAudience: [
            'Usinagens de precisão e ferramentarias de matrizes',
            'Montadoras e fornecedores da cadeia automotiva (Tier 1/Tier 2)',
            'Indústria de defesa e aeroespacial com rastreabilidade formal',
            'Fabricantes de peças seriadas com necessidade de First Article Inspection (FAI)'
        ],
        applications: [
            'Verificação dimensional e linear de blocos e carcaças',
            'Inspeção GD&T completa (batimento, circularidade, planicidade)',
            'Homologação de primeiro artigo usinado (FAI)',
            'Estudo de repetibilidade e capacidade de processos (Cp, Cpk)'
        ],
        deliverables: [
            'Relatório metrológico analítico detalhado ponto a ponto',
            'Comparativo numérico nominal vs. medido com toleranciamento',
            'Certificado de conformidade assinado por responsável técnico'
        ],
        machines: [
            {
                name: 'ZEISS PRISMO',
                category: 'CMM Bridge de Altíssima Exatidão',
                volume: '700 × 900 × 500 mm',
                accuracy: 'E0 a partir de 0,9 + L/350 µm',
                sensor: 'ZEISS VAST Gold e ZEISS RDS',
                software: 'ZEISS CALYPSO com VAST Navigator, VAST Probing e FlyScan',
                features: [
                    'Balanças de vitrocerâmica Robax® com resolução de 200 nm imunes a dilatação',
                    'Computer-Aided Accuracy (CAA) para correção dinâmica em scanning de alta velocidade (até 300 mm/s)',
                    'Pacote ZEISS VAST Performance com FlyScan (redução de ciclo de até 70%) e QuickChange',
                    'Controlador C99m com desligamento automatizado de energia e ar (PowerSaver e AirSaver)'
                ]
            },
            {
                name: 'ZEISS DuraMax',
                category: 'CMM de Chão de Fábrica e Laboratório',
                volume: '500 × 500 × 500 mm',
                accuracy: 'E0 de 2,4 + L/300 µm',
                sensor: 'ZEISS VAST XXT',
                software: 'ZEISS CALYPSO',
                features: [
                    'Operação 100% elétrica sem necessidade de linha de ar comprimido',
                    'Balanças de vitrocerâmica com estabilidade térmica garantida de 18 °C a 30 °C',
                    'Base de sustentação ShopFloor com vedação e proteção mecânica IP54',
                    'Carregamento ergonômico da peça por três lados e por cima'
                ]
            }
        ],
        galleryImages: [
            { src: '/images/DuraMax1.jpg', alt: 'ZEISS DuraMax em inspeção' },
            { src: '/images/DuraMax2.jpg', alt: 'Detalhe do apalpador CMM', objectPosition: 'center 70%' }
        ]
    },

    'optica': {
        id: 'optica',
        categoryTag: 'Metrologia Multissensor Sem Contato',
        title: 'Inspeção Óptica & Dimensional Combinada',
        headline: 'Medição de alta resolução sem contato mecânico para peças flexíveis e microgeometrias.',
        overview: 'Combina câmeras ópticas de alta definição com lentes telecêntricas e apalpamento por contato contínuo na mesma máquina. Elimina deformações causadas por pressão de toque em elastômeros, polímeros finos, tecidos técnicos e circuitos eletrônicos.',
        targetAudience: [
            'Indústria de dispositivos médicos, implantes e próteses',
            'Fabricantes de componentes plásticos injetados de parede fina',
            'Indústria eletroeletrônica e microconectores',
            'Setor têxtil técnico e de embalagens poliméricas'
        ],
        applications: [
            'Inspeção sem contato de furações micrométricas e bordas vivas',
            'Avaliação de microdeformações e raios em componentes elásticos',
            'Medição rápida 2D/3D no mesmo sistema sem troca de fixação'
        ],
        deliverables: [
            'Relatório de análise dimensional óptica com imagens ampliadas',
            'Mapas de desvio de contorno 2D contra desenho vetorial (DXF/CAD)',
            'Laudo técnico de conformidade de bordas e perfis'
        ],
        machines: [
            {
                name: 'ZEISS O-INSPECT',
                category: 'Sistema de Medição Óptica e Multissensor',
                volume: '500 × 400 × 300 mm',
                accuracy: '1D: 1,4 + L/250 µm | 2D: 1,6 + L/250 µm | 3D: 1,9 + L/250 µm (ISO 10360)',
                sensor: 'Câmera ZEISS Discovery.V12 + Sensor de contato VAST XXT',
                software: 'ZEISS CALYPSO Multisensor',
                features: [
                    'Lente zoom ZEISS Discovery.V12 com campo de visão 4× maior e sem distorção periférica',
                    'Sistema de iluminação versátil com 4 anéis e LEDs azuis/vermelhos em 8 segmentos individuais',
                    'Apalpamento tátil contínuo VAST XXT com suporte a pontas radiais e em estrela',
                    'Suporte para acoplamento do sensor cromático de luz branca ZEISS DotScan',
                    'Isolamento pneumático contra vibrações estruturais do solo'
                ]
            }
        ],
        galleryImages: [
            { src: '/images/OInspect1.jpg', alt: 'ZEISS O-INSPECT em bancada', objectPosition: 'center 63%' },
            { src: '/images/OInspect2.jpg', alt: 'Sensor multissensor óptico', objectPosition: 'center 57%' }
        ]
    },

    'raio-x': {
        id: 'raio-x',
        categoryTag: 'Ensaios Não Destrutivos (NDT)',
        title: 'Inspeção por Raio-X & Análise Estrutural',
        headline: 'Investigação volumétrica interna e integridade sem corte ou destruição da amostra.',
        overview: 'Inspeção radioscópica 2D e tomografia não destrutiva para identificar descontinuidades internas ocultas. Avalia peças fundidas, soldas e montagens seladas com base na absorção e densidade radiológica dos materiais.',
        targetAudience: [
            'Fundições de alumínio, ferro e ligas especiais',
            'Fabricantes de conjuntos soldados críticos para energia e óleo & gás',
            'Montadores de dispositivos eletromecânicos selados ou blindados',
            'Engenharia forense e análise de falhas em garantia'
        ],
        applications: [
            'Detecção de porosidades, bolhas, rechupes e trincas internas',
            'Inspeção da raiz e penetração de cordões de solda',
            'Verificação de posicionamento de componentes em caixas seladas',
            'Mapeamento de inclusões e descontinuidades metalúrgicas'
        ],
        deliverables: [
            'Radiografias digitais de alta resolução com indicação de vazios',
            'Relatório de análise de porosidade conforme normas industriais',
            'Laudo técnico de integridade estrutural interna'
        ],
        machines: [
            {
                name: 'ZEISS BOSELLO MAX',
                category: 'Sistema de Inspeção Radioscópica 2D/3D',
                volume: 'Capacidade para amostras de até 600 × 900 mm e 50 kg',
                accuracy: 'Resolução focal microfoco com detecção de defeitos submilimétricos',
                sensor: 'Detector digital de tela plana (Flat Panel) de alto contraste',
                software: 'ZEISS Inspect / Visualização Radioscópica',
                features: [
                    'Cabine blindada com máxima segurança operacional radiológica',
                    'Manipulador robotizado de eixos para rotação angular completa da peça',
                    'Filtros digitais em tempo real para redução de ruído e aumento de borda'
                ]
            }
        ],
        galleryImages: [
            { src: '/images/Bosello1.jpg', alt: 'Cabine ZEISS BOSELLO MAX' },
            { src: '/images/Bosello2.jpg', alt: 'Posicionamento para ensaio de Raio-X', objectPosition: 'center 70%' }
        ]
    },

    'digitalizacao-3d': {
        id: 'digitalizacao-3d',
        categoryTag: 'Digitalização 3D e Fotogrametria',
        title: 'Digitalização Óptica 3D & Análise por Mapa de Cores',
        headline: 'Captura geométrica integral sem contato para controle dimensional e ajuste de matrizes.',
        overview: 'Digitalização tridimensional de alta densidade através de luz azul estruturada e triangulação a laser portátil. Gera nuvens de pontos de altíssima fidelidade para comparação direta contra o modelo nominal (CAD vs. Peça).',
        targetAudience: [
            'Montadoras, estamparias e ferramentarias de corte e dobra',
            'Fabricantes de peças fundidas e forjadas de médio e grande porte',
            'Indústria de calçados, embalagens e geometrias orgânicas',
            'Equipes de controle de qualidade que demandam inspeção em chão de fábrica'
        ],
        applications: [
            'Geração de mapas colorimétricos de desvio (Color Map nominal vs. real)',
            'Inspeção rápida de empenamento, torção e retorno elástico (spring-back)',
            'Digitalização in-loco em peças de grande porte que não podem se deslocar',
            'Geração de arquivos STL de malha fechada para controle dimensional'
        ],
        deliverables: [
            'Relatório com mapa de cores 3D demonstrando zonas de excesso e falta',
            'Malha poligonal tratada e alinhada (STL, OBJ, PLY)',
            'Laudo comparativo de desvios dimensionais de superfícies livres'
        ],
        machines: [
            {
                name: 'ZEISS ATOS Q',
                category: 'Sensor Óptico 3D por Luz Azul Estruturada',
                volume: 'Volumes de medição intercambiáveis (100 a 500 mm por campo)',
                accuracy: 'Resolução de até 2 × 12 milhões de pontos por tomada',
                sensor: 'Câmeras estereoscópicas com tecnologia Blue Light Equalizer',
                software: 'ZEISS INSPECT Optical 3D',
                features: [
                    'Resistente a poeira e respingos d’água para operação fabril (IP52)',
                    'Braço de fibra de carbono com estabilização térmica de ótica',
                    'Mesa giratória automatizada sincronizada para aquisição 360°'
                ]
            },
            {
                name: 'ZEISS T-SCAN Hawk 2',
                category: 'Scanner a Laser Portátil 3D',
                volume: 'Alcance flexível para componentes de 50 mm até mais de 4 metros',
                accuracy: 'Exatidão volumétrica com fotogrametria integrada',
                sensor: 'Multi-linhas de laser azul de alta velocidade',
                software: 'ZEISS INSPECT',
                features: [
                    'Design leve, operado com uma só mão para inspeção de campo',
                    'Capaz de capturar superfícies reflexivas, escuras ou usinadas sem spray',
                    'Modo de linha única para áreas profundas, furos e fendas estreitas'
                ]
            }
        ],
        galleryImages: [
            { src: '/images/AtosQ1.jpg', alt: 'Scanner óptico ZEISS ATOS Q' },
            { src: '/images/AtosQ2.jpg', alt: 'Digitalização com mesa rotativa', objectPosition: 'center 60%' }
        ]
    },

    'engenharia-reversa': {
        id: 'engenharia-reversa',
        categoryTag: 'Modelagem Digital Paramétrica',
        title: 'Engenharia Reversa & Reconstrução CAD',
        headline: 'Transformação de dados escaneados em sólidos paramétricos prontos para usinagem.',
        overview: 'Processo completo de engenharia para reconstruir o modelo digital tridimensional de peças físicas que não possuem desenho técnico original, estão desgastadas ou sofreram modificações empíricas de ferramentaria.',
        targetAudience: [
            'Manutenção industrial com necessidade de reposição de peças obsoletas',
            'Empresas de mineração e agroindústria com maquinário importado',
            'Desenvolvedores de produtos e protótipos de alta performance',
            'Fabricantes de moldes que precisam recuperar geometrias originais'
        ],
        applications: [
            'Modelagem CAD a partir de malhas poligonais (Mesh to CAD)',
            'Recuperação de peças quebradas com reconstrução das partes ausentes',
            'Adaptação geométrica para modernização e melhoria de desempenho fabril',
            'Extração de perfis, seções 2D e árvores de construção'
        ],
        deliverables: [
            'Modelos sólidos e de superfícies paramétricos em formatos STEP, IGES ou Parasolid',
            'Desenhos técnicos 2D em PDF e DWG com toleranciamento de fabricação',
            'Relatório de desvio de reconstrução comparando o CAD gerado com a malha real'
        ],
        machines: [
            {
                name: 'Ecossistema ZEISS Reverse Engineering',
                category: 'Suíte Especializada de Software CAD & Reconstrução',
                volume: 'Sem restrição de dimensões de modelo',
                accuracy: 'Superfícies de classe A com continuidade de curvatura G1/G2',
                sensor: 'Alimentado por dados de digitalização ATOS Q e T-SCAN Hawk 2',
                software: 'ZEISS Reverse Engineering',
                features: [
                    'Segmentação automática de geometrias regulares (planos, cilindros, cones)',
                    'Ajuste preciso de superfícies livres com controle numérico de desvio residual',
                    'Exportação compatível com SolidWorks, Siemens NX, CATIA e Inventor'
                ]
            }
        ],
        galleryImages: [
            { src: '/images/Senai-Laboratorio-2.jpg', alt: 'Estação de Engenharia Reversa' }
        ]
    }
};