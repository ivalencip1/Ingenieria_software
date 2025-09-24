import React, { useState, useEffect } from 'react';
import '../pages/App.css';

function ProgresoSemanal({ usuarioActual = null }) {
  const [progreso, setProgreso] = useState({});
  
  useEffect(() => {
    const userId = usuarioActual?.id;
    const url = userId 
      ? `http://localhost:8000/api/gamification/progreso/?user_id=${userId}`
      : 'http://localhost:8000/api/gamification/progreso/';
      
    fetch(url)
      .then(res => res.json())
      .then(data => setProgreso(data))
      .catch(err => console.error('Error al cargar progreso:', err));
  }, [usuarioActual]);

  // Mensajes motivadores según porcentaje
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
      
      {/* Título y progreso */}
      <div className="progreso-header">
        <h3 className="progreso-title">Progreso Semanal</h3>
        <span className="progreso-stats">
          {completadas} de {total} misiones
        </span>
      </div>

      {/* Barra de progreso minimalista */}
      <div className="progreso-barra-container">
        {/* Estrella al lado izquierdo */}
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

      {/* Mensaje motivador */}
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