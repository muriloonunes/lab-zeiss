import "./Contact.scss"
import React, {useState} from 'react';
import {useScrollToTop} from "../../hooks/useScrollToTop";
import {useTranslation} from "react-i18next";

export function Contact() {
    useScrollToTop();
    const {t} = useTranslation();

    const [formState, setFormState] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        service: 'cmm',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormState({...formState, [e.target.name]: e.target.value});
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Disparo para backend, mailto ou API interna
        alert(t('contact.form.sentNotice') || 'Solicitação enviada com sucesso!');
    };

    return (
        <div className="contact-page">
            <div className="contact-blob-container" aria-hidden="true">
                <div className="contact-blob contact-blob--top"></div>
                <div className="contact-blob contact-blob--bottom"></div>
            </div>

            <section className="contact-hero-section">
                <div className="contact-container">
                    <div className="contact-hero-content">
                        <div className="contact-eyebrow">
                            <span className="contact-eyebrow-line"></span>
                            <span className="contact-eyebrow-text">{t('contact.hero.eyebrow')}</span>
                        </div>
                        <h1 className="contact-hero-title">{t('contact.hero.title')}</h1>
                        <p className="contact-hero-description">{t('contact.hero.description')}</p>
                    </div>
                </div>
            </section>

            <section className="contact-main-section">
                <div className="contact-container">
                    <div className="contact-layout-split">

                        <div className="contact-form-side glass-panel">
                            <h2 className="form-title">{t('contact.form.title')}</h2>
                            <p className="form-subtitle">{t('contact.form.subtitle')}</p>

                            <form className="quote-form" onSubmit={handleSubmit}>
                                <div className="form-group-row">
                                    <div className="form-field">
                                        <label htmlFor="name">{t('contact.form.nameLabel')}</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            value={formState.name}
                                            onChange={handleChange}
                                            placeholder={t('contact.form.namePlaceholder')}
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label htmlFor="company">{t('contact.form.companyLabel')}</label>
                                        <input
                                            type="text"
                                            id="company"
                                            name="company"
                                            required
                                            value={formState.company}
                                            onChange={handleChange}
                                            placeholder={t('contact.form.companyPlaceholder')}
                                        />
                                    </div>
                                </div>

                                <div className="form-group-row">
                                    <div className="form-field">
                                        <label htmlFor="email">{t('contact.form.emailLabel')}</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            value={formState.email}
                                            onChange={handleChange}
                                            placeholder="exemplo@empresa.com.br"
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label htmlFor="phone">{t('contact.form.phoneLabel')}</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            required
                                            value={formState.phone}
                                            onChange={handleChange}
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="service">{t('contact.form.serviceLabel')}</label>
                                    <select id="service" name="service" value={formState.service}
                                            onChange={handleChange}>
                                        <option value="cmm">{t('services.dimensional.category')}</option>
                                        <option value="optical">{t('services.optical.category')}</option>
                                        <option value="xray">{t('services.xray.category')}</option>
                                        <option value="scanning">{t('services.scanning.category')}</option>
                                        <option value="reverse">{t('services.reverse.category')}</option>
                                        <option value="consulting">{t('contact.form.otherOption')}</option>
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="message">{t('contact.form.messageLabel')}</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={4}
                                        required
                                        value={formState.message}
                                        onChange={handleChange}
                                        placeholder={t('contact.form.messagePlaceholder')}
                                    />
                                </div>

                                <button type="submit" className="btn-orcamento submit-btn">
                                    <span>{t('contact.form.submitButton')}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                         strokeLinejoin="round" className="btn-icon" aria-hidden="true">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </button>
                            </form>
                        </div>

                        <div className="contact-info-side">
                            <div className="info-cards-stack">

                                <div className="contact-details-card glass-panel">
                                    <h3 className="card-heading">{t('footer.contactsTitle')}</h3>

                                    <div className="contact-subgroup">
                                        <span className="contact-badge">{t('footer.labCoordination')}</span>
                                        <p className="contact-line">
                                            <strong>{t('footer.techLead')}:</strong>{' '}
                                            <a href="tel:+55629XXXXXXXX" className="contact-link">(62) 9XXXX-XXXX</a>
                                        </p>
                                        <p className="contact-line">
                                            <strong>{t('footer.email')}:</strong>{' '}
                                            <a href="mailto:metrologia.zeiss@senaigo.com.br"
                                               className="contact-link">metrologia.zeiss@senaigo.com.br</a>
                                        </p>
                                    </div>

                                    <div className="contact-subgroup mt-sep">
                                        <span className="contact-badge">SENAI Ítalo Bologna</span>
                                        <p className="contact-line">
                                            <strong>{t('footer.phone')}:</strong>{' '}
                                            <a href="tel:+556232264500" className="contact-link">(62) 3226-4500</a>
                                        </p>
                                        <p className="contact-line">
                                            <strong>WhatsApp:</strong>{' '}
                                            <a href="https://wa.me/556299951773" target="_blank"
                                               rel="noopener noreferrer" className="contact-link">(62) 9995-1773</a>
                                        </p>
                                        <p className="business-hours">{t('footer.businessHours')}</p>
                                    </div>
                                </div>

                                <div className="maps-wrapper-card glass-panel">
                                    <div className="maps-header">
                                        <div>
                                            <strong>{t('footer.facility')}</strong>
                                            <span>{t('footer.street')} — {t('footer.city')}</span>
                                        </div>
                                        <a
                                            href="https://maps.app.goo.gl/u1RjodjSAJd9eu6a7"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-open-maps"
                                            aria-label="Abrir no Google Maps"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                                                 viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                                 strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="7" y1="17" x2="17" y2="7"></line>
                                                <polyline points="7 7 17 7 17 17"></polyline>
                                            </svg>
                                        </a>
                                    </div>
                                    <div className="iframe-container">
                                        <iframe
                                            title="Localização Faculdade SENAI Ítalo Bologna"
                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3822.42448380958!2d-49.27332932525001!3d-16.65562864475039!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935ef300350c9657%3A0x9af4fc354bd592f8!2sCentro%20de%20Excel%C3%AAncia%20em%20Metrologia%20Senai%20Zeiss!5e0!3m2!1spt-BR!2sbr!4v1789047179833!5m2!1spt-BR!2sbr"
                                            width="100%"
                                            height="260"
                                            style={{border: 0}}
                                            allowFullScreen={false}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}