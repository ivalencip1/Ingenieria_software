import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import OnboardingSurvey from './pages/OnboardingSurvey';
import App from './pages/App';
import { authAPI } from './services/apiAuth';

function MainApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [surveyCompleted, setSurveyCompleted] = useState(true);

  useEffect(() => {
    // Verificar si hay usuario en localStorage
    const usuario = authAPI.getCurrentUser();
    if (usuario) {
      setIsAuthenticated(true);
      // Verificar si la encuesta está completada
      setSurveyCompleted(usuario.survey_completed || false);
    }
    setLoading(false);
  }, []);

  // Escuchar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const usuario = authAPI.getCurrentUser();
      setIsAuthenticated(!!usuario);
      if (usuario) {
        setSurveyCompleted(usuario.survey_completed || false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{
          color: 'white',
          fontSize: '18px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }}></div>
          Cargando...
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLoginSuccess={() => {
                setIsAuthenticated(true);
              }} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <SignUpPage onSignUpSuccess={() => {
                setIsAuthenticated(true);
              }} />
            )
          }
        />

        {/* Ruta de encuesta de onboarding */}
        <Route
          path="/onboarding-survey"
          element={
            isAuthenticated ? (
              <OnboardingSurvey
                usuarioId={authAPI.getCurrentUser()?.id}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <App />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
        />

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default MainApp;
