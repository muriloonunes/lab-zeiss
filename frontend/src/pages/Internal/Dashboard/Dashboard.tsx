import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import './Dashboard.scss';

export const Dashboard: React.FC = () => {
    const { usuario } = useAuth();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    const primeiroNome = usuario?.nome ? usuario.nome.split(' ')[0] : 'Usuário';

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1 className="dashboard-greeting">
                    {getGreeting()}, {primeiroNome}!
                </h1>
            </div>
        </div>
    );
};
