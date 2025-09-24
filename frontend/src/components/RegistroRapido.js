import React, { useState } from 'react';
import './RegistroRapido.css';
import { apiAuth } from '../services/apiAuth';

const RegistroRapido = ({ onRegistroExitoso, onCancelar }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    nombre_completo: ''
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar mensajes al escribir
    if (error) setError('');
    if (mensaje) setMensaje('');
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
      const resultado = await apiAuth.registrarUsuario(formData);
      
      if (resultado.success) {
        setMensaje('¡Usuario registrado exitosamente!');
        setTimeout(() => {
          onRegistroExitoso && onRegistroExitoso(resultado.data.user);
        }, 1500);
      } else {
        setError(resultado.data.message || 'Error en el registro');
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-rapido-overlay">
      <div className="registro-rapido-modal">
        <div className="registro-rapido-header">
          <h2>Registro Rápido - Estudiantes</h2>
          <button 
            className="cerrar-modal"
            onClick={onCancelar}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className="registro-rapido-content">
          <p className="instrucciones">
            Regístrate rápidamente para probar la aplicación
          </p>

          <form onSubmit={handleSubmit} className="form-registro">
            <div className="campo-grupo">
              <label htmlFor="username">Usuario *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Ingresa tu nombre de usuario"
                disabled={loading}
                required
              />
            </div>

            <div className="campo-grupo">
              <label htmlFor="nombre_completo">Nombre Completo</label>
              <input
                type="text"
                id="nombre_completo"
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleChange}
                placeholder="Tu nombre completo (opcional)"
                disabled={loading}
              />
            </div>

            <div className="campo-grupo">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com (opcional)"
                disabled={loading}
              />
            </div>

            <div className="campo-grupo">
              <label htmlFor="password">Contraseña *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ingresa una contraseña"
                disabled={loading}
                required
              />
            </div>

            {error && (
              <div className="mensaje-error">
                {error}
              </div>
            )}

            {mensaje && (
              <div className="mensaje-exito">
                {mensaje}
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
                className="btn-registrar"
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Registrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistroRapido;