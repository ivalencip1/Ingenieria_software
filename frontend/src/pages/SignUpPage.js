import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/apiAuth';
import './SignUpPage.css';

function SignUpPage({ onSignUpSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('El apellido es requerido');
      return false;
    }
    if (!formData.email.trim()) {
      setError('El correo electrónico es requerido');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Ingresa un correo electrónico válido');
      return false;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    if (!formData.bio.trim()) {
      setError('La biografía es requerida');
      return false;
    }
    return true;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const username = formData.email.split('@')[0]; // Usar parte del email como username
      const response = await authAPI.signup(
        username,
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.bio
      );

      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }

      // Guardar usuario en localStorage
      localStorage.setItem('usuario', JSON.stringify(response.user));
      localStorage.setItem('authToken', response.token);

      if (onSignUpSuccess) {
        onSignUpSuccess();
      }

      setTimeout(() => {
        navigate('/onboarding-survey', { 
          replace: true,
          state: { usuarioId: response.user.id }
        });
      }, 100);
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1>¡Bienvenido!</h1>
          <p>Crea tu cuenta para comenzar</p>
        </div>

        <form onSubmit={handleSignUp} className="signup-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Nombre</label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                placeholder="Juan"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Apellido</label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                placeholder="Pérez"
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
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
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <div className="password-input-group">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bio">Biografía </label>
            <textarea
              id="bio"
              name="bio"
              placeholder="Cuéntanos un poco sobre ti..."
              value={formData.bio}
              onChange={handleChange}
              disabled={loading}
              maxLength={200}
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontFamily: 'inherit',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
            <small style={{ color: '#999' }}>{formData.bio.length}/200</small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="signup-button"
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <div className="signup-footer">
          <p>
            ¿Ya tienes cuenta?{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => navigate('/login')}
              disabled={loading}
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
