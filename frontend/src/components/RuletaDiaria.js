import React, { useState, useEffect } from 'react';
import { Wheel } from 'react-custom-roulette';
import { obtenerPremiosRuleta, puedeGirarRuleta, girarRuleta } from '../services/apiRuleta';
import './RuletaDiaria.css';

const RuletaDiaria = () => {
    const [premios, setPremios] = useState([]);
    const [puedeGirar, setPuedeGirar] = useState(false);
    const [mustStartSpinning, setMustStartSpinning] = useState(false);
    const [prizeNumber, setPrizeNumber] = useState(0);
    const [premioGanado, setPremioGanado] = useState(null);
    const [mensaje, setMensaje] = useState('');
    const [mostrarPremio, setMostrarPremio] = useState(false);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const [premiosData, puedeGirarData] = await Promise.all([
                obtenerPremiosRuleta(),
                puedeGirarRuleta()
            ]);

            setPremios(premiosData.premios || []);
            setPuedeGirar(puedeGirarData.puede_girar);
            setMensaje(puedeGirarData.mensaje);
        } catch (error) {
            console.error('Error cargando datos:', error);
            setMensaje('Error al cargar la ruleta');
        } finally {
            setCargando(false);
        }
    };

    const obtenerIconoPremio = (tipo) => {
        const iconos = {
            'tip_laboral': '💡',
            'acceso_curso': '📚',
            'magneto_50': '⚡',
            'magneto_80': '🔥',
            'invita_gana': '👥'
        };
        return iconos[tipo] || '🎁';
    };

    const obtenerColorPremio = (index) => {
        const colores = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        ];
        return colores[index % colores.length];
    };

    // Preparar datos para la ruleta
    const data = premios.length > 0 ? premios.map((premio, index) => ({
        option: `${obtenerIconoPremio(premio.tipo)} ${premio.nombre}`,
        style: { 
            backgroundColor: obtenerColorPremio(index),
            textColor: '#FFFFFF',
            fontSize: 14,
            fontWeight: 'bold'
        }
    })) : [];

    const manejarGiro = async () => {
        if (!puedeGirar || mustStartSpinning) return;

        try {
            // Primero obtenemos el resultado del backend
            const resultado = await girarRuleta();
            
            // Encontramos el índice del premio ganado
            const indicePremio = premios.findIndex(p => p.id === resultado.premio.id);
            
            if (indicePremio >= 0) {
                setPrizeNumber(indicePremio);
                setPremioGanado(resultado.premio);
                setMensaje(resultado.mensaje);
                setPuedeGirar(false);
                
                // Iniciar la animación de giro
                setMustStartSpinning(true);
            }

        } catch (error) {
            console.error('Error al girar:', error);
            setMensaje('Error al girar la ruleta');
        }
    };

    const alFinalizarGiro = () => {
        setMustStartSpinning(false);
        setMostrarPremio(true);
        // Actualizar historial
        cargarDatos();
    };

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
                    textColors={['#FFFFFF']}
                    outerBorderColor={'#FFD700'}
                    outerBorderWidth={8}
                    innerRadius={20}
                    innerBorderColor={'#FFD700'}
                    innerBorderWidth={5}
                    radiusLineColor={'#FFD700'}
                    radiusLineWidth={2}
                    fontSize={14}
                    textDistance={70}
                    spinDuration={0.8}
                />
            ) : (
                <div>No hay premios disponibles</div>
            )}

            <button 
                className="btn-girar-simple"
                onClick={manejarGiro}
                disabled={!puedeGirar || mustStartSpinning || data.length === 0 || cargando}
            >
                {mustStartSpinning ? 'Girando...' : cargando ? 'Cargando...' : 'Girar'}
            </button>

                {/* Mostrar mensaje si no se puede girar */}
                {!puedeGirar && mensaje && (
                    <div className="mensaje-ruleta" style={{ color: '#FF6B6B', marginTop: '10px' }}>
                        {mensaje}
                    </div>
                )}

            {mostrarPremio && premioGanado && (
                <div className="premio-popup">
                    <div className="premio-popup-content">
                        <h3>¡Premio!</h3>
                        <div className="premio-info">
                            <h4>{premioGanado.nombre}</h4>
                            <p>{premioGanado.descripcion}</p>
                            {premioGanado.valor > 0 && (
                                <p>+{premioGanado.valor} puntos</p>
                            )}
                        </div>
                        <button onClick={() => setMostrarPremio(false)}>
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RuletaDiaria;