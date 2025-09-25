import React from 'react';
import RuletaDiaria from '../components/RuletaDiaria';
import './RuletaPage.css';

const RuletaPage = ({ usuarioActual }) => {
    return (
        <div className="ruleta-page-simple">
            <h1>Ruleta Diaria</h1>
            <p>¡Gira la ruleta y gana premios increíbles!</p>
            <RuletaDiaria usuarioActual={usuarioActual} />
        </div>
    );
};

export default RuletaPage;