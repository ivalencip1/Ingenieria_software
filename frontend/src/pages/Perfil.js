import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Perfil.css';

const Perfil = ({ onVolver, usuarioActual }) => {
  const [perfilData, setPerfilData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [misionesExpanded, setMisionesExpanded] = useState(false);
  const [misionesCompletadas, setMisionesCompletadas] = useState([]);
  const [insigniaSeleccionada, setInsigniaSeleccionada] = useState(null);

  useEffect(() => {
    // Marcar que el usuario visitó la pantalla de Perfil
    try { localStorage.setItem('magboost_profile_visited', '1'); } catch(_) {}

    const fetchPerfilCompleto = async () => {
      try {
        const q = usuarioActual?.id ? `?usuario_id=${usuarioActual.id}` : '';
        const response = await axios.get(`http://localhost:8000/api/core/perfil-completo/${q}`);
        setPerfilData(response.data);
      } catch (err) {
        setError('Error al cargar el perfil');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfilCompleto();
  }, [usuarioActual]);

  const fetchMisionesCompletadas = async () => {
    try {
      const q = usuarioActual?.id ? `?usuario_id=${usuarioActual.id}` : '';
      const response = await axios.get(`http://localhost:8000/api/gamification/misiones-completadas/${q}`);
      setMisionesCompletadas(response.data);
    } catch (err) {
      console.error('Error al cargar misiones:', err);
    }
  };

  const toggleMisiones = () => {
    if (!misionesExpanded && misionesCompletadas.length === 0) {
      fetchMisionesCompletadas();
    }
    setMisionesExpanded(!misionesExpanded);
  };

  if (loading) {
    return (
      <div className="perfil-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="perfil-container">
        <div className="error">
          <p> {error}</p>
        </div>
      </div>
    );
  }

  if (!perfilData) {
    return null;
  }

  const { perfil, estadisticas, insignias_obtenidas, total_insignias,  biografia } = perfilData;

  const handleLogout = () => {
    try {
      localStorage.removeItem('usuario');
      localStorage.removeItem('magboost_profile_visited');
    } catch (_) {}
    // Redirigir a la página principal (o login si tu servidor la sirve)
    window.location.href = '/';
  };

  return (
    <div className="perfil-container">
      {/* Header del perfil */}
      <div className="perfil-header">
        <div className="avatar-section">
          <div className="avatar">
            <span className="avatar-text">{perfil.first_name.charAt(0)}{perfil.last_name.charAt(0)}</span>
          </div>
          <div className="usuario-info">
            <h1 className="nombre-usuario">{perfil.first_name} {perfil.last_name}</h1>
            <p className="username">@{perfil.username}</p>
          </div>
        </div>
        
        <div className="stats-preview">
          <div className="stat-item">
            <span className="stat-number">{estadisticas.total_misiones}</span>
            <span className="stat-label">Misiones</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{total_insignias}</span>
            <span className="stat-label">Insignias</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{estadisticas.total_puntos}</span>
            <span className="stat-label">Puntos</span>
          </div>
        </div>
      </div>
      <div className="biografia-section">
        <h3> Biografía</h3>
        <p className="biografia-texto">{biografia}</p>
      </div>
      <div className="progreso-semanal">
        <h3>Progreso de Misiones</h3>
        <div className="progreso-bar-container">
          <div className="progreso-bar">
            <div 
              className="progreso-fill" 
              style={{ width: `${Math.min((estadisticas.total_misiones / 100) * 100, 100)}%` }}
            ></div>
          </div>
          <span className="progreso-text">
            {estadisticas.total_misiones}/100 misiones
          </span>
        </div>
        
        <div className="ver-mas-container">
          <button 
            className="ver-mas-btn" 
            onClick={toggleMisiones}
          >
            <span>Ver misiones completadas</span>
            <span className={`arrow ${misionesExpanded ? 'expanded' : ''}`}>▼</span>
          </button>
          
          {misionesExpanded && (
            <div className="misiones-lista">
              {misionesCompletadas.length > 0 ? (
                misionesCompletadas.map((mision) => (
                  <div key={mision.id} className="mision-item">
                    <div className="mision-icono">{mision.mision__icono || '📋'}</div>
                    <div className="mision-info">
                      <h4 className="mision-nombre">{mision.mision__nombre}</h4>
                      <p className="mision-descripcion">{mision.mision__descripcion}</p>
                      <span className="mision-fecha">
                        Completada: {new Date(mision.fecha_completada).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mision-puntos">+{mision.mision__puntos} pts</div>
                  </div>
                ))
              ) : (
                <div className="no-misiones">
                  <p>En proceso de construccion</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Insignias obtenidas - Horizontal */}
      <div className="insignias-section">
        <h3>Insignias Obtenidas ({total_insignias})</h3>
        {insignias_obtenidas.length > 0 ? (
          <div className="insignias-horizontal">
            {insignias_obtenidas.map((insignia) => (
              <div 
                key={insignia.id} 
                className="insignia-simple" 
                title={insignia.nombre}
                onClick={() => setInsigniaSeleccionada(insignia)}
              >
                {insignia.imagen_url ? (
                  <img 
                    src={insignia.imagen_url} 
                    alt={insignia.nombre}
                    onError={(e) => {
                      console.error('Error cargando imagen PNG:', insignia.imagen_url);
                      e.target.parentElement.innerHTML = `<span class="insignia-fallback" style="display: flex; font-size: 28px; color: #666;">${insignia.icono_fallback || '🏅'}</span>`;
                    }}
                    style={{ 
                      width: '85px', 
                      height: '85px', 
                      objectFit: 'cover',
                      borderRadius: '16px'
                    }}
                  />
                ) : (
                  <span 
                    className="insignia-fallback"
                    style={{ display: 'flex' }}
                  >
                    {insignia.icono_fallback || '🏅'}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-insignias">
            <p>¡Completa misiones para obtener tu primera insignia!</p>
          </div>
        )}
      </div>

      {insigniaSeleccionada && (
        <div className="insignia-modal" onClick={() => setInsigniaSeleccionada(null)}>
          <div className="insignia-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{insigniaSeleccionada.nombre}</h3>
            <p>{insigniaSeleccionada.descripcion}</p>
            <button className="insignia-modal-close" onClick={() => setInsigniaSeleccionada(null)}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Sección para cerrar sesión */}
      <div style={{ marginTop: '28px' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            background: '#fff',
            color: '#ef4444',
            border: '2px solid #ef4444',
            borderRadius: '12px',
            padding: '14px 20px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 0 rgba(239,68,68,0.15)',
            letterSpacing: 0.2,
            boxSizing: 'border-box',
            textAlign: 'center'
          }}
          aria-label="Cerrar sesión en la pag"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Perfil;