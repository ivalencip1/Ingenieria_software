import React, { useState, useEffect, useCallback } from 'react';
import './TiendaRecompensas.css';


const TiendaRecompensas = ({ onVolver, usuarioActual }) => {
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
        try {
            const response = await fetch('http://localhost:8000/api/rewards/tienda/comprar/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ recompensa_id: recompensaId })
            });
            const data = await response.json();
            if (response.ok) {
                setPuntosUsuario(data.puntos_restantes);
                setMensaje({ tipo: 'exito', texto: data.mensaje });
                cargarDatos();
            } else {
                setMensaje({ tipo: 'error', texto: data.error });
            }
            setTimeout(() => setMensaje(null), 3000);
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error de conexión' });
            setTimeout(() => setMensaje(null), 3000);
        }
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