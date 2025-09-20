import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
//lets you change between environments

//Create axios instance with base configuration
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },

});

// Add token to requests automatically

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('chekwasmed_token'); //fix
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('chekwasmed_token'); //fix(added chekwas med)
            localStorage.removeItem('chekwasmed_user'); //Added
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

//Auth endpoints
export const authAPI = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    updateProfile: async (userData) => {
        const response = await api.put('/auth/profile', userData);
        return response.data;
    }
};

//Medication endpoints
export const medicationAPI = {
    //Get all medications for current user
    getAll: async () => {
        const response = await api.get('/medications');
        return response.data;
    },


    // Get single medication by ID
    getById: async (id) => {
        const response = await api.get(`/medications/${id}`);
        return response.data;
    },

    // Add new medication
    add: async (medicationData) => {
        const response = await api.post('/medications', medicationData);
        return response.data;
    },

    // Update medication
    update: async (id, medicationData) => {
        const response = await api.put(`/medications/${id}`, medicationData);
        return response.data;
    },

    // Delete medication
    delete: async (id) => {
        const response = await api.delete(`/medications/${id}`);
        return response.data;
    },

    // Search medications (if you have this endpoint)
    search: async (query) => {
        const response = await api.get(`/medications/search?q=${encodeURIComponent(query)}`);
        return response.data;
    }
};

    //User medication endpoints (for tracking which meds user takes)
    export const userMedicationAPI = {
        getAll: async () => {
            const response = await api.get('/user-medications');
            return response.data;
        },

        add: async (medicationId, dosage) => {
            const response = await api.post('/user-medications', {
                medicationId,
                dosage
            });
            return response.data;
        },

        update: async (id, updateData) => {
            const response = await api.put(`/user-medications/${id}`, updateData);
            return response.data;
        },

        delete: async (id) => {
            const response = await api.delete(`/user-medications/${id}`);
            return response.data;
        }
    };

export default api;



