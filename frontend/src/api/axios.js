import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true // Important for maintaining sessions
});

export default api;
