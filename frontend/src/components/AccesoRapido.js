// src/components/AccesoRapido.js
import React, { useState, useEffect } from 'react';

function AccesoRapido() {
  const [puedeGirar, setPuedeGirar] = useState(true);

  useEffect(() => {
    // Verificar estado de ruleta
    fetch('http://localhost:8000/api/rewards/ruleta/')
      .then(res => res.json())
      .then(data => setPuedeGirar(!data.ya_giro))
      .catch(err => console.error(err));
  }, []);

  const girarRuleta = () => {
    fetch('http://localhost:8000/api/rewards/ruleta/', {method: 'POST'})
      .then(res => res.json())
      .then(data => {
        alert(`¡Ganaste ${data.puntos_ganados} Magnetopoints!`);
        setPuedeGirar(false);
      })
      .catch(err => alert('Error al girar ruleta'));
  };

  const botones = [
    {titulo: 'Vacantes recomendadas', icono: '✅', color: '#FFB74D', onClick: () => alert('Vacantes')},
    {titulo: 'Ruleta diaria', icono: '🎯', color: '#4DB6AC', onClick: puedeGirar ? girarRuleta : null},
    {titulo: 'Ranking de usuarios', icono: '⭐', color: '#42A5F5', onClick: () => alert('Sorry, en construccion')}
  ];

  return (
    <div style={{margin: '20px'}}>
      <h3 style={{ textAlign: 'center' }}>Acceso rápido</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px'
      }}>
        {botones.map((boton, index) => (
          <div 
            key={index} 
            onClick={boton.onClick}
            style={{
              background: boton.color,
              color: 'white',
              padding: '20px',
              borderRadius: '15px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              opacity: (boton.titulo === 'Ruleta diaria' && !puedeGirar) ? 0.5 : 1
            }}>
            <div style={{fontSize: '30px', marginBottom: '10px'}}>
              {boton.icono}
            </div>
            <div style={{fontSize: '12px', fontWeight: 'bold'}}>
              {boton.titulo}
              {boton.titulo === 'Ruleta diaria' && !puedeGirar && ' (Ya giraste)'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AccesoRapido;