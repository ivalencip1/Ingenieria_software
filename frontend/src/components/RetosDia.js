import React, { useState, useEffect } from 'react';
import '../pages/App.css';

function RetosDia() {
  const [misiones, setMisiones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [misionCargando, setMisionCargando] = useState(null);
  
  useEffect(() => {
    fetch('http://localhost:8000/api/gamification/misiones/')
      .then(res => res.json())
      .then(data => setMisiones(data.misiones || []))
      .catch(err => console.error(err));
  }, []);

  const completarMision = (misionId) => {
    // Iniciar estado de carga
    setCargando(true);
    setMisionCargando(misionId);
    

    setTimeout(() => {

      const exito = Math.random() < 0.7;
      
      if (exito) {
        // ÉXITO: Completar la misión normalmente
        fetch(`http://localhost:8000/api/gamification/misiones/${misionId}/completar/`, {
          method: 'POST'
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
        // FALLO: No se pudo completar el reto
        setCargando(false);
        setMisionCargando(null);
        alert(`¡Mala noticia! Nuestros sensores no detectaron actividad suficiente. ¡Inténtalo de nuevo!`);
      }
    }, 4000); // DELAY para simular que recibe confirmación de Magneto
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
      <h3 style={{ textAlign: 'center' }}>Retos del día</h3>
      {misiones.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px 20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          margin: '10px 0'
        }}>
          <span style={{
            fontSize: '14px',
            color: '#333',
            fontWeight: '500'
          }}>
            {misiones[0].titulo}
          </span>
          <button 
            onClick={() => completarMision(misiones[0].id)}
            disabled={cargando || misionCargando === misiones[0].id}
            style={{
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s',
              opacity: (cargando || misionCargando === misiones[0].id) ? 0.6 : 1
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