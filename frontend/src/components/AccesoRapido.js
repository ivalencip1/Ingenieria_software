// src/components/AccesoRapido.js
import React, { useState, useEffect } from 'react';
import { puedeGirarRuleta } from '../services/apiRuleta';

function AccesoRapido({ onCambiarVista }) {
  const [puedeGirar, setPuedeGirar] = useState(true);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    verificarEstadoRuleta();
  }, []);

  const verificarEstadoRuleta = async () => {
    try {
      setCargando(true);
      const response = await puedeGirarRuleta();
      setPuedeGirar(response.puede_girar);
    } catch (error) {
      console.error('Error al verificar estado de ruleta:', error);
    } finally {
      setCargando(false);
    }
  };

  const manejarRuleta = async () => {
    // Siempre ir a la página de ruleta para la experiencia completa
    if (onCambiarVista) {
      onCambiarVista('ruleta');
    }
  };

  const botones = [
    {titulo: 'Vacantes recomendadas', icono: '✅', color: '#FFB74D', onClick: () => alert('Vacantes')},
    {titulo: 'Ruleta diaria', icono: '🎯', color: '#4DB6AC', onClick: manejarRuleta},
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
              opacity: (boton.titulo === 'Ruleta diaria' && !puedeGirar) ? 0.7 : 1,
              position: 'relative'
            }}>
            <div style={{fontSize: '30px', marginBottom: '10px'}}>
              {boton.icono}
            </div>
            <div style={{fontSize: '12px', fontWeight: 'bold'}}>
              {boton.titulo}
              {boton.titulo === 'Ruleta diaria' && (
                <div style={{fontSize: '10px', marginTop: '4px', opacity: 0.9}}>
                  {cargando ? 'Cargando...' : (puedeGirar ? 'Toca para jugar' : 'Ver estado')}
                </div>
              )}
            </div>
            {boton.titulo === 'Ruleta diaria' && !puedeGirar && (
              <div style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                background: '#FF5252',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                ✓
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AccesoRapido;