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
import RankingPage from './RankingPage';
import VacantesPage from './VacantesPage';
import MinigamePage from './MinigamePage';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vistaActual, setVistaActual] = useState('home');
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [prevVista, setPrevVista] = useState('home');

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        setLoading(true);
        const usuarioGuardado = localStorage.getItem('usuario');
        if (usuarioGuardado) {
          const parsed = JSON.parse(usuarioGuardado);
          setUsuarioActual(parsed);
         
          if (parsed?.id) {
            try {
             
              const resp = await usuariosAPI.detalle(parsed.id);
              if (resp && resp.data) {
                setUsuarioActual(resp.data);
                try { localStorage.setItem('usuario', JSON.stringify(resp.data)); } catch(_) {}
              }
            } catch (e) {
             
              try {
                const fallback = await fetch(`http://localhost:8000/api/core/perfil-completo/?usuario_id=${parsed.id}`);
                if (fallback.ok) {
                  const data = await fallback.json();
                  if (data.perfil) {
                    setUsuarioActual(data.perfil);
                    try { localStorage.setItem('usuario', JSON.stringify(data.perfil)); } catch(_) {}
                  }
                }
              } catch (_e) {
               
              }
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    cargarUsuario();
  }, []);

  useEffect(() => {
    if (usuarioActual && usuarioActual.id) {
      const actualizarUsuarioActual = async () => {
        try {
          const res = await usuariosAPI.detalle(usuarioActual.id);
          setUsuarioActual(res.data);
        } catch (error) {
         
          try {
            const resp = await fetch(`http://localhost:8000/api/core/perfil-completo/?usuario_id=${usuarioActual.id}`);
            if (resp.ok) {
              const data = await resp.json();
              if (data.perfil) {
                setUsuarioActual(data.perfil);
                try { localStorage.setItem('usuario', JSON.stringify(data.perfil)); } catch(_) {}
              }
            }
          } catch (e) {
          
          }
        }
      };
      actualizarUsuarioActual();
    }
  }, [usuarioActual?.id]);

  const cambiarVista = (vista) => {
    setPrevVista(vistaActual);
    setVistaActual(vista);
  };

 
  useEffect(() => {
    if (vistaActual !== 'home') return;
    if (!usuarioActual?.id) return;
    let shouldTrigger = false;
    try { shouldTrigger = localStorage.getItem('magboost_profile_visited') === '1'; } catch(_) {}
    if (!shouldTrigger) return;
    fetch(`http://localhost:8000/api/notifications/usuario/${usuarioActual.id}/tips-perfil/?trigger=profile_return`, { method: 'POST' })
      .then(() => {
        try { localStorage.removeItem('magboost_profile_visited'); } catch(_) {}
        if (typeof window !== 'undefined') {
          const ev = new CustomEvent('magboost:new-notifications');
          window.dispatchEvent(ev);
        }
      })
      .catch(() => {});
  }, [vistaActual, usuarioActual?.id]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{minHeight: '100vh', background: '#FFFFFF', paddingBottom: '80px'}}>
     
      {vistaActual === 'home' && (
        <div>
          <UserHeader usuarioActual={usuarioActual} />
          <RetosDia usuarioActual={usuarioActual} />
          <ProgresoSemanal usuarioActual={usuarioActual} />
          <AccesoRapido onCambiarVista={cambiarVista} />
        </div>
      )}

      {vistaActual === 'misiones' && (
        <MisionesPage 
          onVolver={() => setVistaActual('home')} 
          usuarioActual={usuarioActual} 
          onActualizarUsuario={setUsuarioActual}
        />
      )}

      {vistaActual === 'tienda' && (
        <TiendaRecompensas onVolver={() => setVistaActual('home')} usuarioActual={usuarioActual} onActualizarUsuario={setUsuarioActual} />
      )}

      {vistaActual === 'vacantes' && (
        <VacantesPage onVolver={() => setVistaActual('home')} usuarioActual={usuarioActual} />
      )}

      {vistaActual === 'perfil' && (
        <Perfil usuarioActual={usuarioActual} />
      )}

      {vistaActual === 'ruleta' && (
        <RuletaPage usuarioActual={usuarioActual} />
      )}

      {vistaActual === 'ranking' && (
        <RankingPage onVolver={() => setVistaActual('home')} usuarioActual={usuarioActual} />
      )}

      {vistaActual === 'minigame' && (
        <MinigamePage onVolver={() => setVistaActual('home')} usuarioActual={usuarioActual} />
      )}

      {/* Botón flotante para Minijuego */}
      <div 
        onClick={() => cambiarVista('minigame')}
        style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #7c00ff 0%, #9548ff 100%)',
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
          lineHeight: '60px',
          boxShadow: '0 4px 15px rgba(124, 0, 255, 0.3)'
        }}
      >
        m
      </div>

     
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
            color: vistaActual === 'home' ? '#334960' : '#667688',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: vistaActual === 'home' ? '600' : '400',
            minWidth: '60px',
            transition: 'all 0.3s ease'
          }}
        >
          <span style={{fontSize: '20px'}}>🏠</span>
          Home
        </button>
        <button 
          onClick={() => cambiarVista('misiones')}
          style={{
            padding: '8px 12px',
            background: 'transparent',
            color: vistaActual === 'misiones' ? '#0cbb4e' : '#667688',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: vistaActual === 'misiones' ? '600' : '400',
            minWidth: '60px',
            transition: 'all 0.3s ease'
          }}
        >
          <span style={{fontSize: '20px'}}>✅</span>
          Misiones
        </button>
        <button 
          onClick={() => cambiarVista('tienda')}
          style={{
            padding: '8px 12px',
            background: 'transparent',
            color: vistaActual === 'tienda' ? '#70ECD4' : '#667688',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: vistaActual === 'tienda' ? '600' : '400',
            minWidth: '60px',
            transition: 'all 0.3s ease'
          }}
        >
          <span style={{fontSize: '20px'}}>🛍️</span>
          Tienda
        </button>
        {/* Juego button removed from bottom nav as requested */}
        <button 
          onClick={() => cambiarVista('perfil')}
          style={{
            padding: '8px 12px',
            background: 'transparent',
            color: vistaActual === 'perfil' ? '#22D3B7' : '#667688',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: vistaActual === 'perfil' ? '600' : '400',
            minWidth: '60px',
            transition: 'all 0.3s ease'
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