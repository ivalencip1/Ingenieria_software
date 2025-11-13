import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/apiUsuarios';
import './TiendaRecompensas.css';


const TiendaRecompensas = ({ onVolver, usuarioActual, onActualizarUsuario }) => {
    const [categorias, setCategorias] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [historialDisponible, setHistorialDisponible] = useState(false);
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
    const [buyingId, setBuyingId] = useState(null);
    const [pendingPurchaseId, setPendingPurchaseId] = useState(null);


    const cargarDatos = useCallback(async () => {
        setLoading(true);
        try {
            const q = usuarioActual?.id ? `?usuario_id=${usuarioActual.id}` : '';
            // Preferimos usar axios (api) para enviar token si existe
            const promises = [
                api.get(`/rewards/tienda/categorias/${q}`),
                api.get(`/rewards/tienda/historial/${q}`)
            ];
            const [resCategorias, resHistorial] = await Promise.all(promises);

            if (resCategorias && resCategorias.data) {
                setCategorias(resCategorias.data.categorias || []);
                setPuntosUsuario(resCategorias.data.puntos_usuario || 0);
            }

            if (resHistorial && resHistorial.data && Array.isArray(resHistorial.data.historial)) {
                setHistorial(resHistorial.data.historial);
                setHistorialDisponible(true);
            } else {
                setHistorial([]);
                setHistorialDisponible(false);
            }
        } catch (err) {
            
            if (err && err.response && err.response.status === 410) {
                setHistorial([]);
                setHistorialDisponible(false);
            } else {
                console.error('Error cargando datos tienda:', err);
              
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

    const openSectorModalForCompra = async (compra) => {
       
        try {
            const res = await api.get(`/core/perfil-completo/?usuario_id=${usuarioActual?.id}`);
            const perfil = res && res.data && res.data.perfil ? res.data.perfil : null;
            const sectors = (perfil && perfil.sectors) ? perfil.sectors : [];

           
            const tips = [];
            
                const normalize = (str) => String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
            (sectors.length ? sectors : []).forEach(s => {
                const key = normalize(s);
                if (SECTOR_TIPS[key]) {
                    tips.push(...SECTOR_TIPS[key]);
                }
            });

            setRecomendaciones(tips.length ? tips : ['No hay tips para tus sectores seleccionados.']);

          
            if (compra && compra.id) {
                try {
                    await api.post('/rewards/tienda/canjear/', { compra_id: compra.id });
                } catch (err) {
                    console.error('Error marcando compra canjeada:', err);
                }
            }

           
            await cargarDatos();
            setMostrarPopup(true);
        } catch (err) {
            console.error('Error fetching perfil for sectors:', err);
          
            setRecomendaciones(['No pudimos obtener tus sectores. Revisa tu perfil para configurarlos.']);
            setMostrarPopup(true);
        }
    };

    const SECTOR_TIPS = {
        
        tech: [
            'Incluye palabras clave técnicas en tu CV (React, Python, SQL).',
            'Muestra logros cuantificables: proyectos con métricas y resultados.'
        ],
        health: [
            'Resalta experiencia en protocolos y certificaciones relevantes.',
            'Incluye resultados medibles como mejoras en KPIs de salud.'
        ],
        education: [
            'Menciona experiencia en diseño curricular y resultados de aprendizaje.',
            'Incluye acciones concretas: número de estudiantes, cursos impartidos.'
        ],
        finance: [
            'Incluye logros en reducción de costes o aumento de ingresos.',
            'Resalta conocimiento en herramientas financieras y regulaciones.'
        ],
        finanzas: [
            'Incluye logros en reducción de costes o aumento de ingresos.',
            'Resalta conocimiento en herramientas financieras y regulaciones.'
        ],
        retail: [
            'Muestra resultados en mejora de ventas y métricas de conversión.',
            'Describe experiencia gestionando objetivos de inventario y equipos.'
        ],
       
        software: [
            'Incluye palabras clave técnicas en tu CV (React, Python, SQL).',
            'Muestra logros cuantificables: proyectos con métricas y resultados.'
        ],
        tecnologia: [
            'Incluye palabras clave técnicas en tu CV (React, Python, SQL).',
            'Muestra logros cuantificables: proyectos con métricas y resultados.'
        ],
        salud: [
            'Resalta experiencia en protocolos y certificaciones relevantes.',
            'Incluye resultados medibles como mejoras en KPIs de salud.'
        ],
        educacion: [
            'Menciona experiencia en diseño curricular y resultados de aprendizaje.',
            'Incluye acciones concretas: número de estudiantes, cursos impartidos.'
        ],
        administracion: [
            'Destaca experiencia en gestión de equipos y procesos administrativos.',
            'Incluye logros en optimización de procesos o reducción de costes.'
        ],
        administraciOn: [
           
            'Destaca experiencia en gestión de equipos y procesos administrativos.',
            'Incluye logros en optimización de procesos o reducción de costes.'
        ]
    };


    const handleBuyCV = async () => {
        
        if (!usuarioActual || !usuarioActual.id) {
            setMensaje({ tipo: 'error', texto: 'Necesitas iniciar sesión para comprar.' });
            setTimeout(() => setMensaje(null), 3000);
            return;
        }

        const flatRewards = categorias.flatMap(c => (c.recompensas || []));
        const cvReward = flatRewards.find(r => r.nombre && r.nombre.toLowerCase().includes('hoja de vida')) || flatRewards.find(r => r.nombre && r.nombre.toLowerCase().includes('cv'));

        if (!cvReward) {
          
            setMensaje({ tipo: 'error', texto: 'La recompensa CV no está disponible en el servidor. Contacta al administrador.' });
            setTimeout(() => setMensaje(null), 3000);
            return;
        }

        setMensaje({ tipo: 'info', texto: 'Procesando compra...' });
        try {
            const compraRes = await comprarRecompensa(cvReward.id);
            if (compraRes && compraRes.success) {
               
                setPendingPurchaseId(compraRes.compra_id || null);
                setMensaje({ tipo: 'success', texto: 'Compra realizada. Ve a Mis Compras para subir tu CV.' });
               
                setVistaActual('historial');
            } else {
                setMensaje({ tipo: 'error', texto: 'No se pudo completar la compra.' });
            }
        } catch (err) {
            console.error('Error en compra CV:', err);
            setMensaje({ tipo: 'error', texto: 'Error procesando la compra' });
        } finally {
            setTimeout(() => setMensaje(null), 3000);
        }
    };

    const handleBuyTips = async () => {
        
        if (!usuarioActual || !usuarioActual.id) {
            setMensaje({ tipo: 'error', texto: 'Necesitas iniciar sesión para comprar.' });
            setTimeout(() => setMensaje(null), 3000);
            return;
        }

        const flatRewards = categorias.flatMap(c => (c.recompensas || []));
        const tipsReward = flatRewards.find(r => r.nombre && r.nombre.toLowerCase().includes('tips de empleo')) || flatRewards.find(r => r.costo_puntos === 120 && r.nombre && r.nombre.toLowerCase().includes('tips'));
        if (!tipsReward) {
            setMensaje({ tipo: 'error', texto: 'La recompensa de tips no está disponible en el servidor.' });
            setTimeout(() => setMensaje(null), 3000);
            return;
        }

        setMensaje({ tipo: 'info', texto: 'Procesando compra...' });
        try {
            const compraRes = await comprarRecompensa(tipsReward.id);
            if (compraRes && compraRes.success) {
                setPendingPurchaseId(compraRes.compra_id || null);
                setMensaje({ tipo: 'success', texto: 'Compra realizada. Ve a Mis Compras para reclamar los tips.' });
                setVistaActual('historial');
            } else {
                setMensaje({ tipo: 'error', texto: 'No se pudo completar la compra.' });
            }
        } catch (err) {
            console.error('Error en compra Tips:', err);
            setMensaje({ tipo: 'error', texto: 'Error procesando la compra' });
        } finally {
            setTimeout(() => setMensaje(null), 3000);
        }
    };

    const comprarRecompensa = async (recompensaId) => {
        if (!usuarioActual || !usuarioActual.id) {
            setMensaje({ tipo: 'error', texto: 'Necesitas iniciar sesión para comprar.' });
            setTimeout(() => setMensaje(null), 3000);
            return;
        }
        setMensaje({ tipo: 'info', texto: 'Procesando compra...' });
        setBuyingId(recompensaId);
        try {
            const payload = { recompensa_id: recompensaId, usuario_id: usuarioActual.id };
            const res = await api.post('/rewards/tienda/comprar/', payload);
            if (res && res.data && res.data.success) {
                setMensaje({ tipo: 'success', texto: res.data.mensaje || 'Compra realizada' });
                // Actualizar puntos y recargar categorías e historial
                setPuntosUsuario(res.data.puntos_restantes ?? puntosUsuario);
        
                await cargarDatos();
                
                try {
                    const perfilRes = await fetch(`http://localhost:8000/api/core/perfil-completo/?usuario_id=${usuarioActual.id}`);
                    if (perfilRes.ok) {
                        const perfilData = await perfilRes.json();
                        if (perfilData.perfil && onActualizarUsuario) {
                            onActualizarUsuario(perfilData.perfil);
                            try { localStorage.setItem('usuario', JSON.stringify(perfilData.perfil)); } catch(_) {}
                        }
                    }
                } catch (e) {
                   
                }
               
                return res.data || { success: true };
            } else {
                setMensaje({ tipo: 'error', texto: 'No se pudo completar la compra.' });
            }
        } catch (err) {
            console.error('Error comprando recompensa:', err);
            if (err && err.response) {
                const status = err.response.status;
                const data = err.response.data || {};
                if (status === 400) {
                    setMensaje({ tipo: 'error', texto: data.error || 'No tienes suficientes puntos' });
                } else if (status === 410) {
                    setMensaje({ tipo: 'info', texto: data.error || 'Compras deshabilitadas en el servidor' });
                    setHistorialDisponible(false);
                } else {
                    setMensaje({ tipo: 'error', texto: data.error || 'Error al procesar la compra' });
                }
            } else {
                setMensaje({ tipo: 'error', texto: 'Error de red al intentar comprar' });
            }
        } finally {
            setTimeout(() => setMensaje(null), 3000);
            setBuyingId(null);
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
            <div className="recommendations-overlay">
                <div className="recommendations-card">
                    <div className="recommendations-icon">🧲</div>
                    <h2 className="rec-title">¡Recomendaciones Magneto!</h2>
                    <div className="rec-subtitle">Gracias a un asesor de Magneto tienes estas recomendaciones:</div>
                    <ul className="rec-list">
                        {recomendaciones.length === 0 ? (
                            <li>¡Todo está perfecto en tu perfil!</li>
                        ) : (
                            recomendaciones.map((r, i) => <li key={i}>{r}</li>)
                        )}
                    </ul>
                    <button className="rec-close-btn" onClick={() => setMostrarPopup(false)}>Cerrar</button>
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
                        }} disabled={processingResume} />
                        {uploadError && <div style={{color:'red', marginTop:8}}>{uploadError}</div>}
                    </div>
                    <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:18}}>
                        <button onClick={()=>{ setMostrarUploadModal(false); setUploadedFile(null); setUploadError(null); }} style={{background:'#e5e7eb', border:'none', padding:'8px 12px', borderRadius:8, cursor:'pointer'}} disabled={processingResume}>Cancelar</button>
                        <button onClick={async ()=>{
                            if (!uploadedFile) { setUploadError('Selecciona un archivo PDF antes de continuar'); return; }
                            setProcessingResume(true);
                            // Simular procesamiento y generar recomendaciones
                                setTimeout(async ()=>{
                                    try {
                                        
                                        if (pendingPurchaseId && !String(pendingPurchaseId).startsWith('temp-')) {
                                            const fd = new FormData();
                                            fd.append('compra_id', pendingPurchaseId);
                                            fd.append('cv', uploadedFile);
                                            const uploadRes = await api.post('/rewards/tienda/upload-cv/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                                            if (uploadRes && uploadRes.data && uploadRes.data.recomendaciones) {
                                                setRecomendaciones(uploadRes.data.recomendaciones);
                                            }
                                           
                                            await cargarDatos();
                                            setPendingPurchaseId(null);
                                        } else {
                                            
                                            const recs = [
                                                'Incluye un resumen profesional al inicio con tus logros más relevantes.',
                                                'Usa viñetas para describir logros cuantificables (ej.: "Aumenté ventas 20%" ).',
                                                'Asegúrate de que tu información de contacto esté actualizada y visible.',
                                                'Adapta palabras clave al sector/puesto al que aplicas (mira la oferta).',
                                                'Mantén el diseño limpio: tipografía legible y evita párrafos largos.'
                                            ];
                                            setRecomendaciones(recs);
                                            if (pendingPurchaseId) {
                                                setHistorial(prev => (prev || []).map(h => h.id === pendingPurchaseId ? ({ ...h, canjeado: true }) : h));
                                                setPendingPurchaseId(null);
                                            }
                                        }
                                    } catch (err) {
                                        console.error('Error subiendo CV al servidor:', err);
                                        setUploadError('Error subiendo el CV. Intenta de nuevo.');
                                    } finally {
                                        setMostrarUploadModal(false);
                                        setProcessingResume(false);
                                        setUploadedFile(null);
                                        setUploadError(null);
                                        setMostrarPopup(true);
                                    }
                                }, 1600);
                        }} style={{background:'#6D28D9', color:'white', border:'none', padding:'10px 14px', borderRadius:8, cursor:'pointer'}} disabled={processingResume}>
                            {processingResume ? 'Procesando...' : 'Continuar'}
                        </button>
                    </div>
                </div>
            </div>
        )}
        {/* sector modal removed: tips are generated from saved profile sectors automatically */}
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
                    {/* Custom reward: Tips por sector */}
                    <div className="product-card">
                        <div className="card-icon">💡</div>
                        <h3>Acceder a tips de empleo</h3>
                        <p>Obtén tips personalizados por sector según tus intereses registrados en la encuesta.</p>
                        <button className="buy-btn" onClick={() => handleBuyTips()}>
                            <span className="diamond"></span> 120 MagnetoPoints
                        </button>
                    </div>
                    {/* Custom reward: Recomendaciones CV */}
                    <div className="product-card">
                        <div className="card-icon">📄</div>
                        <h3>Recomendaciones para Hoja de Vida</h3>
                        <p>Sube tu CV en PDF y nuestro asesor te dará recomendaciones prácticas para mejorarlo.</p>
                        <button className="buy-btn" onClick={() => handleBuyCV()}>
                            <span className="diamond"></span> 25 MagnetoPoints
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
                    {!historialDisponible ? (
                        <div style={{padding:20, color:'#555'}}>
                            <h3>Historial no disponible</h3>
                            <p>La funcionalidad de compra y historial fue deshabilitada en esta versión. Aquí verás tus compras si se habilita nuevamente.</p>
                        </div>
                    ) : (
                        historial.map(compra => (
                            <div key={compra.id} className={`history-item ${compra.canjeado ? 'used' : ''}`}>
                                <div className="history-icon">{compra.recompensa.icono}</div>
                                <div className="history-info">
                                    <h4>{compra.recompensa.nombre}</h4>
                                    <p> {compra.puntos_gastados} MagnetoPoints</p>
                                    <span className="date">{new Date(compra.fecha_compra).toLocaleDateString()}</span>
                                </div>
                                <div className="status">
                                   
                                    {compra.recompensa && compra.recompensa.nombre && compra.recompensa.nombre.toLowerCase().includes('tips') ? (
                                        <button
                                            onClick={() => {
                                                
                                                openSectorModalForCompra(compra);
                                            }}
                                            style={{
                                                background: '#0ea5a4',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '8px 16px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {compra.canjeado ? 'Ver tips' : 'Disponible'}
                                        </button>
                                    ) : compra.recompensa && compra.recompensa.nombre === 'Recomendaciones para Hoja de Vida' ? (
                                        <button
                                            onClick={() => {
                                                if (!compra.canjeado) {
                                                    setMostrarUploadModal(true);
                                                    setPendingPurchaseId(compra.id);
                                                } else {
                                                    setMostrarPopup(true);
                                                }
                                            }}
                                            style={{
                                                background: '#6D28D9',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '8px 16px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {compra.canjeado ? 'Ver recomendaciones' : 'Disponible'}
                                        </button>
                                    ) : (
                                        // default behavior for other rewards
                                        compra.canjeado ? (
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
                                                Disponible
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
        </>
    );
};

export default TiendaRecompensas;