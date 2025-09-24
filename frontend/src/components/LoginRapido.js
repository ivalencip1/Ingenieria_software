import React, { useState } from 'react';
import './LoginRapido.css';
import { apiAuth } from '../services/apiAuth';

const LoginRapido = ({ onLoginExitoso, onCancelar, onMostrarRegistro }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Usuario y contraseña son requeridos');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const resultado = await apiAuth.iniciarSesion(formData);
      
      if (resultado.success) {
        // Guardar usuario en localStorage
        apiAuth.guardarUsuario(resultado.data.user);
        onLoginExitoso && onLoginExitoso(resultado.data.user);
      } else {
        setError(resultado.data.message || 'Error en el login');
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-rapido-overlay">
      <div className="login-rapido-modal">
        <div className="login-rapido-header">
          <h2>Iniciar Sesión</h2>
          <button 
            className="cerrar-modal"
            onClick={onCancelar}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className="login-rapido-content">
          <p className="instrucciones">
            Ingresa tus credenciales para acceder
          </p>

          <form onSubmit={handleSubmit} className="form-login">
            <div className="campo-grupo">
              <label htmlFor="username">Usuario</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Tu nombre de usuario"
                disabled={loading}
                required
              />
            </div>

            <div className="campo-grupo">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Tu contraseña"
                disabled={loading}
                required
              />
            </div>

            {error && (
              <div className="mensaje-error">
                {error}
              </div>
            )}

            <div className="botones-accion">
              <button
                type="button"
                className="btn-cancelar"
                onClick={onCancelar}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-login"
                disabled={loading}
              >
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>

          <div className="registro-link">
            <p>¿No tienes cuenta?</p>
            <button 
              type="button"
              className="btn-mostrar-registro"
              onClick={onMostrarRegistro}
              disabled={loading}
            >
              Regístrate aquí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRapido;