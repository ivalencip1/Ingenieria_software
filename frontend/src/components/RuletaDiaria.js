import React, { useState, useEffect, useCallback } from 'react';
import { Wheel } from 'react-custom-roulette';
import { obtenerPremiosRuleta, puedeGirarRuleta, girarRuleta } from '../services/apiRuleta';
import './RuletaDiaria.css';

const RuletaDiaria = ({ usuarioActual }) => {
    const [premios, setPremios] = useState([]);
    const [puedeGirar, setPuedeGirar] = useState(false);
    const [mustStartSpinning, setMustStartSpinning] = useState(false);
    const [prizeNumber, setPrizeNumber] = useState(0);
    const [premioGanado, setPremioGanado] = useState(null);
    // Eliminado puntosSumados, ya no se usa
    const [mensaje, setMensaje] = useState('');
    const [mostrarPremio, setMostrarPremio] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [mostrarInvitaPopup, setMostrarInvitaPopup] = useState(false);
    const [mostrarRecompensaPopup, setMostrarRecompensaPopup] = useState(false);
    const [mostrarTipPopup, setMostrarTipPopup] = useState(false);
    const [tipText, setTipText] = useState('');


    // ================= FUNCIONES AUXILIARES =================
    const cargarDatos = useCallback(async () => {
        try {
            setCargando(true);
            const [premiosData, puedeGirarData] = await Promise.all([
                obtenerPremiosRuleta(),
                puedeGirarRuleta(usuarioActual?.id)
            ]);

            let premios = premiosData.premios || [];
            const premios80 = premios.filter(p => p.valor === 80);
            if (premios80.length > 0) {
                premios = [
                    ...premios,
                    ...premios80,
                    ...premios80
                ];
            }
            setPremios(premios);
            setPuedeGirar(puedeGirarData.puede_girar);
            setMensaje(puedeGirarData.mensaje);
        } catch (error) {
            console.error('Error cargando datos:', error);
            setMensaje('Error al cargar la ruleta');
        } finally {
            setCargando(false);
        }
    }, [usuarioActual]);

    const obtenerColorPremio = (index) => {
        const colores = [
            '#0cbb4e', '#5DC971', '#66c695', '#FAAD14', 
            '#FCC75D', '#7c00ff', '#9548ff', '#70ECD4'
        ];
        return colores[index % colores.length];
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
        retail: [
            'Muestra resultados en mejora de ventas y métricas de conversión.',
            'Describe experiencia gestionando objetivos de inventario y equipos.'
        ],
        default: [
            'Actualiza tu perfil y añade logros concretos. Un buen resumen profesional ayuda mucho.',
            'Usa viñetas para mostrar tus logros y métricas en cada experiencia laboral.'
        ]
    };

    const generarTipParaUsuario = async () => {
        try {
            const res = await fetch(`http://localhost:8000/api/core/perfil-completo/?usuario_id=${usuarioActual?.id}`);
            if (!res.ok) throw new Error('No profile');
            const data = await res.json();
            const sectors = (data.perfil && data.perfil.sectors) ? data.perfil.sectors : [];
                const normalize = s => String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
            const tips = [];
            (sectors.length ? sectors : []).forEach(s => {
                const key = normalize(s);
                if (SECTOR_TIPS[key]) tips.push(...SECTOR_TIPS[key]);
            });
            if (tips.length > 0) return tips[Math.floor(Math.random() * tips.length)];
        } catch (err) {
            // fall through to default
        }
        const defs = SECTOR_TIPS.default;
        return defs[Math.floor(Math.random() * defs.length)];
    };

    const manejarGiro = async () => {
        if (!puedeGirar || mustStartSpinning) return;

        try {
            const resultado = await girarRuleta(usuarioActual?.id);
            const indicePremio = premios.findIndex(p => p.id === resultado.premio.id);
            if (indicePremio >= 0) {
                setPrizeNumber(indicePremio);
                setPremioGanado(resultado.premio);
                setMensaje(resultado.mensaje);
                setPuedeGirar(false);
                setMustStartSpinning(true);
            }
        } catch (error) {
            try {
                const parsed = await error.response?.json?.();
                const msg = parsed?.mensaje || 'Ya giraste hoy. Debes esperar hasta mañana para volver a girar.';
                setMensaje(msg);
                setPuedeGirar(false);
            } catch (_) {
                setMensaje('Ya giraste hoy. Debes esperar hasta mañana para volver a girar.');
                setPuedeGirar(false);
            }
        }
    };

    const alFinalizarGiro = () => {
        setMustStartSpinning(false);
        // If prize is the special "Invita-gana" flow
        if (premioGanado && premioGanado.nombre === 'Invita-gana') {
            setMostrarInvitaPopup(true);
        // If prize looks like a "tip" reward, show a tip preview popup first
        } else if (premioGanado && /tip|tips|consejo|recomendaci/i.test(premioGanado.nombre)) {
            // generate tip text and show the tip popup
            generarTipParaUsuario().then(t => {
                setTipText(t || 'Revisa tu sección de tips en la tienda para más detalles.');
                setMostrarTipPopup(true);
            }).catch(() => {
                setTipText('Revisa tu sección de tips en la tienda para más detalles.');
                setMostrarTipPopup(true);
            });
        } else {
            setMostrarPremio(true);
        }
        cargarDatos();
    };

    // ================== FIN FUNCIONES AUXILIARES =============

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const data = premios.length > 0 ? premios.map((premio, index) => ({
        option: premio.nombre,
        style: { 
            backgroundColor: obtenerColorPremio(index),
            textColor: '#FFFFFF',
            fontSize: 18,
            fontWeight: 'bold'
        }
    })) : [];

    return (
        <div className="ruleta-container-simple">
            {cargando ? (
                <div>Cargando ruleta...</div>
            ) : data.length > 0 ? (
                <Wheel
                    mustStartSpinning={mustStartSpinning}
                    prizeNumber={prizeNumber}
                    data={data}
                    onStopSpinning={alFinalizarGiro}
                    backgroundColors={['#0cbb4e', '#5DC971', '#66c695', '#FAAD14', '#FCC75D', '#7c00ff']}
                    textColors={['#FFFFFF']}
                    outerBorderColor={'#334960'}
                    outerBorderWidth={8}
                    innerRadius={28}
                    innerBorderColor={'#334960'}
                    innerBorderWidth={5}
                    radiusLineColor={'#334960'}
                    radiusLineWidth={2}
                    fontSize={18}
                    textDistance={55}
                    spinDuration={0.8}
                />
            ) : (
                <div>No hay premios disponibles</div>
            )}

            <button 
                className="btn-girar-simple"
                onClick={manejarGiro}
                disabled={mustStartSpinning || data.length === 0 || cargando}
            >
                {mustStartSpinning ? 'Girando...' : cargando ? 'Cargando...' : 'Girar'}
            </button>

                {/* Mensaje si no va a girar*/}
                {!puedeGirar && mensaje && (
                    <div className="mensaje-ruleta" style={{ color: '#7c00ff', marginTop: '10px', fontWeight: '500' }}>
                        {mensaje}
                    </div>
                )}

           
            {mostrarInvitaPopup && (
                <div className="premio-popup">
                    <div className="premio-popup-content">
                        <div className="premio-info">
                            <h4>Invita-gana</h4>
                            <p>Doble puntos si invitas a un amigo en este día</p>
                            <a href="https://www.magneto365.com/es" target="_blank" rel="noopener noreferrer" style={{display:'block',marginBottom:'18px',color:'#007bff',textDecoration:'underline',fontWeight:'normal'}}>https://www.magneto365.com/es</a>
                        </div>
                        <button onClick={() => { setMostrarInvitaPopup(false); setMostrarRecompensaPopup(true); }}>
                            Continuar
                        </button>
                    </div>
                </div>
            )}
            {/* Tip popup: muestra un tip breve antes de aceptar la recompensa */}
            {mostrarTipPopup && (
                <div className="premio-popup">
                    <div className="premio-popup-content">
                        <div className="premio-info">
                            <h4>Tip rápido</h4>
                            <p>{tipText}</p>
                            <p style={{fontSize:12, opacity:0.85, marginTop:8}}>Este tip te fue dado junto con tu recompensa. Pulsa aceptar para continuar.</p>
                        </div>
                        <button onClick={() => {
                            setMostrarTipPopup(false);
                            // después de cerrar tip, mostrar el popup de recompensa normal
                            setMostrarPremio(true);
                        }}>
                            Aceptar
                        </button>
                    </div>
                </div>
            )}
           
            {mostrarRecompensaPopup && (
                <div className="premio-popup">
                    <div className="premio-popup-content">
                        <div className="premio-info">
                            <h4>¡Recompensa dada!</h4>
                            <p>Has ganado 160 puntos por Invita-gana</p>
                            <p>+160 puntos</p>
                        </div>
                        <button onClick={() => {
                            // Cerrar popup y sumar puntos si la recompensa tiene valor
                            if (premioGanado && premioGanado.valor > 0 && usuarioActual) {
                                try {
                                    const nuevosPuntos = (usuarioActual.puntos_totales || 0) + premioGanado.valor;
                                    const usuarioActualizado = { ...usuarioActual, puntos_totales: nuevosPuntos };
                                    localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
                                } catch (e) {
                                    console.error('Error actualizando puntos en localStorage:', e);
                                }
                                // recargar para que la UI muestre los puntos actualizados
                                window.location.reload();
                                return;
                            }
                            setMostrarRecompensaPopup(false);
                            setMostrarPremio(false);
                        }}>
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
            {/* Popup normal para otros premios */}
            {mostrarPremio && premioGanado && premioGanado.nombre !== 'Invita-gana' && (
                <div className="premio-popup">
                    <div className="premio-popup-content">
                        <div className="premio-info">
                            <h4>{premioGanado.nombre}</h4>
                            <p>{premioGanado.descripcion}</p>
                            {premioGanado.valor > 0 && (
                                <p>+{premioGanado.valor} puntos</p>
                            )}
                        </div>
                        <button onClick={() => {
                            // cerrar popup y sumar puntos si la recompensa tiene valor (generalizado)
                            if (premioGanado && premioGanado.valor > 0 && usuarioActual) {
                                try {
                                    const nuevosPuntos = (usuarioActual.puntos_totales || 0) + premioGanado.valor;
                                    const usuarioActualizado = { ...usuarioActual, puntos_totales: nuevosPuntos };
                                    localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
                                } catch (e) {
                                    console.error('Error actualizando puntos en localStorage:', e);
                                }
                                // recargar para que la UI muestre los puntos actualizados
                                window.location.reload();
                                return;
                            }
                            setMostrarPremio(false);
                        }}>
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RuletaDiaria;