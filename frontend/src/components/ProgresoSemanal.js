import React, { useState, useEffect } from 'react';
import '../pages/App.css';

function ProgresoSemanal({ usuarioActual }) {
  const [progreso, setProgreso] = useState({});
  
  useEffect(() => {
    const params = usuarioActual?.id ? `?usuario_id=${usuarioActual.id}` : '';
    fetch(`http://localhost:8000/api/gamification/progreso/${params}`)
      .then(res => res.json())
      .then(data => setProgreso(data))
      .catch(err => console.error(err));
  }, [usuarioActual]);

  const obtenerMensaje = (porcentaje) => {
    if (porcentaje === 0) return "🌟 ¡Comienza tu aventura magnética!";
    if (porcentaje <= 25) return "🚀 ¡Buen comienzo!";
    if (porcentaje <= 50) return "⚡ ¡Excelente progreso!";
    if (porcentaje <= 75) return "🔥 ¡Vas genial!";
    if (porcentaje < 100) return "🏆 ¡Casi lo logras!";
    return "🎉 ¡MISIÓN CUMPLIDA!";
  };

  const porcentaje = progreso.progreso_porcentaje || 0;
  const completadas = progreso.misiones_completadas || 0;
  const total = progreso.meta_semanal ||10;

  return (
    <div className="progreso-container">
      
      <div className="progreso-header">
        <h3 className="progreso-title">Progreso Semanal</h3>
        <span className="progreso-stats">
          {completadas} de {total} misiones
        </span>
      </div>
      <div className="progreso-barra-container">
        <div className="progreso-estrella">
          ⭐
        </div>
        
        <div className="progreso-barra-fondo">
          <div 
            className="progreso-barra-fill"
            style={{width: `${porcentaje}%`}}
          ></div>
        </div>
      </div>

      <div className="progreso-mensaje">
        {obtenerMensaje(porcentaje)}
      </div>

      {/* Porcentaje */}
      <div className={`progreso-porcentaje ${porcentaje === 100 ? 'completo' : 'incompleto'}`}>
        {porcentaje.toFixed(0)}%
      </div>
    </div>
  );
}

export default ProgresoSemanal;