import './Hero.scss';

export function Hero() {
    return (
        <section className="inst-hero-section">
            <div className="inst-container">
                <div className="inst-hero-grid">
                    <div className="inst-hero-content">
                        <h1 className="inst-hero-title">
                            Precisão alemã e expertise técnica brasileira a serviço da indústria de alta exigência.
                        </h1>
                        <p className="inst-hero-description">
                            Instalado na Faculdade SENAI Ítalo Bologna, em Goiânia, o Centro de Excelência em
                            Metrologia é resultado de uma aliança estratégica entre o Sistema FIEG / SENAI Goiás e a
                            Carl Zeiss. Atuamos como um dos cinco centros globais com esta capacidade para oferecer
                            soluções completas em medição tridimensional, engenharia reversa e conformidade
                            dimensional.
                        </p>
                    </div>

                    <div className="inst-hero-visual">
                        <div className="inst-facade-card glass-panel">
                            <div className="facade-image-wrapper">
                                <img
                                    src="/images/Lab-Fachada-3.jpg"
                                    alt="Fachada do Laboratório"
                                    width="580"
                                    height="400"
                                    className="facade-img"
                                />
                                <div className="facade-overlay-gradient"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
