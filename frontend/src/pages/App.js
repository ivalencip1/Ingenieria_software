// src/pages/App.js
import React, { useEffect, useState } from "react";
import { usuariosAPI } from "../services/apiUsuarios";
import UserHeader from "../components/UserHeader";
import RetosDia from "../components/RetosDia";
import ProgresoSemanal from "../components/ProgresoSemanal";
import AccesoRapido from "../components/AccesoRapido";
import MisionesPage from './MisionesPage';
import TiendaRecompensas from './TiendaRecompensas';
import Perfil from './Perfil';
import RuletaPage from './RuletaPage';
import './App.css';

function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vistaActual, setVistaActual] = useState('home'); // 'home', 'usuarios', 'misiones', 'tienda', 'perfil', 'ruleta'
  const [usuarioActual, setUsuarioActual] = useState(null);

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
    
    // Cargar usuario del demo selector si existe
    const usuarioDemo = localStorage.getItem('usuario');
    if (usuarioDemo) {
      setUsuarioActual(JSON.parse(usuarioDemo));
    }
  }, []);

  // Función para cambiar entre vistas
  const cambiarVista = (vista) => {
    setVistaActual(vista);
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{minHeight: '100vh', background: '#f5f5f5', paddingBottom: '80px'}}>
      {/* Contenido según la vista */}
      {vistaActual === 'home' && (
        <div>
          <UserHeader usuarioActual={usuarioActual} />
          <RetosDia usuarioActual={usuarioActual} />
          <ProgresoSemanal usuarioActual={usuarioActual} />
          <AccesoRapido onCambiarVista={cambiarVista} />
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
        <MisionesPage onVolver={() => setVistaActual('home')} usuarioActual={usuarioActual} />
      )}

      {vistaActual === 'tienda' && (
        <TiendaRecompensas onVolver={() => setVistaActual('home')} usuarioActual={usuarioActual} />
      )}

      {vistaActual === 'perfil' && (
        <Perfil usuarioActual={usuarioActual} />
      )}

      {vistaActual === 'ruleta' && (
        <RuletaPage />
      )}

      {/* Botón flotante Magneto - Global */}
      <div 
        onClick={() => window.open('https://www.magneto365.com/es', '_blank')}
        style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          width: '60px',
          height: '60px',
          background: '#28a745',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '28px',
          color: 'white',
          fontWeight: 'bold',
          zIndex: 1000,
          textAlign: 'center',
          lineHeight: '60px'
        }}
      >
        m
      </div>

      {/* Navegación inferior fija */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 0',
        zIndex: 1000
      }}>
        <button 
          onClick={() => cambiarVista('home')}
          style={{
            padding: '8px 12px',
            background: 'transparent',
            color: vistaActual === 'home' ? '#667eea' : '#666',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: vistaActual === 'home' ? '600' : '400',
            minWidth: '60px'
          }}
        >
          <span style={{fontSize: '20px'}}>🏠</span>
          Home
        </button>
        <button 
          onClick={() => cambiarVista('usuarios')}
          style={{
            padding: '8px 12px',
            background: 'transparent',
            color: vistaActual === 'usuarios' ? '#667eea' : '#666',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: vistaActual === 'usuarios' ? '600' : '400',
            minWidth: '60px'
          }}
        >
          <span style={{fontSize: '20px'}}>👥</span>
          Usuarios
        </button>
        <button 
          onClick={() => cambiarVista('misiones')}
          style={{
            padding: '8px 12px',
            background: 'transparent',
            color: vistaActual === 'misiones' ? '#667eea' : '#666',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: vistaActual === 'misiones' ? '600' : '400',
            minWidth: '60px'
          }}
        >
          <span style={{fontSize: '20px'}}>📋</span>
          Misiones
        </button>
        <button 
          onClick={() => cambiarVista('tienda')}
          style={{
            padding: '8px 12px',
            background: 'transparent',
            color: vistaActual === 'tienda' ? '#667eea' : '#666',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: vistaActual === 'tienda' ? '600' : '400',
            minWidth: '60px'
          }}
        >
          <span style={{fontSize: '20px'}}>🛍️</span>
          Tienda
        </button>
        <button 
          onClick={() => cambiarVista('perfil')}
          style={{
            padding: '8px 12px',
            background: 'transparent',
            color: vistaActual === 'perfil' ? '#667eea' : '#666',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: vistaActual === 'perfil' ? '600' : '400',
            minWidth: '60px'
          }}
        >
          <span style={{fontSize: '20px'}}>👤</span>
          Perfil
        </button>
      </nav>
    </div>
  );
}

export default App;