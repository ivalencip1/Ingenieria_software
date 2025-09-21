// src/components/UserHeader.js
import React, { useState, useEffect } from 'react';
import { usuariosAPI } from '../services/apiUsuarios';

function UserHeader() {
  const [usuario, setUsuario] = useState(null);
  
  useEffect(() => {
  // Usar API específica de perfil
  fetch('http://localhost:8000/api/core/perfil/')
    .then(res => res.json())
    .then(data => setUsuario(data))
    .catch(err => console.error(err));
}, []);

  return (
    <header style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px',
      borderRadius: '0 0 20px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <h1>Home</h1>
      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
        <span style={{background: '#FF6B35', padding: '5px 10px', borderRadius: '20px'}}>
          M {usuario?.puntos_totales || 0}
        </span>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: '#ddd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          👤
        </div>
      </div>
    </header>
  );
}

export default UserHeader;