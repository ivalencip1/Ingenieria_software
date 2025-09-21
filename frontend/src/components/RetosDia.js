import React, { useState, useEffect } from 'react';

function RetosDia() {
  const [misiones, setMisiones] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:8000/api/gamification/misiones/')
      .then(res => res.json())
      .then(data => setMisiones(data.misiones || []))
      .catch(err => console.error(err));
  }, []);

  const completarMision = (misionId) => {
    fetch(`http://localhost:8000/api/gamification/completar/${misionId}/`, {
      method: 'POST'
    })
    .then(res => res.json())
    .then(data => {
      alert(`¡+${data.puntos_ganados} puntos!`);
      // Recargar misiones
      window.location.reload();
    });
  };

  return (
    <div>
      <h3>Retos del día</h3>
      {misiones.map(mision => (
        <div key={mision.id}>
          <p>{mision.titulo}</p>
          <button onClick={() => completarMision(mision.id)}>
            Completar (+{mision.puntos_recompensa} pts)
          </button>
        </div>
      ))}
    </div>
  );
}

export default RetosDia;