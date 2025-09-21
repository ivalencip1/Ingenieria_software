const API_BASE = 'http://localhost:8000/api';

export const dashboardAPI = {
  perfil: () => fetch(`${API_BASE}/core/perfil/`).then(res => res.json()),
  misiones: () => fetch(`${API_BASE}/gamification/misiones/`).then(res => res.json()),
  progreso: () => fetch(`${API_BASE}/gamification/progreso/`).then(res => res.json()),
  completarMision: (id) => fetch(`${API_BASE}/gamification/completar/${id}/`, {method: 'POST'}).then(res => res.json()),
  ruleta: () => fetch(`${API_BASE}/rewards/ruleta/`).then(res => res.json()),
  girarRuleta: () => fetch(`${API_BASE}/rewards/ruleta/`, {method: 'POST'}).then(res => res.json()),
  ranking: () => fetch(`${API_BASE}/rewards/ranking/`).then(res => res.json())
};