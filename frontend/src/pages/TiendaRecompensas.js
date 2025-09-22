import React, { useState, useEffect } from 'react';
import './TiendaRecompensas.css';

const TiendaRecompensas = ({ onVolver }) => {
    const [categorias, setCategorias] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [puntosUsuario, setPuntosUsuario] = useState(0);
    const [loading, setLoading] = useState(true);
    const [cargandoMagneto, setCargandoMagneto] = useState(false);
    const [vistaActual, setVistaActual] = useState('tienda');
    const [categoriaActual, setCategoriaActual] = useState('todas');
    const [mensaje, setMensaje] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [resCategorias, resHistorial] = await Promise.all([
                fetch('http://localhost:8000/api/rewards/tienda/categorias/', { credentials: 'include' }),
                fetch('http://localhost:8000/api/rewards/tienda/historial/', { credentials: 'include' })
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
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
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
        
        // Mostrar pantalla de carga por 3 segundos
        setTimeout(() => {
            setCargandoMagneto(false);
            // Abrir Magneto365 en nueva pestaña
            window.open('https://www.magneto365.com/es', '_blank');
        }, 3000);
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

            {/* Categorías - solo se muestran en vista de tienda */}
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
                                        🌟 Disponible
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TiendaRecompensas;