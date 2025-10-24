import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/apiAuth';
import './LoginPage.css';

function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);

      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }

      // Guardar usuario en localStorage
      localStorage.setItem('usuario', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);

      // Llamar al callback para notificar login exitoso
      if (onLoginSuccess) {
        onLoginSuccess();
      }

      // Redirigir al dashboard
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>¡Bienvenido!</h1>
          <p>Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-input-group">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => navigate('/signup')}
              disabled={loading}
            >
              Regístrate aquí
            </button>
          </p>
          <button
            type="button"
            className="forgot-password-link"
            onClick={() => navigate('/forgot-password')}
            disabled={loading}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
