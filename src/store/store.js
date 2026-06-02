import {makeAutoObservable} from "mobx";
import AuthService from "../services/AuthService";

export default class Store {

    user = {
        username: "",
        userRoles: []
    };
    isAuth = false;
    isAuthInProgress = false;
    solverSessionId = null;

    constructor() {
        makeAutoObservable(this);
        this.restoreSession();

        // Проверяем авторизацию при загрузке
        const token = localStorage.getItem('accessToken');
        if (token) {
            this.checkAuth();
        }
    }

    restoreSession() {
        const saved = sessionStorage.getItem('solverSessionId');
        if (saved) {
            this.solverSessionId = saved;
        } else {
            this.createSession();
        }
    }

    async createSession() {
        try {
            const sessionId = `id_${Date.now()}`;
            this.solverSessionId = sessionId;
            sessionStorage.setItem('solverSessionId', sessionId);
            return sessionId;
        } catch (error) {
            console.error("Ошибка создания сессии:", error);
            return null;
        }
    }

    clearSession() {
        this.solverSessionId = null;
        sessionStorage.removeItem('solverSessionId');
    }

    setAuth(bool) {
        this.isAuth = bool;
    }

    setUser(user) {
        this.user = user;
        this.user.userRoles = user.roles || [];
    }

    async login(username, password) {
        this.isAuthInProgress = true;
        try {
            const response = await AuthService.login(username, password);
            await this.checkAuth(); // Загружаем данные пользователя
            return response;
        } catch (e) {
            console.error('Login error:', e);
            throw e;
        } finally {
            this.isAuthInProgress = false;
        }
    }

    async logout() {
        try {
            await AuthService.logout();
        } catch (e) {
            console.log(e.response?.data?.message);
        } finally {
            this.setAuth(false);
            this.setUser({});
        }
    }

    async checkAuth() {
        this.isAuthInProgress = true;
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                this.setAuth(false);
                return;
            }

            // Декодируем токен для получения информации о пользователе
            const decoded = AuthService.decodeToken(token);
            if (decoded && decoded.username) {
                this.user.username = decoded.username;
                this.user.userRoles = decoded.roles || [];
                this.setAuth(true);
            } else {
                this.setAuth(false);
            }
        } catch (e) {
            console.error('Check auth error:', e);
            this.setAuth(false);
        } finally {
            this.isAuthInProgress = false;
        }
    }

    hasRole(requiredRoles) {
        if (!requiredRoles || requiredRoles.length === 0) return true;
        return requiredRoles.some(role => this.user.userRoles.includes(role));
    }

    hasAnyRole(requiredRoles) {
        return this.hasRole(requiredRoles);
    }

    hasAllRoles(requiredRoles) {
        if (!requiredRoles || requiredRoles.length === 0) return true;
        return requiredRoles.every(role => this.user.userRoles.includes(role));
    }
}