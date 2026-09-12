import "./Contact.scss";
import React, {useState, useEffect, useRef} from 'react';
import {useLocation, useSearchParams} from 'react-router-dom';
import {useScrollToTop} from "../../hooks/useScrollToTop";
import {useTranslation} from "react-i18next";

const SERVICE_KEYS = ['cmm', 'optica', 'raio-x', 'digitalizacao-3d', 'engenharia-reversa', 'consultoria'] as const;
type ServiceKey = typeof SERVICE_KEYS[number];

const normalizeServiceId = (rawId: string | null | undefined): ServiceKey => {
    if (!rawId) return 'cmm';
    const lower = rawId.toLowerCase().trim();
    if (lower === 'cmm' || lower === 'dimensional') return 'cmm';
    if (lower === 'optica' || lower === 'optical') return 'optica';
    if (lower === 'raio-x' || lower === 'xray' || lower === 'raiox') return 'raio-x';
    if (lower === 'digitalizacao-3d' || lower === 'scan3d' || lower === 'scanning') return 'digitalizacao-3d';
    if (lower === 'engenharia-reversa' || lower === 'reverse' || lower === 'reverseeng') return 'engenharia-reversa';
    if (lower === 'consultoria' || lower === 'consulting') return 'consultoria';
    return 'cmm';
};

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ACCEPTED_EXTENSIONS = '.pdf,.step,.stp,.iges,.igs,.dwg,.dxf,.stl,.zip,.rar';

export function Contact() {
    useScrollToTop();
    const {t} = useTranslation();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const initialServiceParam = searchParams.get('service') || (location.state as { serviceId?: string })?.serviceId;
    const initialService = normalizeServiceId(initialServiceParam);
    const hasInitialTarget = Boolean(initialServiceParam);

    const [isTargeted, setIsTargeted] = useState<boolean>(hasInitialTarget);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);

    const [formState, setFormState] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        service: initialService,
        partQuantity: '',
        message: ''
    });

    useEffect(() => {
        const currentParam = searchParams.get('service') || (location.state as { serviceId?: string })?.serviceId;
        if (currentParam) {
            const resolved = normalizeServiceId(currentParam);
            setFormState(prev => ({...prev, service: resolved}));
            setIsTargeted(true);
        }
    }, [searchParams, location.state]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormState({...formState, [e.target.name]: e.target.value});
    };

    const handleServiceSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value as ServiceKey;
        setFormState({...formState, service: val});
        setIsTargeted(false);
    };

    const validateAndSetFile = (file: File) => {
        setFileError(null);
        if (file.size > MAX_FILE_SIZE) {
            setFileError(t('contact.form.fileSizeError') || 'O arquivo excede o limite máximo permitido de 25MB.');
            return;
        }
        setAttachedFile(file);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setAttachedFile(null);
        setFileError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(t('contact.form.sentNotice') || 'Solicitação enviada com sucesso! Nossa equipe técnica entrará em contato.');
    };

    const currentServiceName = t(`contact.form.services.${formState.service}`, {defaultValue: formState.service});

    return (
        <div className="contact-page">
            <div className="contact-blob-container" aria-hidden="true">
                <div className="contact-blob contact-blob--top"></div>
                <div className="contact-blob contact-blob--bottom"></div>
            </div>

            <section className="contact-hero-section">
                <div className="contact-container">
                    <div className="contact-hero-content">
                        <span className="contact-eyebrow">{t('contact.hero.eyebrow')}</span>
                        <h1 className="contact-hero-title">{t('contact.hero.title')}</h1>
                        <p className="contact-hero-description">{t('contact.hero.description')}</p>
                    </div>
                </div>
            </section>

            <section className="contact-main-section">
                <div className="contact-container">
                    <div className="contact-layout-split">

                        <div className="contact-form-side glass-panel">
                            {isTargeted && (
                                <div className="context-badge-banner">
                                    <div className="context-badge-info">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="context-icon" aria-hidden="true">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <polyline points="12 6 12 12 14 14"></polyline>
                                        </svg>
                                        <span>
                                            <strong>{t('contact.form.contextBadge')}</strong> {currentServiceName}
                                        </span>
                                    </div>
                                </div>
                            )}

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

                                <div className="form-group-row">
                                    <div className="form-field">
                                        <label htmlFor="service">{t('contact.form.serviceLabel')}</label>
                                        <select
                                            id="service"
                                            name="service"
                                            value={formState.service}
                                            onChange={handleServiceSelectChange}
                                        >
                                            <option value="cmm">{t('contact.form.services.cmm')}</option>
                                            <option value="optica">{t('contact.form.services.optica')}</option>
                                            <option value="raio-x">{t('contact.form.services.raio-x')}</option>
                                            <option value="digitalizacao-3d">{t('contact.form.services.digitalizacao-3d')}</option>
                                            <option value="engenharia-reversa">{t('contact.form.services.engenharia-reversa')}</option>
                                            <option value="consultoria">{t('contact.form.services.consultoria')}</option>
                                        </select>
                                    </div>
                                    <div className="form-field">
                                        <label htmlFor="partQuantity">{t('contact.form.partQuantityLabel')}</label>
                                        <input
                                            type="text"
                                            id="partQuantity"
                                            name="partQuantity"
                                            value={formState.partQuantity}
                                            onChange={handleChange}
                                            placeholder={t('contact.form.partQuantityPlaceholder')}
                                        />
                                    </div>
                                </div>

                                {/* Drag & Drop CAD / Technical Drawing Upload Zone */}
                                <div className="form-field">
                                    <label htmlFor="technical-file-input">{t('contact.form.drawingLabel')}</label>
                                    <input
                                        type="file"
                                        id="technical-file-input"
                                        ref={fileInputRef}
                                        onChange={handleFileInputChange}
                                        accept={ACCEPTED_EXTENSIONS}
                                        style={{display: 'none'}}
                                    />

                                    {!attachedFile ? (
                                        <div
                                            className={`dropzone-box ${isDragging ? 'drag-active' : ''}`}
                                            onClick={() => fileInputRef.current?.click()}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    fileInputRef.current?.click();
                                                }
                                            }}
                                            aria-label={t('contact.form.dropzoneTitle')}
                                        >
                                            <div className="dropzone-icon-wrap">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                    <polyline points="17 8 12 3 7 8"></polyline>
                                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                                </svg>
                                            </div>
                                            <p className="dropzone-title">
                                                {isDragging ? t('contact.form.dropzoneDragActive') : t('contact.form.dropzoneTitle')}
                                            </p>
                                            <span className="dropzone-hint">{t('contact.form.dropzoneHint')}</span>
                                        </div>
                                    ) : (
                                        <div className="file-preview-card">
                                            <div className="file-preview-info">
                                                <div className="file-icon-badge">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                        <polyline points="14 2 14 8 20 8"></polyline>
                                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                                        <polyline points="10 9 9 9 8 9"></polyline>
                                                    </svg>
                                                </div>
                                                <div className="file-text-details">
                                                    <strong className="file-name" title={attachedFile.name}>
                                                        {attachedFile.name}
                                                    </strong>
                                                    <span className="file-size">{formatFileSize(attachedFile.size)}</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleRemoveFile}
                                                className="btn-remove-file"
                                                aria-label={t('contact.form.removeFile')}
                                                title={t('contact.form.removeFile')}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                </svg>
                                            </button>
                                        </div>
                                    )}

                                    {fileError && (
                                        <p className="file-error-message" role="alert">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                            </svg>
                                            {fileError}
                                        </p>
                                    )}
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

                                <div className="confidentiality-notice">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                    <span>{t('contact.form.confidentialityNotice')}</span>
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
