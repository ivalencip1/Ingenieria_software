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
      <h3>Retos del día</h3>
      {misiones.map(mision => (
        <div key={mision.id} className="retos-mision">
          <p>{mision.titulo}</p>
          <button 
            onClick={() => completarMision(mision.id)}
            disabled={cargando}
            className="retos-btn"
          >
            Completar (+{mision.puntos_recompensa} pts)
          </button>
        </div>
      ))}
    </div>
  );
}

export default RetosDia;