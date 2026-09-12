import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export function QuoteButton({
    className = "",
    onClick,
    to = "/contato",
    children,
    type = "button",
    ...props
}) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleClick = (e) => {
        if (onClick) {
            onClick(e);
        } else if (to) {
            navigate(to);
        }
    };

    return (
        <button
            type={type}
            className={`btn-orcamento ${className}`.trim()}
            onClick={handleClick}
            {...props}
        >
            <span>{children || t('nav.requestQuote')}</span>
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
        </button>
    );
}
