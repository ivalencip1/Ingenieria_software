const API_BASE = 'http://localhost:8000/api';

export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  signup: async (username, email, password, firstName = '', lastName = '', bio = '') => {
    const response = await fetch(`${API_BASE}/auth/signup/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        bio,
      }),
    });
    return response.json();
  },

  logout: () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('authToken');
  },

  getCurrentUser: () => {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },
};
