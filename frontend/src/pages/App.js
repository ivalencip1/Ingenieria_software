// src/pages/App.js
import React, { useEffect, useState } from "react";
import { usuariosAPI } from "../services/apiUsuarios";
import UserHeader from "../components/UserHeader";
import RetosDia from "../components/RetosDia";
import ProgresoSemanal from "../components/ProgresoSemanal";
import AccesoRapido from "../components/AccesoRapido";
import MisionesPage from './MisionesPage';

function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [vistaActual, setVistaActual] = useState('home'); // 'home', 'usuarios', 'misiones'

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoading(true);
        const res = await usuariosAPI.listar();
        
        if (Array.isArray(res.data)) {
          setUsuarios(res.data);
        } else if (res.data.results && Array.isArray(res.data.results)) {
          setUsuarios(res.data.results);
        } else {
          setUsuarios([]);
        }
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
        setError(error.message);
        setUsuarios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  // Función para cambiar entre vistas
  const cambiarVista = (vista) => {
    setVistaActual(vista);
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{minHeight: '100vh', background: '#f5f5f5'}}>
      {/* Navegación simple */}
      <nav style={{
        padding: '10px 20px', 
        background: 'white', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '10px'
      }}>
        <button 
          onClick={() => cambiarVista('home')}
          style={{
            padding: '8px 16px',
            background: vistaActual === 'home' ? '#667eea' : '#f0f0f0',
            color: vistaActual === 'home' ? 'white' : '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🏠 Home
        </button>
        <button 
          onClick={() => cambiarVista('usuarios')}
          style={{
            padding: '8px 16px',
            background: vistaActual === 'usuarios' ? '#667eea' : '#f0f0f0',
            color: vistaActual === 'usuarios' ? 'white' : '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          👥 Usuarios
        </button>
        <button 
          onClick={() => cambiarVista('misiones')}
          style={{
            padding: '8px 16px',
            background: vistaActual === 'misiones' ? '#667eea' : '#f0f0f0',
            color: vistaActual === 'misiones' ? 'white' : '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          📋 Misiones
        </button>
      </nav>

      {/* Contenido según la vista */}
      {vistaActual === 'home' && (
        <div>
          <UserHeader />
          <RetosDia />
          <ProgresoSemanal />
          <AccesoRapido />
        </div>
      )}

      {vistaActual === 'usuarios' && (
        <div>
          <h1>Usuarios</h1>
          {usuarios.length === 0 ? (
            <p>No hay usuarios registrados</p>
          ) : (
            <ul>
              {usuarios.map((u) => (
                <li key={u.id}>{u.username} - {u.puntos_totales} puntos</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {vistaActual === 'misiones' && (
        <MisionesPage onVolver={() => setVistaActual('home')} />
      )}
    </div>
  );
}

export default App;