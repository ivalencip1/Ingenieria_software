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
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        ];
        return colores[index % colores.length];
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
        if (premioGanado && premioGanado.nombre === 'Invita-gana') {
            setMostrarInvitaPopup(true);
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
            textColor: '#000000',
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
                    backgroundColors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F']}
                    textColors={['#000000']}
                    outerBorderColor={'#FFD700'}
                    outerBorderWidth={8}
                    innerRadius={28}
                    innerBorderColor={'#FFD700'}
                    innerBorderWidth={5}
                    radiusLineColor={'#FFD700'}
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
                    <div className="mensaje-ruleta" style={{ color: '#FF6B6B', marginTop: '10px' }}>
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
           
            {mostrarRecompensaPopup && (
                <div className="premio-popup">
                    <div className="premio-popup-content">
                        <div className="premio-info">
                            <h4>¡Recompensa dada!</h4>
                            <p>Has ganado 160 puntos por Invita-gana</p>
                            <p>+160 puntos</p>
                        </div>
                        <button onClick={() => {
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
                            setMostrarPremio(false);
                           
                            if (premioGanado.valor === 80 && usuarioActual) {
                                const nuevosPuntos = (usuarioActual.puntos_totales || 0) + 80;
                                const usuarioActualizado = { ...usuarioActual, puntos_totales: nuevosPuntos };
                                localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
                                window.location.reload();
                            }
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