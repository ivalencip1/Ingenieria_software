import React, { useState, useEffect } from 'react';
import './MinigamePage.css';

const MinigamePage = ({ onVolver, usuarioActual }) => {
  const [preguntas, setPreguntas] = useState([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [sector, setSector] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [puntaje, setPuntaje] = useState(0);
  const [respuestasCorrectas, setRespuestasCorrectas] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [mostrandoResultado, setMostrandoResultado] = useState(false);
  const [juegoTerminado, setJuegoTerminado] = useState(false);

  // Función para obtener preguntas de la API
  const obtenerPreguntas = async () => {
    try {
      setCargando(true);
      const response = await fetch('http://localhost:8000/api/minigame/generate-questions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: usuarioActual?.id || 1  // Usar el ID del usuario actual o 1 por defecto
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPreguntas(data.preguntas);
        setSector(data.sector);
        setError(null);
      } else {
        throw new Error('Error al obtener preguntas');
      }
    } catch (err) {
      setError('No se pudieron cargar las preguntas. Usando preguntas de ejemplo.');
      // Preguntas de ejemplo en caso de error
      setPreguntas([
        {
          q: "¿Cuál es una habilidad importante en tu sector?",
          tipo: "Conocimiento",
          c: "Análisis de datos",
          d1: "Cocinar",
          d2: "Bailar",
          d3: "Cantar"
        }
      ]);
      setSector('General');
    } finally {
      setCargando(false);
    }
  };

  // Función para reiniciar el juego
  const reiniciarJuego = () => {
    setPreguntaActual(0);
    setPuntaje(0);
    setRespuestasCorrectas(0);
    setRespuestaSeleccionada(null);
    setMostrandoResultado(false);
    setJuegoTerminado(false);
    obtenerPreguntas();
  };

  // Función para determinar la clase CSS de cada opción
  const getOptionClass = (opcion) => {
    if (!mostrandoResultado) return '';
    
    const pregunta = preguntas[preguntaActual];
    
    // La respuesta correcta siempre se marca en verde
    if (opcion === pregunta.c) {
      return 'option-correct';
    }
    
    // La respuesta seleccionada incorrecta se marca en rojo
    if (opcion === respuestaSeleccionada && opcion !== pregunta.c) {
      return 'option-incorrect';
    }
    
    // Las demás opciones se atenúan
    return 'option-dimmed';
  };

  // Cargar preguntas al montar el componente
  useEffect(() => {
    obtenerPreguntas();
  }, [usuarioActual]);

  // Función para manejar respuestas
  const manejarRespuesta = (respuesta) => {
    if (mostrandoResultado) return; // Evitar múltiples clics
    
    const pregunta = preguntas[preguntaActual];
    const esCorrecta = respuesta === pregunta.c;
    
    setRespuestaSeleccionada(respuesta);
    setMostrandoResultado(true);
    
    if (esCorrecta) {
      setPuntaje(puntaje + 20); // 20 Magneto Points por respuesta correcta
      setRespuestasCorrectas(respuestasCorrectas + 1);
    }
    
    // Mostrar resultado por 2 segundos antes de continuar
    setTimeout(() => {
      setMostrandoResultado(false);
      setRespuestaSeleccionada(null);
      
      // Pasar a la siguiente pregunta o terminar el juego
      if (preguntaActual < preguntas.length - 1) {
        setPreguntaActual(preguntaActual + 1);
      } else {
        finalizarJuego();
      }
    }, 2000);
  };

  // Función para finalizar el juego y sumar puntos al usuario
  const finalizarJuego = async () => {
    const puntajeFinal = puntaje + (respuestaSeleccionada === preguntas[preguntaActual].c ? 20 : 0);
    setJuegoTerminado(true);
    
    // Enviar puntos al backend para sumarlos al usuario
    if (puntajeFinal > 0 && usuarioActual?.id) {
      try {
        await fetch('http://localhost:8000/api/core/sumar-puntos/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: usuarioActual.id,
            puntos: puntajeFinal
          })
        });
      } catch (error) {
        console.error('Error al sumar puntos:', error);
      }
    }
    
    setTimeout(() => {
      alert(`¡Juego terminado!\n\nRespuestas correctas: ${respuestasCorrectas + (respuestaSeleccionada === preguntas[preguntaActual].c ? 1 : 0)}/${preguntas.length}\nMagneto Points ganados: ${puntajeFinal}\n\n¡Los puntos se han sumado a tu cuenta!`);
    }, 500);
  };

  if (cargando) {
    return (
      <div className="minigame-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>🎮 Cargando preguntas personalizadas...</h2>
          <p>Generando preguntas para tu sector profesional</p>
        </div>
      </div>
    );
  }

  const pregunta = preguntas[preguntaActual];

  return (
    <div className="minigame-container">
      <header className="minigame-header">
        <button 
          onClick={onVolver}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(255,255,255,0.9)',
            border: 'none',
            color: '#28a745',
            padding: '12px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '20px',
            boxShadow: '0 4px 8px rgba(40, 167, 69, 0.2)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#28a745';
            e.target.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.9)';
            e.target.style.color = '#28a745';
          }}
        >
          ←
        </button>
        <h1>¿Quién Quiere Ser Millonario?</h1>
        {sector && (
          <div style={{ 
            textAlign: 'center', 
            background: 'rgba(255,255,255,0.2)', 
            padding: '5px 15px', 
            borderRadius: '15px',
            margin: '10px auto',
            width: 'fit-content'
          }}>
            <span style={{ fontSize: '14px', opacity: 0.9 }}>
              Sector: {sector}
            </span>
          </div>
        )}
      </header>
      <div className="minigame-status">
        <div className="status-item">Pregunta <span>{preguntaActual + 1} / {preguntas.length}</span></div>
        <div className="status-item">Correctas <span>{respuestasCorrectas}</span></div>
        <div className="status-item">Magneto Points <span>{puntaje}</span></div>
      </div>
      
      {error && (
        <div style={{ 
          background: '#ff6b6b', 
          color: 'white', 
          padding: '10px', 
          borderRadius: '5px', 
          margin: '10px 0',
          textAlign: 'center'
        }}>
          ⚠️ {error}
        </div>
      )}

      {pregunta && (
        <div className="minigame-question">
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '10px', 
            background: 'rgba(106, 90, 205, 0.2)',
            padding: '5px 10px',
            borderRadius: '10px',
            display: 'inline-block'
          }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
              {pregunta.tipo}
            </span>
          </div>
          <h2>{pregunta.q}</h2>
          <div className="minigame-options">
            <button 
              className={`option ${getOptionClass(pregunta.c)}`}
              onClick={() => manejarRespuesta(pregunta.c)}
              disabled={mostrandoResultado}
            >
              A. {pregunta.c}
            </button>
            <button 
              className={`option ${getOptionClass(pregunta.d1)}`}
              onClick={() => manejarRespuesta(pregunta.d1)}
              disabled={mostrandoResultado}
            >
              B. {pregunta.d1}
            </button>
            <button 
              className={`option ${getOptionClass(pregunta.d2)}`}
              onClick={() => manejarRespuesta(pregunta.d2)}
              disabled={mostrandoResultado}
            >
              C. {pregunta.d2}
            </button>
            <button 
              className={`option ${getOptionClass(pregunta.d3)}`}
              onClick={() => manejarRespuesta(pregunta.d3)}
              disabled={mostrandoResultado}
            >
              D. {pregunta.d3}
            </button>
          </div>
          
          {mostrandoResultado && (
            <div style={{
              textAlign: 'center',
              marginTop: '15px',
              padding: '10px',
              borderRadius: '8px',
              background: respuestaSeleccionada === pregunta.c ? '#d4edda' : '#f8d7da',
              color: respuestaSeleccionada === pregunta.c ? '#155724' : '#721c24',
              fontWeight: 'bold'
            }}>
              {respuestaSeleccionada === pregunta.c ? 
                '🎉 ¡Correcto! +20 Magneto Points' : 
                `❌ Incorrecto. La respuesta correcta era: ${pregunta.c}`
              }
            </div>
          )}
        </div>
      )}

      <footer className="minigame-footer">
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ width: `${((preguntaActual + 1) / preguntas.length) * 100}%` }}
          ></div>
        </div>
        
        {preguntas.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button 
              onClick={reiniciarJuego}
              style={{
                background: '#6a5acd',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '12px',
                marginRight: '10px'
              }}
            >
              🔄 Nuevo Juego
            </button>
            {juegoTerminado && (
              <button 
                onClick={onVolver}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                🏠 Volver al Inicio
              </button>
            )}
          </div>
        )}
      </footer>
    </div>
  );
};

export default MinigamePage;