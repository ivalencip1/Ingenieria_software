const API_BASE_URL = 'http://localhost:8000/api';

export const obtenerPremiosRuleta = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/rewards/ruleta/premios/`);
        if (!response.ok) {
            throw new Error('Error al obtener premios de la ruleta');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

// Verificar si el usuario puede girar la ruleta hoy
export const puedeGirarRuleta = async (usuarioId) => {
    try {
        const url = usuarioId
            ? `${API_BASE_URL}/rewards/ruleta/puede-girar/?usuario_id=${usuarioId}`
            : `${API_BASE_URL}/rewards/ruleta/puede-girar/`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error al verificar si puede girar');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

// Girar la ruleta
export const girarRuleta = async (usuarioId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/rewards/ruleta/girar/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(usuarioId ? { usuario_id: usuarioId } : {})
        });
        if (!response.ok) {
            throw new Error('Error al girar la ruleta');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const obtenerHistorialRuleta = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/rewards/ruleta/historial/`);
        if (!response.ok) {
            throw new Error('Error al obtener historial');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};