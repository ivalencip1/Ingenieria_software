import React, { useState, useEffect } from 'react';
import './RankingPage.css';

function RankingPage({ onVolver, usuarioActual }) {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarRanking();
  }, []);

  const cargarRanking = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/social/ranking/');
      const data = await response.json();
      setRanking(data.ranking);
    } catch (error) {
      console.error('Error al cargar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoriaColor = (categoria) => {
    switch (categoria) {
      case 'Oro': return '#FFD700';
      case 'Plata': return '#C0C0C0';
      case 'Bronce': return '#CD7F32';
      case 'Platino': return '#E5E4E2';
      default: return '#999';
    }
  };

  const getTopIcono = (posicion) => {
    if (posicion === 1) return '👑';
    if (posicion === 2) return '🥈';
    if (posicion === 3) return '🥉';
    return null;
  };

  if (loading) {
    return (
      <div className="ranking-page">
        <div className="ranking-header">
          <button onClick={onVolver} className="ranking-back-btn">← Volver</button>
          <h1 className="ranking-title">🏆 Clasificación General</h1>
        </div>
        <div className="ranking-loading">Cargando ranking...</div>
      </div>
    );
  }

  const top3 = ranking.slice(0, 3);
  const resto = ranking.slice(3);

  return (
    <div className="ranking-page">
      <div className="ranking-header">
        <button onClick={onVolver} className="ranking-back-btn">← Volver</button>
        <h1 className="ranking-title">🏆 Clasificación General</h1>
      </div>

      {/* Podio Top 3 */}
      {top3.length > 0 && (
        <div className="ranking-podio">
          {/* 2do lugar */}
          {top3[1] && (
            <div className="podio-card podio-segundo">
              <div className="podio-avatar" style={{ backgroundColor: getCategoriaColor(top3[1].categoria) }}>
                {top3[1].avatar_inicial}
              </div>
              <div className="podio-nombre">{top3[1].nombre}</div>
              <div className="podio-puntos">⚡ {top3[1].puntos}</div>
              <div className="podio-categoria" style={{ backgroundColor: getCategoriaColor(top3[1].categoria) }}>
                {top3[1].categoria}
              </div>
            </div>
          )}

          {/* 1er lugar */}
          {top3[0] && (
            <div className="podio-card podio-primero">
              <div className="podio-corona">👑</div>
              <div className="podio-avatar" style={{ backgroundColor: getCategoriaColor(top3[0].categoria) }}>
                {top3[0].avatar_inicial}
              </div>
              <div className="podio-nombre">{top3[0].nombre}</div>
              <div className="podio-puntos">⚡ {top3[0].puntos}</div>
              <div className="podio-categoria" style={{ backgroundColor: getCategoriaColor(top3[0].categoria) }}>
                {top3[0].categoria}
              </div>
            </div>
          )}

          {/* 3er lugar */}
          {top3[2] && (
            <div className="podio-card podio-tercero">
              <div className="podio-avatar" style={{ backgroundColor: getCategoriaColor(top3[2].categoria) }}>
                {top3[2].avatar_inicial}
              </div>
              <div className="podio-nombre">{top3[2].nombre}</div>
              <div className="podio-puntos">⚡ {top3[2].puntos}</div>
              <div className="podio-categoria" style={{ backgroundColor: getCategoriaColor(top3[2].categoria) }}>
                {top3[2].categoria}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lista general */}
      <div className="ranking-lista">
        <h2 className="ranking-subtitle">📊 Clasificación General</h2>
        {resto.map((usuario) => {
          const esUsuarioActual = usuarioActual && usuario.id === usuarioActual.id;
          return (
            <div 
              key={usuario.id} 
              className={`ranking-item ${esUsuarioActual ? 'ranking-item-actual' : ''}`}
            >
              <div className="ranking-posicion">#{usuario.posicion}</div>
              <div className="ranking-avatar" style={{ backgroundColor: getCategoriaColor(usuario.categoria) }}>
                {usuario.avatar_inicial}
              </div>
              <div className="ranking-info">
                <div className="ranking-nombre">{usuario.nombre}</div>
                <div className="ranking-categoria-badge" style={{ backgroundColor: getCategoriaColor(usuario.categoria) }}>
                  {usuario.categoria}
                </div>
              </div>
              <div className="ranking-puntos">
                <span className="ranking-puntos-numero">{usuario.puntos}</span>
                <span className="ranking-puntos-label">Magneto Points</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RankingPage;
