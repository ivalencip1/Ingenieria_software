// Servicio para manejar autenticación de usuarios

const API_BASE_URL = 'http://localhost:8000/api';

export const apiAuth = {
  // Registrar nuevo usuario
  registrarUsuario: async (datosUsuario) => {
    try {
      const response = await fetch(`${API_BASE_URL}/core/registro/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosUsuario),
        credentials: 'include' // Incluir cookies para sesiones
      });

      const data = await response.json();
      return {
        success: response.ok,
        data: data,
        status: response.status
      };
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        data: { message: 'Error de conexión' },
        status: 500
      };
    }
  },

  // Iniciar sesión
  iniciarSesion: async (credenciales) => {
    try {
      const response = await fetch(`${API_BASE_URL}/core/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credenciales),
        credentials: 'include' // Incluir cookies para sesiones
      });

      const data = await response.json();
      return {
        success: response.ok,
        data: data,
        status: response.status
      };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        data: { message: 'Error de conexión' },
        status: 500
      };
    }
  },

  // Verificar si hay usuario logueado (simulado por ahora)
  usuarioActual: () => {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },

  // Guardar datos del usuario en localStorage
  guardarUsuario: (datosUsuario) => {
    localStorage.setItem('usuario', JSON.stringify(datosUsuario));
  },

  // Cerrar sesión
  cerrarSesion: () => {
    localStorage.removeItem('usuario');
    // También enviar request al backend para cerrar sesión
    fetch(`${API_BASE_URL}/core/logout/`, {
      method: 'POST',
      credentials: 'include'
    }).catch(console.error);
  }
};