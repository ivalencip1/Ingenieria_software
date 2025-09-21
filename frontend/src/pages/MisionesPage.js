import React, { useState, useEffect } from 'react';

function MisionesPage({ onVolver }) {
  const [misiones, setMisiones] = useState({
    retos_diarios: [],
    retos_semanales: [],
    retos_mensuales: []
  });

  useEffect(() => {
    fetch('http://localhost:8000/api/gamification/todas-misiones/')
      .then(res => res.json())
      .then(data => setMisiones(data))
      .catch(err => console.error(err));
  }, []);

  const completarMision = (misionId) => {
    fetch(`http://localhost:8000/api/gamification/misiones/${misionId}/completar/`, {
      method: 'POST'
    })
    .then(res => res.json())
    .then(data => {
      alert(`¡+${data.puntos_ganados} puntos!`);
      // Recargar misiones
      window.location.reload();
    })
    .catch(err => {
      console.error('Error:', err);
      alert('Error al completar misión');
    });
  };

  const MisionCard = ({ mision }) => (
    <div style={{
      background: '#fff',
      borderRadius: '15px',
      padding: '20px',
      marginBottom: '15px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{flex: 1}}>
        <h4 style={{margin: '0 0 10px 0', color: '#8B4513'}}>{mision.titulo}</h4>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <span style={{fontSize: '20px'}}>{mision.icono}</span>
          <span style={{color: '#666'}}>Reto P</span>
          <span style={{fontWeight: 'bold', color: '#8B4513'}}>{mision.puntos_recompensa} P</span>
        </div>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
        <span style={{
          padding: '5px 15px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          background: mision.completada ? '#4CAF50' : '#FF9800',
          color: 'white'
        }}>
          {mision.estado}
        </span>
        {!mision.completada && (
          <button 
            onClick={() => completarMision(mision.id)}
            style={{
              background: '#FF6B35',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '20px',
              cursor: 'pointer'
            }}
          >
            Completar
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FFA726 0%, #FFB74D 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '30px',
        color: '#8B4513'
      }}>
        <button 
          onClick={onVolver}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            marginRight: '15px'
          }}
        >
          ←
        </button>
        <div style={{fontSize: '40px', marginRight: '15px'}}>📋</div>
        <h1 style={{margin: 0, fontSize: '28px'}}>
          Módulo de Retos / Misiones
        </h1>
      </div>

      {/* Retos Diarios */}
      <div style={{marginBottom: '30px'}}>
        <h2 style={{color: '#8B4513', marginBottom: '15px'}}>Reto Diario</h2>
        {misiones.retos_diarios.map(mision => (
          <MisionCard key={mision.id} mision={mision} />
        ))}
      </div>

      {/* Retos Semanales */}
      <div style={{marginBottom: '30px'}}>
        <h2 style={{color: '#8B4513', marginBottom: '15px'}}>Reto Semanal</h2>
        {misiones.retos_semanales.map(mision => (
          <MisionCard key={mision.id} mision={mision} />
        ))}
      </div>

      {/* Retos Mensuales */}
      <div style={{marginBottom: '30px'}}>
        <h2 style={{color: '#8B4513', marginBottom: '15px'}}>Reto Mensual</h2>
        {misiones.retos_mensuales.map(mision => (
          <MisionCard key={mision.id} mision={mision} />
        ))}
      </div>
    </div>
  );
}

export default MisionesPage;