import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/apiUsuarios';
import './TiendaRecompensas.css';


const TiendaRecompensas = ({ onVolver, usuarioActual, onActualizarUsuario }) => {
    const [categorias, setCategorias] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [puntosUsuario, setPuntosUsuario] = useState(0);
    const [loading, setLoading] = useState(true);
    const [cargandoMagneto, setCargandoMagneto] = useState(false);
    const [vistaActual, setVistaActual] = useState('tienda');
    const [categoriaActual, setCategoriaActual] = useState('todas');
    const [mensaje, setMensaje] = useState(null);
    const [mostrarPopup, setMostrarPopup] = useState(false);
    const [recomendaciones, setRecomendaciones] = useState([]);
    const [mostrarUploadModal, setMostrarUploadModal] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadError, setUploadError] = useState(null);
    const [processingResume, setProcessingResume] = useState(false);


    const cargarDatos = useCallback(async () => {
        try {
            const q = usuarioActual?.id ? `?usuario_id=${usuarioActual.id}` : '';
            const [resCategorias, resHistorial] = await Promise.all([
                fetch(`http://localhost:8000/api/rewards/tienda/categorias/${q}`, { credentials: 'include' }),
                fetch(`http://localhost:8000/api/rewards/tienda/historial/${q}`, { credentials: 'include' })
            ]);
            if (resCategorias.ok) {
                const data = await resCategorias.json();
                setCategorias(data.categorias);
                setPuntosUsuario(data.puntos_usuario);
            }
            if (resHistorial.ok) {
                const data = await resHistorial.json();
                setHistorial(data.historial);
            }
        } finally {
            setLoading(false);
        }
    }, [usuarioActual]);

    useEffect(() => {
        cargarDatos();
    }, [usuarioActual, cargarDatos]);


    const mostrarRecomendaciones = async () => {
        const res = await fetch('http://localhost:8000/api/core/perfil-completo/' + (usuarioActual?.id ? `?usuario_id=${usuarioActual.id}` : ''));
        const data = await res.json();
        let recs = [];
        if (!data.perfil.avatar) {
            recs.push('Sube tu foto de perfil en tu perfil.');
        }
        if ((data.biografia || '').split('\n').length < 10) {
            recs.push('Tu biografía es muy corta, ¡hazla más larga!');
        }
        setRecomendaciones(recs);
        setMostrarPopup(true);
    };

    const comprarRecompensa = async (recompensaId) => {
        setCargandoMagneto(true);
        try {
            // Use axios instance so Authorization token (from localStorage) is included
            const res = await api.post('/rewards/tienda/comprar/', { recompensa_id: recompensaId, usuario_id: usuarioActual?.id });
            const data = res.data;
            if (res.status >= 200 && res.status < 300) {
                setMensaje({ tipo: 'exito', texto: data.mensaje });
                // Update local state with remaining points and refresh categories/historial
                if (typeof data.puntos_restantes !== 'undefined') {
                    setPuntosUsuario(data.puntos_restantes);
                }
                // reload categories and historial to reflect new canjeable status
                await cargarDatos();

                // Also refresh global usuarioActual so header and other components show updated points
                try {
                    if (onActualizarUsuario && usuarioActual?.id) {
                        // Prefer authenticated call; if it fails, fallback to public perfil_completo
                        try {
                            const usuarioRes = await api.get(`/usuarios/${usuarioActual.id}/`);
                            const usuarioData = usuarioRes.data;
                            onActualizarUsuario(usuarioData);
                            try { localStorage.setItem('usuario', JSON.stringify(usuarioData)); } catch(_) {}
                        } catch (errInner) {
                            console.warn('Fallo api.get usuario, intentando perfil_completo:', errInner?.response?.data || errInner);
                            try {
                                const resp = await fetch(`http://localhost:8000/api/core/perfil-completo/?usuario_id=${usuarioActual.id}`);
                                if (resp.ok) {
                                    const data = await resp.json();
                                    if (data.perfil) {
                                        onActualizarUsuario(data.perfil);
                                        try { localStorage.setItem('usuario', JSON.stringify(data.perfil)); } catch(_) {}
                                    }
                                }
                            } catch (errFetch) {
                                console.warn('Fallback perfil_completo falló:', errFetch);
                            }
                        }
                    }
                } catch (err) {
                    console.warn('No se pudo refrescar usuario tras compra:', err?.response?.data || err);
                }
            } else {
                setMensaje({ tipo: 'error', texto: data.error || 'Error al canjear' });
            }
            setTimeout(() => setMensaje(null), 2000);
        } catch (error) {
            const texto = error?.response?.data?.error || 'Error de conexión';
            setMensaje({ tipo: 'error', texto });
            setTimeout(() => setMensaje(null), 2000);
        }
        setTimeout(() => {
            setCargandoMagneto(false);
            // avoid full reload; UI updated via cargarDatos()
            // but keep a small safety reload if state seems inconsistent
            // window.location.reload();
        }, 2000);
    };

    const abrirMagneto = () => {
        setCargandoMagneto(true);
        setTimeout(() => {
            setCargandoMagneto(false);
            window.open('https://www.magneto365.com/es', '_blank');
        }, 2000);
    };

    if (loading) return <div>Cargando tienda...</div>;

    if (cargandoMagneto) {
        return (
            <div className="loading-overlay">
                <div className="loading-magnet">🧲</div>
                <h2 className="loading-title">Conectando con Magneto365...</h2>
                <p className="loading-subtitle">Preparando tu recompensa</p>
                <div className="loading-dots">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            {mostrarPopup && (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '18px',
                    padding: '32px 24px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                    maxWidth: '350px',
                    textAlign: 'center',
                    fontSize: '18px',
                    color: '#222',
                    fontWeight: 'bold'
                }}>
                    <h2 style={{marginBottom: '18px'}}>¡Recomendaciones Magneto!</h2>
                    <div style={{marginBottom: '12px'}}>Gracias a un asesor de Magneto tienes estas recomendaciones:</div>
                    <ul style={{textAlign: 'left', fontWeight: 'normal', fontSize: '16px', marginBottom: '18px'}}>
                        {recomendaciones.length === 0 ? (
                            <li>¡Todo está perfecto en tu perfil!</li>
                        ) : (
                            recomendaciones.map((r, i) => <li key={i}>{r}</li>)
                        )}
                    </ul>
                    <button onClick={() => setMostrarPopup(false)} style={{background:'#ef983a',color:'white',border:'none',borderRadius:'8px',padding:'10px 24px',fontWeight:'bold',fontSize:'16px',cursor:'pointer'}}>Cerrar</button>
                </div>
            </div>
        )}
        {mostrarUploadModal && (
            <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999}}>
                <div style={{background:'white', borderRadius:12, padding:24, width: '92%', maxWidth:480, textAlign:'left'}}>
                    <h2 style={{marginTop:0}}>Sube tu CV (.pdf)</h2>
                    <p style={{color:'#333'}}>Sube tu hoja de vida en formato <strong>.pdf</strong>. Nuestro asesor generará recomendaciones para mejorarla.</p>
                    <div style={{marginTop:12}}>
                        <input type="file" accept="application/pdf" onChange={(e)=>{
                            setUploadError(null);
                            const f = e.target.files && e.target.files[0];
                            if (!f) { setUploadedFile(null); return; }
                            if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
                                setUploadedFile(null);
                                setUploadError('Sólo se permiten archivos PDF');
                                return;
                            }
                            setUploadedFile(f);
                        }} />
                        {uploadError && <div style={{color:'red', marginTop:8}}>{uploadError}</div>}
                    </div>
                    <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:18}}>
                        <button onClick={()=>{ setMostrarUploadModal(false); setUploadedFile(null); setUploadError(null); }} style={{background:'#e5e7eb', border:'none', padding:'8px 12px', borderRadius:8, cursor:'pointer'}}>Cancelar</button>
                        <button onClick={async ()=>{
                            if (!uploadedFile) { setUploadError('Selecciona un archivo PDF antes de continuar'); return; }
                            setProcessingResume(true);
                            // Simular procesamiento y generar recomendaciones
                            setTimeout(()=>{
                                const recs = [
                                    'Incluye un resumen profesional al inicio con tus logros más relevantes.',
                                    'Usa viñetas para describir logros cuantificables (ej.: "Aumenté ventas 20%" ).',
                                    'Asegúrate de que tu información de contacto esté actualizada y visible.',
                                    'Adapta palabras clave al sector/puesto al que aplicas (mira la oferta).',
                                    'Mantén el diseño limpio: tipografía legible y evita párrafos largos.'
                                ];
                                setRecomendaciones(recs);
                                setMostrarUploadModal(false);
                                setProcessingResume(false);
                                setUploadedFile(null);
                                setUploadError(null);
                                setMostrarPopup(true);
                            }, 1600);
                        }} style={{background:'#6D28D9', color:'white', border:'none', padding:'10px 14px', borderRadius:8, cursor:'pointer'}}>Continuar</button>
                    </div>
                </div>
            </div>
        )}
        <div className="tienda-container">
            <div className="header">
                <button onClick={onVolver} className="btn-back">← Volver</button>
                <h1>Tienda</h1>
                <div className="puntos-badge">
                    <span className="diamond"></span>
                    <span className="puntos">{puntosUsuario}</span>
                    <span className="label">MagnetoPoints</span>
                </div>
            </div>

            {mensaje && (
                <div className={`mensaje ${mensaje.tipo}`}>
                    {mensaje.texto}
                </div>
            )}

            <div className="nav-tabs">
                <button 
                    className={`tab ${vistaActual === 'tienda' ? 'active' : ''}`}
                    onClick={() => setVistaActual('tienda')}
                >
                    Tienda
                </button>
                <button 
                    className={`tab ${vistaActual === 'historial' ? 'active' : ''}`}
                    onClick={() => setVistaActual('historial')}
                >
                    Mis Compras
                </button>
            </div>


            {vistaActual === 'tienda' && (
                <div className="category-tabs">
                    <button 
                        className={`category-tab ${categoriaActual === 'todas' ? 'active' : ''}`}
                        onClick={() => setCategoriaActual('todas')}
                    >
                         Todas
                    </button>
                    {categorias.map(categoria => (
                        <button 
                            key={categoria.id}
                            className={`category-tab ${categoriaActual === categoria.id ? 'active' : ''}`}
                            onClick={() => setCategoriaActual(categoria.id)}
                        >
                            {categoria.icono} {categoria.nombre}
                        </button>
                    ))}
                </div>
            )}

            {vistaActual === 'tienda' ? (
                <div className="products-grid">
                    {/* Custom reward: Recomendaciones CV */}
                    <div className="product-card">
                        <div className="card-icon">📄</div>
                        <h3>Recomendaciones para Hoja de Vida</h3>
                        <p>Sube tu CV en PDF y nuestro asesor te dará recomendaciones prácticas para mejorarlo.</p>
                        <button className="buy-btn" onClick={() => setMostrarUploadModal(true)}>
                            <span className="diamond"></span> Subir CV (.pdf)
                        </button>
                    </div>
                    {categorias
                        .filter(categoria => categoriaActual === 'todas' || categoria.id === categoriaActual)
                        .map(categoria => 
                            categoria.recompensas.map(recompensa => (
                                <div key={recompensa.id} className="product-card">
                                    <div className="card-icon">{recompensa.icono}</div>
                                    <h3>{recompensa.nombre}</h3>
                                    <p>{recompensa.descripcion}</p>
                                    <button 
                                        className={`buy-btn ${!recompensa.puede_canjear ? 'disabled' : ''}`}
                                        onClick={() => comprarRecompensa(recompensa.id)}
                                        disabled={!recompensa.puede_canjear}
                                    >
                                        <span className="diamond"></span> {recompensa.costo_puntos} MagnetoPoints
                                    </button>
                                </div>
                            ))
                        )}
                </div>
            ) : (
                <div className="history-list">
                    {historial.map(compra => (
                        <div key={compra.id} className={`history-item ${compra.canjeado ? 'used' : ''}`}>
                            <div className="history-icon">{compra.recompensa.icono}</div>
                            <div className="history-info">
                                <h4>{compra.recompensa.nombre}</h4>
                                <p> {compra.puntos_gastados} MagnetoPoints</p>
                                <span className="date">{new Date(compra.fecha_compra).toLocaleDateString()}</span>
                            </div>
                            <div className="status">
                                {compra.canjeado ? (
                                    <span style={{color: '#999'}}>✓ Utilizada</span>
                                ) : (
                                    compra.recompensa.nombre === 'Mini-tutorial personalizado' ? (
                                        <button 
                                            onClick={mostrarRecomendaciones}
                                            style={{
                                                background: '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '8px 16px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                             Disponible
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={abrirMagneto}
                                            style={{
                                                background: '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '8px 16px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                             Disponible
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        </>
    );
};

export default TiendaRecompensas;