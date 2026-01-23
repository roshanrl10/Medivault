import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true // Important for maintaining sessions/cookies
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // If unauthorized/forbidden, redirect to login or clear state
            // Optionally emit an event or call a logout function if accessible
            // For now, simpler handling or just bubbling up is okay, but redirecting is UX friendly
            // window.location.href = '/login'; // Use with caution in SPAs
        }
        return Promise.reject(error);
    }
);

export default api;
