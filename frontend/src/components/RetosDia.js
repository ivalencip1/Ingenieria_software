import React, { useState, useEffect } from 'react';
import '../pages/App.css';

function RetosDia({ usuarioActual }) {
  const [misiones, setMisiones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [misionCargando, setMisionCargando] = useState(null);
  
  useEffect(() => {
    const params = usuarioActual?.id ? `?usuario_id=${usuarioActual.id}` : '';
    fetch(`http://localhost:8000/api/gamification/misiones/${params}`)
      .then(res => res.json())
      .then(data => setMisiones(data.misiones || []))
      .catch(err => console.error(err));
  }, [usuarioActual]);

  const completarMision = (misionId) => {
    // Iniciar estado de carga
    setCargando(true);
    setMisionCargando(misionId);
    

    setTimeout(() => {

      const exito = Math.random() < 0.7;
      
      if (exito) {
       
        fetch(`http://localhost:8000/api/gamification/misiones/${misionId}/completar/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(usuarioActual?.id ? { usuario_id: usuarioActual.id } : {})
        })
        .then(res => res.json())
        .then(data => {
          setCargando(false);
          setMisionCargando(null);
          alert(`¡Misión completada! +${data.puntos_ganados} MagnetoPoints obtenidos!`);
        
          window.location.reload();
        })
        .catch(err => {
          setCargando(false);
          setMisionCargando(null);
          console.error('Error:', err);
          alert('Sorry, error de conexión con Magneto');
        });
      } else {
       
        setCargando(false);
        setMisionCargando(null);
        alert(`¡Mala noticia! Nuestros sensores no detectaron actividad suficiente. ¡Inténtalo de nuevo!`);
      }
    }, 4000);
  };


  if (cargando) {
    return (
      <div className="loading-overlay">
        <div className="loading-magnet">🧲</div>
        <h2 className="loading-title">Procesando tus datos desde Magneto...</h2>
        <p className="loading-subtitle">Esperando que completes tu reto</p>
        <div className="loading-dots">
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="retos-container">
      <h3 style={{ textAlign: 'center', color: '#334960' }}>Retos del día</h3>
      {misiones.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px 20px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(12, 187, 78, 0.15)',
          margin: '10px 0',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ flex: 1, paddingRight: 12 }}>
            <div style={{
              fontSize: '14px',
              color: '#333',
              fontWeight: '600',
              marginBottom: 4
            }}>
              {misiones[0].titulo}
            </div>
            {misiones[0].descripcion && (
              <div style={{
                fontSize: '12px',
                color: '#666',
                lineHeight: 1.4
              }}>
                {misiones[0].descripcion}
              </div>
            )}
          </div>
          <button 
            onClick={() => completarMision(misiones[0].id)}
            disabled={cargando || misionCargando === misiones[0].id}
            style={{
              background: 'linear-gradient(135deg, #0cbb4e 0%, #5DC971 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              opacity: (cargando || misionCargando === misiones[0].id) ? 0.6 : 1,
              boxShadow: '0 2px 8px rgba(12, 187, 78, 0.3)'
            }}
          >
            {(cargando || misionCargando === misiones[0].id) ? 'Procesando...' : `+${misiones[0].puntos_recompensa} pts`}
          </button>
        </div>
      )}
    </div>
  );
}

export default RetosDia;