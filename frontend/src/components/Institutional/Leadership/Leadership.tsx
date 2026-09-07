import './Leadership.scss';

export function Leadership() {
    return (
        <section className="inst-section" id="liderancas">
            <div className="inst-container">
                <div className="inst-header-center">
                    <div className="inst-eyebrow">
                        <span className="inst-eyebrow-line"></span>
                        <span className="inst-eyebrow-text">Chancela Institucional</span>
                    </div>
                    <h2 className="inst-section-title">A visão dos realizadores da aliança</h2>
                    <p className="inst-section-desc">
                        Compromisso firmado entre o Sistema Indústria e a multinacional Carl Zeiss com a
                        produtividade e competitividade fabril.
                    </p>
                </div>

                <div className="inst-quotes-grid">
                    <article className="quote-card glass-panel">
                        <p className="quote-text">
                            “A implantação do primeiro Centro de Excelência da Carl Zeiss no Brasil é um marco
                            histórico. A iniciativa visa impulsionar a formação profissional, além de promover o
                            avanço em pesquisa, desenvolvimento e inovação, atendendo às crescentes demandas da
                            indústria nacional por inovação e precisão.”
                        </p>
                        <div className="quote-author">
                            <strong>Sandro Mabel</strong>
                            <span>Ex-Presidente da FIEG e dos Conselhos Regionais do SESI e SENAI</span>
                        </div>
                    </article>

                    <article className="quote-card glass-panel">
                        <p className="quote-text">
                            “Estamos tendo a oportunidade de trazer nossa tecnologia de ponta para um novo
                            público-alvo. Apenas Estados Unidos, Alemanha e China têm um complexo similar. Juntos,
                            vamos ensinar a próxima geração a usar soluções inovadoras para alavancar a
                            produtividade e a qualidade dos produtos.”
                        </p>
                        <div className="quote-author">
                            <strong>Jochen Weinisch</strong>
                            <span>Vice-Presidente de Vendas (América Latina, Oriente Médio e África) — Carl Zeiss</span>
                        </div>
                    </article>

                    <article className="quote-card glass-panel">
                        <p className="quote-text">
                            “Além de beneficiar a indústria goiana, o complexo terá impacto nacional, tornando-se
                            referência em qualificação profissional e suporte técnico para o setor produtivo,
                            fortalecendo a relação entre educação e chão de fábrica.”
                        </p>
                        <div className="quote-author">
                            <strong>Dario Queija</strong>
                            <span>Diretor da Faculdade SENAI Ítalo Bologna</span>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
}
