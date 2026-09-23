import "./Contact.scss";
import React, {useState, useEffect, useRef} from 'react';
import {useLocation, useSearchParams} from 'react-router-dom';
import {useScrollToTop} from "../../hooks/useScrollToTop";
import {useTranslation} from "react-i18next";
import {enviarSolicitacaoPublica} from "../../services/solicitacaoService";
import {Solicitacao} from "../../types/solicitacao";
import {ApiError} from "../../types/api";

const SERVICE_KEYS = ['cmm', 'optica', 'raio-x', 'digitalizacao-3d', 'engenharia-reversa', 'confiabilidade-mro', 'consultoria'] as const;
type ServiceKey = typeof SERVICE_KEYS[number];

const normalizeServiceId = (rawId: string | null | undefined): ServiceKey => {
    if (!rawId) return 'cmm';
    const lower = rawId.toLowerCase().trim();
    if (lower === 'cmm' || lower === 'dimensional') return 'cmm';
    if (lower === 'optica' || lower === 'optical') return 'optica';
    if (lower === 'raio-x' || lower === 'xray' || lower === 'raiox') return 'raio-x';
    if (lower === 'digitalizacao-3d' || lower === 'scan3d' || lower === 'scanning') return 'digitalizacao-3d';
    if (lower === 'engenharia-reversa' || lower === 'reverse' || lower === 'reverseeng') return 'engenharia-reversa';
    if (lower === 'confiabilidade-mro' || lower === 'mro' || lower === 'confiabilidade') return 'confiabilidade-mro';
    if (lower === 'consultoria' || lower === 'consulting') return 'consultoria';
    return 'cmm';
};

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatPhoneNumber = (value: string): string => {
    let digits = value.replace(/\D/g, '');

    // Strip Brazil country code (55) if pasted with full international format
    if (digits.length > 11 && digits.startsWith('55')) {
        digits = digits.slice(2);
    }

    if (digits.length === 0) return '';
    if (digits.length === 1) return `(${digits}`;
    if (digits.length === 2) return `(${digits}) `;

    const ddd = digits.slice(0, 2);
    let rest = digits.slice(2);

    // Auto-insert mandatory 9 digit if user starts typing a number without 9
    if (rest.length > 0 && rest[0] !== '9') {
        rest = '9' + rest;
    }

    rest = rest.slice(0, 9);

    if (rest.length <= 5) {
        return `(${ddd}) ${rest}`;
    }
    return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
};

const MAX_FILES = 5;
const MAX_TOTAL_FILE_SIZE = 25 * 1024 * 1024; // 25MB total
const ACCEPTED_EXTENSIONS = [
    '.pdf', '.step', '.stp', '.iges', '.igs', '.dwg', '.dxf', '.stl', '.zip', '.rar', '.jpg', '.jpeg', '.png',
    'application/pdf', 'application/zip', 'model/stl', 'image/jpeg', 'image/png'
];

const EXTENSOES_VALIDAS = ['pdf', 'step', 'stp', 'iges', 'igs', 'dwg', 'dxf', 'stl', 'zip', 'rar', 'jpg', 'jpeg', 'png'];

export function Contact() {
    useScrollToTop();
    const {t} = useTranslation();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const initialServiceParam = searchParams.get('service') || (location.state as { serviceId?: string })?.serviceId;
    const initialService = normalizeServiceId(initialServiceParam);

    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
    const [successData, setSuccessData] = useState<Solicitacao | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [copiado, setCopiado] = useState<boolean>(false);

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
        }
    }, [searchParams, location.state]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormState({...formState, [e.target.name]: e.target.value});
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        if (formState.phone.length > raw.length && (raw.endsWith(')') || raw.endsWith('(') || raw.endsWith(' '))) {
            const digits = raw.replace(/\D/g, '');
            const trimmed = digits.slice(0, -1);
            setFormState(prev => ({...prev, phone: formatPhoneNumber(trimmed)}));
            return;
        }
        setFormState(prev => ({...prev, phone: formatPhoneNumber(raw)}));
    };

    const handleServiceSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value as ServiceKey;
        setFormState({...formState, service: val});
    };

    const validateAndAddFiles = (incomingFiles: FileList | File[]) => {
        setFileError(null);
        const incomingArray = Array.from(incomingFiles);
        if (incomingArray.length === 0) return;

        const combinedFiles = [...attachedFiles];
        const existingKeys = new Set(combinedFiles.map(f => `${f.name}-${f.size}`));
        const filesToAdd: File[] = [];

        for (const file of incomingArray) {
            const fileName =  file.name;
            const lastDotIndex = fileName.lastIndexOf('.');

            if (lastDotIndex === -1) continue;

            const extensao = fileName.substring(lastDotIndex + 1).toLowerCase();

            if (!EXTENSOES_VALIDAS.includes(extensao)) {
                setFileError(t('contact.form.invalidFileExtension') || 'Extensão de arquivo inválida.');
                return;
            }

            const key = `${file.name}-${file.size}`;
            if (!existingKeys.has(key)) {
                filesToAdd.push(file);
                existingKeys.add(key);
            }
        }

        if (combinedFiles.length + filesToAdd.length > MAX_FILES) {
            setFileError(t('contact.form.maxFilesError') || 'Você pode anexar no máximo 5 arquivos no total.');
            return;
        }

        const nextFiles = [...combinedFiles, ...filesToAdd];
        const totalSize = nextFiles.reduce((acc, f) => acc + f.size, 0);

        if (totalSize > MAX_TOTAL_FILE_SIZE) {
            setFileError(t('contact.form.totalFileSizeError') || 'A soma dos arquivos selecionados excede o limite máximo de 25MB.');
            return;
        }

        setAttachedFiles(nextFiles);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndAddFiles(e.target.files);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
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
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndAddFiles(e.dataTransfer.files);
        }
    };

    const handleRemoveFile = (indexToRemove: number) => {
        setAttachedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
        setFileError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCopiarProtocolo = () => {
        if (!successData) return;
        navigator.clipboard.writeText(successData.codigo);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2500);
    };

    const handleResetForm = () => {
        setFormState({
            name: '',
            company: '',
            email: '',
            phone: '',
            service: 'cmm',
            partQuantity: '',
            message: ''
        });
        setAttachedFiles([]);
        setFileError(null);
        setSubmitError(null);
        setSubmitSuccess(false);
        setSuccessData(null);
        setCopiado(false);
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (!formState.name.trim() || !formState.company.trim() || !formState.email.trim() || !formState.phone.trim()) {
            setSubmitError(t('contact.success.validationError', {defaultValue: 'Por favor, preencha todos os campos obrigatórios.'}));
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('nome', formState.name.trim());
            formData.append('empresa', formState.company.trim());
            formData.append('email', formState.email.trim());
            formData.append('telefone', formState.phone.trim());
            formData.append('servico', formState.service);

            if (formState.partQuantity.trim()) {
                formData.append('quantidadePecas', formState.partQuantity.trim());
            }

            if (formState.message.trim()) {
                formData.append('mensagem', formState.message.trim());
            }

            for (const file of attachedFiles) {
                formData.append('files', file);
            }

            const response = await enviarSolicitacaoPublica(formData);
            setSuccessData(response);
            setSubmitSuccess(true);
        } catch (err: unknown) {
            if (err instanceof ApiError) {
                setSubmitError(err.message || 'Erro ao enviar a solicitação. Verifique os dados informados.');
            } else {
                setSubmitError(t('contact.success.connectionError', {defaultValue: 'Não foi possível conectar ao servidor. Tente novamente em instantes.'}));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentServiceName = t(`contact.form.services.${formState.service}`, {defaultValue: formState.service});
    const totalAttachedSize = attachedFiles.reduce((acc, f) => acc + f.size, 0);

    const whatsappMessageText = successData ? t('contact.success.whatsappMessage', {
        codigo: successData.codigo,
        defaultValue: `Olá, gostaria de informações sobre a minha solicitação de orçamento (Protocolo: ${successData.codigo})`
    }) : '';

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
                            {submitSuccess && successData ? (
                                <div className="contact-success-simple">
                                    <div className="success-icon-wrap">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>

                                    <h2 className="success-title">{t('contact.success.title', {defaultValue: 'Solicitação Enviada!'})}</h2>
                                    <p className="success-subtitle">
                                        {t('contact.success.subtitle', {defaultValue: 'Recebemos sua solicitação com sucesso. Nossa equipe técnica analisará as informações e entrará em contato em breve.'})}
                                    </p>

                                    <div className="success-protocol-box">
                                        <span className="protocol-label">{t('contact.success.protocolLabel', {defaultValue: 'Número de Protocolo'})}</span>
                                        <div className="protocol-row">
                                            <strong className="protocol-code">{successData.codigo}</strong>
                                            <button
                                                type="button"
                                                onClick={handleCopiarProtocolo}
                                                className={`btn-copy-protocol ${copiado ? 'copied' : ''}`}
                                                title={t('contact.success.copyTitle', {defaultValue: 'Copiar Protocolo'})}
                                            >
                                                {copiado ? (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                        <span>{t('contact.success.copied', {defaultValue: 'Copiado!'})}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                                                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                                                        </svg>
                                                        <span>{t('contact.success.copy', {defaultValue: 'Copiar'})}</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="success-actions">
                                        <a
                                            href={`https://wa.me/556299951773?text=${encodeURIComponent(whatsappMessageText)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-whatsapp"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                            </svg>
                                            <span>{t('contact.success.whatsappButton', {defaultValue: 'Falar pelo WhatsApp'})}</span>
                                        </a>

                                        <button
                                            type="button"
                                            onClick={handleResetForm}
                                            className="btn-new-request"
                                        >
                                            <span>{t('contact.success.newRequestButton', {defaultValue: 'Enviar nova solicitação'})}</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h2 className="form-title">{t('contact.form.title')}</h2>
                                    <p className="form-subtitle">{t('contact.form.subtitle')}</p>

                                    {submitError && (
                                        <div className="submit-error-banner" role="alert">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                            </svg>
                                            <span>{submitError}</span>
                                        </div>
                                    )}

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
                                                    onChange={handlePhoneChange}
                                                    placeholder="(00) 90000-0000"
                                                    maxLength={16}
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
                                                    <option value="confiabilidade-mro">{t('contact.form.services.confiabilidade-mro')}</option>
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

                                        <div className="form-field">
                                            <label htmlFor="technical-file-input">{t('contact.form.drawingLabel')}</label>
                                            <input
                                                type="file"
                                                id="technical-file-input"
                                                ref={fileInputRef}
                                                onChange={handleFileInputChange}
                                                accept={ACCEPTED_EXTENSIONS.join(',')}
                                                multiple
                                                style={{display: 'none'}}
                                            />

                                            {attachedFiles.length === 0 ? (
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
                                                <div className="attached-files-container">
                                                    <div className="files-summary-bar">
                                                        <span className="summary-text">
                                                            {t('contact.form.filesSummary', {
                                                                count: attachedFiles.length,
                                                                max: MAX_FILES,
                                                                size: formatFileSize(totalAttachedSize)
                                                            })}
                                                        </span>
                                                        {attachedFiles.length < MAX_FILES && (
                                                            <button
                                                                type="button"
                                                                onClick={() => fileInputRef.current?.click()}
                                                                className="btn-add-more"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                                                </svg>
                                                                <span>{t('contact.form.addMoreFiles')}</span>
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="files-list">
                                                        {attachedFiles.map((file, index) => (
                                                            <div key={`${file.name}-${index}`} className="file-preview-card">
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
                                                                        <strong className="file-name" title={file.name}>
                                                                            {file.name}
                                                                        </strong>
                                                                        <span className="file-size">{formatFileSize(file.size)}</span>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveFile(index)}
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
                                                        ))}
                                                    </div>

                                                    {attachedFiles.length < MAX_FILES && (
                                                        <div
                                                            className={`compact-dropzone-box ${isDragging ? 'drag-active' : ''}`}
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
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                                <polyline points="17 8 12 3 7 8"></polyline>
                                                                <line x1="12" y1="3" x2="12" y2="15"></line>
                                                            </svg>
                                                            <span>{isDragging ? t('contact.form.dropzoneDragActive') : t('contact.form.addMoreFiles')}</span>
                                                        </div>
                                                    )}
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

                                        <button type="submit" className="btn-orcamento submit-btn" disabled={isSubmitting}>
                                            {isSubmitting ? (
                                                <>
                                                    <span className="spinner" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }}></span>
                                                    <span>{t('contact.success.submitting', {defaultValue: 'Enviando solicitação...'})}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>{t('contact.form.submitButton')}</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                                         fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                                         strokeLinejoin="round" className="btn-icon" aria-hidden="true">
                                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                                        <polyline points="12 5 19 12 12 19"></polyline>
                                                    </svg>
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
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
                                            <a href="mailto:cem.senaizeiss@fieg.com.br"
                                               className="contact-link">cem.senaizeiss@fieg.com.br</a>
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
