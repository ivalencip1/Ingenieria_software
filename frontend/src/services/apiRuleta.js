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
export const puedeGirarRuleta = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/rewards/ruleta/puede-girar/`);
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
export const girarRuleta = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/rewards/ruleta/girar/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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

// Obtener historial de giros
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