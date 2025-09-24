import React, { useState, useEffect } from 'react';
import './MisionesPage.css';

function MisionesPage({ onVolver, usuarioActual }) {
  const [misiones, setMisiones] = useState({
    retos_diarios: [],
    retos_semanales: [],
    retos_mensuales: []
  });
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const params = usuarioActual?.id ? `?usuario_id=${usuarioActual.id}` : '';
    fetch(`http://localhost:8000/api/gamification/todas-misiones/${params}`)
      .then(res => res.json())
      .then(data => setMisiones(data))
      .catch(err => console.error(err));
  }, [usuarioActual]);

  const completarMision = (misionId) => {
    // Iniciar estado de carga
    setCargando(true);
    
    // Simular procesamiento magnético con probabilidad aleatoria
    setTimeout(() => {
      // Generar probabilidad aleatoria (70% éxito, 30% fallo)
      const exito = Math.random() < 0.7;
      
      if (exito) {
        // ÉXITO: Completar la misión normalmente
        fetch(`http://localhost:8000/api/gamification/misiones/${misionId}/completar/`, {
          method: 'POST'
        })
        .then(res => res.json())
        .then(data => {
          setCargando(false);
          alert(`¡Misión completada! +${data.puntos_ganados} MagnetoPoints obtenidos!`);
          // Recargar misiones
          window.location.reload();
        })
        .catch(err => {
          setCargando(false);
          console.error('Error:', err);
          alert('❌ Error de conexión magnética');
        });
      } else {
        // FALLO: No se pudo completar el reto
        setCargando(false);
        alert(`❌ ¡Reto no completado! Los sensores magnéticos no detectaron actividad suficiente. ¡Inténtalo de nuevo!`);
      }
    }, 4000); // 4 segundos de delay
  };

  // Pantalla de carga magnética
  if (cargando) {
    return (
      <div className="misiones-loading-overlay">
        <div className="misiones-loading-magnet">🧲</div>
        <h1 className="misiones-loading-title">Procesando Reto Magnético</h1>
        <p className="misiones-loading-subtitle">
          Esperando a que magneto nos diga que lo hiciste...
        </p>
        
        {/* Barra de progreso magnética */}
        <div className="misiones-loading-bar-container">
          <div className="misiones-loading-bar"></div>
        </div>
        
        <div className="misiones-loading-dots">
          {[0, 0.2, 0.4].map((delay, index) => (
            <div 
              key={index} 
              className="misiones-loading-dot"
              style={{animationDelay: `${delay}s`}}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  const MisionCard = ({ mision }) => (
    <div className="mision-card">
      <div className="mision-info">
        <h4 className="mision-titulo">{mision.titulo}</h4>
        {mision.descripcion && (
          <p className="mision-descripcion">
            {mision.descripcion}
          </p>
        )}
        <div className="mision-detalles">
          <span className="mision-icono">{mision.icono}</span>
          <span className="mision-puntos">{mision.puntos_recompensa} MagnetoPoints</span>
        </div>
      </div>
      <div className="mision-acciones">
        <span className={`mision-estado ${mision.completada ? 'completada' : 'pendiente'}`}>
          {mision.estado}
        </span>
        {!mision.completada && (
          <button 
            onClick={() => completarMision(mision.id)}
            className="mision-btn-completar"
          >
            Completar
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="misiones-page">
      {/* Header */}
      <div className="misiones-header">
        <button 
          onClick={onVolver}
          className="misiones-back-btn"
        >
          ←
        </button>
        <div className="misiones-header-icon">📋</div>
        <h1 className="misiones-header-title">
          Módulo de Retos / Misiones
        </h1>
      </div>

      {/* Retos Diarios */}
      <div className="misiones-section">
        <h2 className="misiones-section-title">Reto Diario</h2>
        {misiones.retos_diarios.map(mision => (
          <MisionCard key={mision.id} mision={mision} />
        ))}
      </div>

      {/* Retos Semanales */}
      <div className="misiones-section">
        <h2 className="misiones-section-title">Reto Semanal</h2>
        {misiones.retos_semanales.map(mision => (
          <MisionCard key={mision.id} mision={mision} />
        ))}
      </div>

      {/* Retos Mensuales */}
      <div className="misiones-section">
        <h2 className="misiones-section-title">Reto Mensual</h2>
        {misiones.retos_mensuales.map(mision => (
          <MisionCard key={mision.id} mision={mision} />
        ))}
      </div>
    </div>
  );
}

export default MisionesPage;