import React, { useState, useEffect } from 'react';

function ProgresoSemanal() {
  const [progreso, setProgreso] = useState({});
  
  useEffect(() => {
    fetch('http://localhost:8000/api/gamification/progreso/')
      .then(res => res.json())
      .then(data => setProgreso(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h3>Progreso de metas semanales</h3>
      
      {/* RACHA CON FUEGO */}
      {progreso.racha_activa ? (
        <span>🔥 ¡Racha activa!</span>
      ) : (
        <span>💤 Sin racha</span>
      )}
      
      {/* BARRA DE PROGRESO */}
      <div style={{
        width: `${progreso.progreso_porcentaje || 0}%`,
        height: '10px',
        background: 'linear-gradient(90deg, #FF6B35, #F7931E)'
      }}></div>
      
      <p>{progreso.misiones_completadas || 0} de {progreso.meta_semanal || 5} misiones</p>
    </div>
  );
}

export default ProgresoSemanal;