import { Link, useNavigate } from 'react-router-dom';
import { QuoteButton } from '../../QuoteButton/QuoteButton';
import './CTA.scss';

export function CTA() {
    const navigate = useNavigate();

    return (
        <section className="inst-section inst-cta-section">
            <div className="inst-container">
                <div className="inst-cta-card glass-panel">
                    <div className="inst-cta-content">
                        <div className="inst-eyebrow">
                            <span className="inst-eyebrow-line"></span>
                            <span className="inst-eyebrow-text">Agende uma Visita Técnica</span>
                        </div>
                        <h2 className="inst-cta-title">
                            Conheça a infraestrutura do laboratório na Faculdade SENAI Ítalo Bologna.
                        </h2>
                        <p className="inst-cta-desc">
                            Nossa equipe técnica está à disposição para avaliar suas necessidades em medição
                            tridimensional, digitalização ou validação dimensional.
                        </p>
                    </div>
                    <div className="inst-cta-actions">
                        <QuoteButton onClick={() => navigate('/contato')}>
                            Solicitar Contato Técnico
                        </QuoteButton>
                        <Link to="/servicos" className="btn-mais">
                            <span>Explorar Catálogo de Serviços</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="btn-icon"
                                aria-hidden="true"
                            >
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
