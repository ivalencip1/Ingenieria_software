import React from 'react';
import RuletaDiaria from '../components/RuletaDiaria';
import './RuletaPage.css';

const RuletaPage = () => {
    return (
        <div className="ruleta-page-simple">
            <h1>🎰 Ruleta Diaria</h1>
            <p>¡Gira la ruleta y gana premios increíbles!</p>
            <RuletaDiaria />
        </div>
    );
};

export default RuletaPage;