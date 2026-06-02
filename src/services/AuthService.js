import $api, {API_URL} from "../http";

export default class AuthService {

    static async login(username, password) {
        const response = await $api.post(`${API_URL}/api/authentication/authenticate`, {username, password});

        if (response.data.accessToken && response.data.refreshToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
        } else {
            console.error('No tokens in response!', response.data);
        }

        return response;
    }

    // Обновление токенов
    static async refreshToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token');
        }

        const response = await $api.post(`${API_URL}/api/authentication/refresh`, {
            refreshToken: refreshToken
        });

        // Обновляем токены
        if (response.data.accessToken && response.data.refreshToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
        }

        return response;
    }

    static async logout() {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                await $api.post(`${API_URL}/api/authentication/logout`, {}, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
            }
        } finally {
            // Всегда удаляем токены
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    }

    // Получение данных пользователя
    static async getAuthorizedUserData() {
        return $api.get(`${API_URL}/api/user/profile`);
    }

    // Декодирование токена
    static decodeToken(token) {
        try {
            if (!token) return null;
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload));
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    // Получение ролей из текущего токена
    static getUserRoles() {
        const token = localStorage.getItem('accessToken');
        if (!token) return [];
        const decoded = this.decodeToken(token);
        return decoded?.roles || [];
    }
}