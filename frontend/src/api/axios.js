import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Adjust if port is different
    withCredentials: true // Important for maintaining sessions
});

export default api;
