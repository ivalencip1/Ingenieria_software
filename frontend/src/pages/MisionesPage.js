import React, { useState, useEffect } from 'react';
import './MisionesPage.css';

function MisionesPage({ onVolver, usuarioActual, onActualizarUsuario }) {
  const [misiones, setMisiones] = useState({
    retos_diarios: [],
    retos_semanales: [],
    retos_mensuales: []
  });
  const [cargando, setCargando] = useState(false);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [misionPendiente, setMisionPendiente] = useState(null);

  useEffect(() => {
    const params = usuarioActual?.id ? `?usuario_id=${usuarioActual.id}` : '';
    fetch(`http://localhost:8000/api/gamification/todas-misiones/${params}`)
      .then(res => res.json())
      .then(data => setMisiones(data))
      .catch(err => console.error(err));
  }, [usuarioActual]);

  const completarMision = (misionId, misionTitulo) => {
    // Si es la misión especial, mostrar popup antes de cargar
    if (misionTitulo === 'Amigos por siempre') {
      setMisionPendiente({ id: misionId, titulo: misionTitulo });
      setMostrarPopup(true);
      return;
    }
    iniciarCargaMision(misionId);
  };

  // Lógica de carga magnética (separada para reutilizar)
  const iniciarCargaMision = (misionId) => {
    setCargando(true);
    setTimeout(() => {
      const exito = Math.random() < 0.7;
      if (exito) {
        fetch(`http://localhost:8000/api/gamification/misiones/${misionId}/completar/`, {
          method: 'POST'
        })
        .then(res => res.json())
        .then(data => {
          setCargando(false);
          alert(`¡Misión completada! +${data.puntos_ganados} MagnetoPoints obtenidos!`);
          window.location.reload();
        })
        .catch(err => {
          setCargando(false);
          console.error('Error:', err);
          alert('❌ Error de conexión magnética');
        });
      } else {
        setCargando(false);
        alert(`❌ ¡Reto no completado! Los sensores magnéticos no detectaron actividad suficiente. ¡Inténtalo de nuevo!`);
      }
    }, 4000);
  };

  // Popup previo para Amigos por siempre
  if (mostrarPopup && misionPendiente) {
    return (
      <div className="misiones-popup-overlay" style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
        <div style={{background:'white',borderRadius:'18px',padding:'32px 24px',boxShadow:'0 8px 32px rgba(0,0,0,0.18)',maxWidth:'350px',textAlign:'center',fontSize:'18px',color:'#222',fontWeight:'bold'}}>
          <h2 style={{marginBottom:'18px'}}>Invita a un amigo a Magneto</h2>
          <div style={{marginBottom:'12px'}}>Invita a un amigo a registrarse en Magneto y que cree su perfil.</div>
          <a href="https://www.magneto365.com/es" target="_blank" rel="noopener noreferrer" style={{display:'block',marginBottom:'18px',color:'#007bff',textDecoration:'underline',fontWeight:'normal'}}>https://www.magneto365.com/es</a>
          <button onClick={() => { setMostrarPopup(false); iniciarCargaMision(misionPendiente.id); }} style={{background:'#ef983a',color:'white',border:'none',borderRadius:'8px',padding:'10px 24px',fontWeight:'bold',fontSize:'16px',cursor:'pointer'}}>Continuar</button>
        </div>
      </div>
    );
  }

  // Pantalla de carga magnética
  if (cargando) {
    return (
      <div className="misiones-loading-overlay">
        <div className="misiones-loading-magnet">🧲</div>
        <h1 className="misiones-loading-title">Procesando Reto Magnético</h1>
        <p className="misiones-loading-subtitle">
          Esperando a que magneto nos diga que lo hiciste...
        </p>
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
            onClick={() => completarMision(mision.id, mision.titulo)}
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