import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5000/admin', // Points to admin routes
});

// Interceptor to add token to requests
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default instance;