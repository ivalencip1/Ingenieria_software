import api from './apiUsuarios';

export const vacantesAPI = {
  listar: (sectorsCsv = '') => api.get(`/social/vacantes/${sectorsCsv ? `?sectors=${encodeURIComponent(sectorsCsv)}` : ''}`),
  detalle: (slug) => api.get(`/social/vacantes/${slug}/`),
};

export default vacantesAPI;
