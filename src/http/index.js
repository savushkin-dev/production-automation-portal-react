import axios from "axios";

export const API_URL = `${process.env.REACT_APP_API_BASE_URL}`

const $api = axios.create({
    withCredentials: true,
    baseURL: API_URL
})

// Флаг для предотвращения множественных refresh запросов
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor
$api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor (только для основного API)
$api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Обрабатываем и 401, и 403 как ошибки авторизации
        const isAuthError = error.response?.status === 401 || error.response?.status === 403;

        if (isAuthError && !originalRequest._retry) {

            // Не пытаемся обновить токен на эндпоинтах аутентификации
            if (originalRequest.url?.includes('/authenticate') ||
                originalRequest.url?.includes('/refresh')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return $api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await axios.post(`${API_URL}/api/authentication/refresh`, {
                    refreshToken: refreshToken
                });

                if (response.data.accessToken) {
                    localStorage.setItem('accessToken', response.data.accessToken);
                    if (response.data.refreshToken) {
                        localStorage.setItem('refreshToken', response.data.refreshToken);
                    }

                    processQueue(null, response.data.accessToken);
                    originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                    return $api(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default $api;