import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api"; // Django corre en 8000

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: si en el futuro usas token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;

export const usuariosAPI = {
  listar: () => api.get("/usuarios/"),
  crear: (data) => api.post("/usuarios/", data),
  detalle: (id) => api.get(`/usuarios/${id}/`),
  actualizar: (id, data) => api.put(`/usuarios/${id}/`, data),
  eliminar: (id) => api.delete(`/usuarios/${id}/`),
  // Nuevas funciones para el sistema sin autenticación
  perfilUsuario: (userId = null) => {
    const url = userId ? `/core/perfil/?user_id=${userId}` : `/core/perfil/`;
    return api.get(url);
  },
  perfilCompleto: (userId = null) => {
    const url = userId ? `/core/perfil-completo/?user_id=${userId}` : `/core/perfil-completo/`;
    return api.get(url);
  }
};
