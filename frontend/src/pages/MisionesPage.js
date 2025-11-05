import React, { useState, useEffect } from 'react';
import './MisionesPage.css';

function MisionesPage({ onVolver, usuarioActual, onActualizarUsuario }) {
  const [misiones, setMisiones] = useState({
    retos_diarios: [],
    retos_semanales: [],
    retos_mensuales: []
  });
  const [cargando, setCargando] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [misionPendiente, setMisionPendiente] = useState(null);


  useEffect(() => {
    const params = usuarioActual?.id ? `?usuario_id=${usuarioActual.id}` : '';
    fetch(`http://localhost:8000/api/gamification/todas-misiones/${params}`)
      .then(res => res.json())
      .then(data => setMisiones(data))
      .catch(err => console.error(err));
  }, [usuarioActual]);


  useEffect(() => {
    if (!usuarioActual?.id) return;
    fetch(`http://localhost:8000/api/notifications/usuario/${usuarioActual.id}/tips-perfil/?trigger=misiones_enter`, { method: 'POST' })
      .then(() => {
        // Avisar a la campana para que recargue el badge/lista
        const ev = new CustomEvent('magboost:new-notifications');
        window.dispatchEvent(ev);
      })
      .catch(() => {});
  }, [usuarioActual]);

  const completarMision = (misionId) => {
    // por defecto intentamos completar la misión llamando al backend
    // para la misión especial "Amigos por siempre" skipearemos la falla aleatoria
    setCargando(true);
    setTimeout(() => {
      // Realizar el POST al backend para completar la misión
      fetch(`http://localhost:8000/api/gamification/misiones/${misionId}/completar/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_id: usuarioActual?.id
        })
      })
      .then(res => res.json())
      .then(data => {
        setCargando(false);
        if (data.error) {
          alert(`❌ Error: ${data.error}`);
          return;
        }
        alert(`¡Misión completada! +${data.puntos_ganados} MagnetoPoints obtenidos!`);
        window.location.reload();
      })
      .catch(err => {
        setCargando(false);
        console.error('Error:', err);
        alert('❌ Error de conexión con MAGNETO');
      });
    }, 1200);
  };

  // Intentar completar la misión con reintentos; si falla y es la misión "Amigos por siempre",
  // marcarla localmente y almacenar en localStorage para intentar sincronizar después.
  const completarMisionWithRetries = async (mision, attempts = 3) => {
    let lastError = null;
    for (let i = 0; i < attempts; i++) {
      try {
        const res = await fetch(`http://localhost:8000/api/gamification/misiones/${mision.id}/completar/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario_id: usuarioActual?.id })
        });
        const data = await res.json();
        if (res.ok && !data.error) {
          // éxito real: stop loading and refresh (same behavior as other missions)
          setCargando(false);
          alert(`¡Misión completada! +${data.puntos_ganados} MagnetoPoints obtenidos!`);
          try { window.location.reload(); } catch(_) { }
          return;
        } else {
          lastError = data.error || 'Error desconocido';
        }
      } catch (err) {
        lastError = err;
      }
      // pequeña espera antes de reintentar
      await new Promise(r => setTimeout(r, 800));
    }

  // Si falló después de reintentos y es la misión de amigos, marcar localmente
    if (mision && mision.titulo && mision.titulo.toLowerCase().includes('amigos')) {
      // marcar la misión como completada en UI local
      setMisiones(prev => {
        const copy = { ...prev };
        ['retos_diarios','retos_semanales','retos_mensuales'].forEach(key => {
          copy[key] = copy[key].map(mi => {
            if (mi.id === mision.id) return { ...mi, completada: true, estado: 'Completado' };
            return mi;
          });
        });
        return copy;
      });

      // encolar sync pendiente en localStorage
      try {
        const pendingRaw = localStorage.getItem('magboost_pending_completions');
        const pending = pendingRaw ? JSON.parse(pendingRaw) : [];
        pending.push({ mision_id: mision.id, usuario_id: usuarioActual?.id, ts: Date.now() });
        localStorage.setItem('magboost_pending_completions', JSON.stringify(pending));
      } catch (_) {}

      alert('No se pudo conectar con Magneto, pero la misión ha sido marcada como completada localmente y se intentará sincronizar más tarde.');
      setCargando(false);
      setProgress(100);
      // keep old behavior: show simple message and stop loading
      return;
    }

    setCargando(false);
    alert(`❌ No fue posible completar la misión. Detalle: ${lastError}`);
  };

  

  const iniciarCargaMision = (misionId) => {
    setCargando(true);
    setTimeout(() => {
      completarMision(misionId);
    }, 1000);
  };

  const handleCompletarClick = (mision) => {
    // Si es la misión especial 'Amigos por siempre' mostramos el popup previo
    if (mision && mision.titulo && mision.titulo.toLowerCase().includes('amigos')) {
      setMisionPendiente(mision);
      setMostrarPopup(true);
      return;
    }
    // Para el resto de misiones iniciamos la carga normal
    iniciarCargaMision(mision.id);
  };
  // Progress simulation for loading card
  useEffect(() => {
    let t = null;
    if (cargando) {
      setProgress(0);
      t = setInterval(() => {
        setProgress(p => Math.min(100, p + Math.floor(Math.random() * 8) + 4));
      }, 300);
    } else {
      setProgress(0);
    }
    return () => { if (t) clearInterval(t); };
  }, [cargando]);

  // Si estamos cargando, mostrar la antigua pantalla simple (se usa para todas las misiones ahora)
  if (cargando) {
    return (
      <div className="misiones-loading-overlay">
        <div className="misiones-loading-magnet">🧲</div>
        <h1 className="misiones-loading-title">Procesando Reto Magnético</h1>
        <p className="misiones-loading-subtitle">Esperando a que Magneto nos diga que lo hiciste...</p>
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

  // Popup previo para Amigos por siempre
  if (mostrarPopup && misionPendiente) {
    const link = 'https://login.magneto365.com/candidates?utm_source=google&utm_medium=cpc&utm_campaign=grupo-exito&utm_content=maxp-ads-27-20241203-panaderia&gclid=Cj0KCQiA5abIBhCaARIsAM3-zFXpWtr0uX1NJXK8CtsIlhzQKpOg3N--f4Wy8RGZIPM-Rxh09Rzaq_caAp6zEALw_wcB';
    const handleShare = () => {
      try {
        if (navigator.share) {
          navigator.share({ title: 'Magneto', text: 'Únete a Magneto', url: link });
        } else {
          navigator.clipboard && navigator.clipboard.writeText(link);
          window.open(link, '_blank', 'noopener');
          alert('Enlace copiado al portapapeles');
        }
      } catch (e) { console.error(e); }
    };

    return (
      <div className="misiones-popup-overlay">
        <div className="misiones-invite-card">
          <div className="invite-badge">Invita a tus Amigos</div>
          <h1 className="invite-title">Invita a un amigo a entrenar contigo</h1>
          <p className="invite-desc">Invita a un amigo a registrarse y que cree su perfil. Comparte el enlace para que pueda empezar a entrenar.</p>

          <div style={{textAlign:'center', marginTop:18}}>
            <button className="invite-share-btn" onClick={handleShare}>Compartir Enlace&nbsp;➜</button>
          </div>

          <div className="invite-bullets">
            <div className="bullet"><span className="dot"/>Entrena en Compañía</div>
            <div className="bullet"><span className="dot"/>Motívense Juntos</div>
          </div>

          <div className="misiones-popup-actions" style={{marginTop:20}}>
            <button className="misiones-popup-cancel" onClick={() => setMostrarPopup(false)}>Cancelar</button>
            <button className="misiones-popup-accept" onClick={() => { setMostrarPopup(false); setCargando(true); completarMisionWithRetries(misionPendiente, 3); }}>Aceptar y continuar</button>
          </div>
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
            onClick={() => handleCompletarClick(mision)}
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
      <div className="misiones-header">
        <button 
          onClick={onVolver}
          className="misiones-back-btn"
        >
          ←
        </button>
        <h1 className="misiones-header-title">
          Misiones
        </h1>
      </div>

      <div className="misiones-section">
        <h2 className="misiones-section-title">Reto Diario</h2>
        {misiones.retos_diarios.map(mision => (
          <MisionCard key={mision.id} mision={mision} />
        ))}
      </div>


      <div className="misiones-section">
        <h2 className="misiones-section-title">Reto Semanal</h2>
        {misiones.retos_semanales.map(mision => (
          <MisionCard key={mision.id} mision={mision} />
        ))}
      </div>

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