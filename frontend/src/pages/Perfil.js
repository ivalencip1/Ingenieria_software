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
  const [editingBasics, setEditingBasics] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editBiografia, setEditBiografia] = useState('');
  const [savingNames, setSavingNames] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    // Marcar que el usuario visitó la pantalla de Perfil
    try { localStorage.setItem('magboost_profile_visited', '1'); } catch(_) {}

    const fetchPerfilCompleto = async () => {
      try {
        const q = usuarioActual?.id ? `?usuario_id=${usuarioActual.id}` : '';
        const response = await axios.get(`http://localhost:8000/api/core/perfil-completo/${q}`);
        setPerfilData(response.data);
        // Inicializar campos de edición con los valores actuales
        try {
          const p = response.data?.perfil;
          setEditFirstName(p?.first_name || '');
          setEditLastName(p?.last_name || '');
          setEditBiografia(p?.bio || response.data?.biografia || '');
        } catch (e) {}
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

  // Guardar cambios de nombre y apellido
  const guardarNombres = async () => {
    if (!usuarioActual?.id) return;
    const first = (editFirstName || '').trim();
    const last = (editLastName || '').trim();
    const bio = (editBiografia || '').trim();
    if (!first || !last) {
      setSaveMsg('Por favor, completa nombre y apellido');
      setTimeout(() => setSaveMsg(''), 2000);
      return;
    }
    setSavingNames(true);
    try {
      await axios.patch(`http://localhost:8000/api/usuarios/${usuarioActual.id}/`, {
        first_name: first,
        last_name: last,
        // backend user model uses 'bio' as the field name
        bio: bio,
      });
      // Actualizar vista local
      const nuevo = { ...perfilData };
      if (nuevo.perfil) {
        nuevo.perfil.first_name = first;
        nuevo.perfil.last_name = last;
        nuevo.perfil.bio = bio;
        // also update the top-level 'biografia' that perfil_completo returns
        nuevo.biografia = bio;
      }
      setPerfilData(nuevo);
      // Sincronizar almacenamiento local si existe
      try {
        const uRaw = localStorage.getItem('usuario');
        if (uRaw) {
          const u = JSON.parse(uRaw);
          localStorage.setItem('usuario', JSON.stringify({ ...u, first_name: first, last_name: last }));
        }
      } catch (_) {}
      setSaveMsg('Guardado');
        // Cerrar el panel de edición al guardar correctamente
        setEditingBasics(false);
      setTimeout(() => setSaveMsg(''), 2000);
    } catch (err) {
      console.error('Error guardando nombres:', err);
      setSaveMsg('Error al guardar');
      setTimeout(() => setSaveMsg(''), 2500);
    } finally {
      setSavingNames(false);
    }
  };

  return (
    <div className="perfil-container">
      {/* Header del perfil */}
      <div className="perfil-header">
        <button
          className="perfil-edit-btn"
          onClick={() => setEditingBasics(v => !v)}
          aria-label={editingBasics ? 'Cerrar edición' : 'Editar perfil'}
          title={editingBasics ? 'Cerrar edición' : 'Editar perfil'}
        >
          {/* ícono lápiz */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
        </button>
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
                  <p>No hay misiones completadas aún</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      

      {/* Edición (se muestra al pulsar el lápiz) */}
      {editingBasics && (
        <div className="editar-nombres-box">
          <h3 className="editar-nombres-title">Editar datos básicos</h3>
          <div className="editar-nombres-grid">
            <div className="editar-nombres-field">
              <label className="editar-nombres-label">Nombre</label>
              <input
                type="text"
                className="editar-nombres-input"
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                placeholder="Nombre"
              />
            </div>
            <div className="editar-nombres-field">
              <label className="editar-nombres-label">Apellido</label>
              <input
                type="text"
                className="editar-nombres-input"
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                placeholder="Apellido"
              />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="editar-nombres-label">Biografía</label>
            <textarea
              className="editar-nombres-textarea"
              value={editBiografia}
              onChange={(e) => setEditBiografia(e.target.value)}
              placeholder="Escribe una breve biografía..."
              rows={4}
            />
          </div>
          <div className="editar-nombres-actions">
            <button
              onClick={guardarNombres}
              disabled={savingNames}
              className="editar-nombres-save"
            >
              {savingNames ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {!!saveMsg && (
              <span className={`editar-nombres-msg ${saveMsg === 'Guardado' ? 'ok' : 'err'}`}>{saveMsg}</span>
            )}
          </div>
        </div>
      )}

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
          aria-label="Cerrar sesión"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Perfil;