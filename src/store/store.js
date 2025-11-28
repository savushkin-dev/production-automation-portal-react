import {makeAutoObservable} from "mobx";
import AuthService from "../services/AuthService";

export default class Store {

    user = {
        username: "",
        userRoles: []
    } ;
    isAuth = false;
    isAuthInProgress = false;

    solverSessionId = null;

    constructor() {
        makeAutoObservable(this)
        this.restoreSession();
    }

    // Восстановление сессии
    restoreSession() {
        const saved = sessionStorage.getItem('solverSessionId');
        if (saved) {
            this.solverSessionId = saved;
        } else {
            this.createSession();
        }
    }

    // Создание новой сессии
    async createSession() {
        try {
            const sessionId = `id_${Date.now()}`;
            this.solverSessionId = sessionId;
            sessionStorage.setItem('solverSessionId', sessionId);
            return sessionId;
        } catch (error) {
            console.error("Ошибка получения IP:", error);
            return null;
        }
    }

    // Очистка сессии
    clearSession() {
        this.solverSessionId = null;
        sessionStorage.removeItem('solverSessionId');
    }

    setAuth(bool){
        this.isAuth = bool;
    }

    setUser(user){
        this.user = user;
        this.userRoles = user.roles || [];
    }

    async login(username, password){
        this.isAuthInProgress = true;
        try {
            localStorage.removeItem('tokenAutomationProduction');
            const response = await AuthService.login(username,password);
            localStorage.setItem('tokenAutomationProduction', response.data.uuid);
            await this.checkAuth()
        } catch (e){
            throw e;
        } finally {
            this.isAuthInProgress = false;
        }
    }

    async logout(){
        try {
            // const response = await AuthService.logout(); //не реализовано на сервере
            localStorage.removeItem('tokenAutomationProduction');
            this.setAuth(false);
            this.setUser({});
        } catch (e){
            console.log(e.response?.data?.message)
        }
    }

    async checkAuth(){
        this.isAuthInProgress = true;
        try {
            const response = await AuthService.getAuthorizedUserData();
            // console.log(response)
            this.setAuth(true);
            const token = AuthService.decodeToken(localStorage.getItem("tokenAutomationProduction"));
            this.user.username = token?.username || "";
            this.user.userRoles = token?.roles || [];
            // console.log( this.user.userRoles)
        } catch (e){
            console.log(e.response?.data?.message)
        } finally {
            this.isAuthInProgress = false;
        }
    }

    async updateAuth(){
        try {
            const response = await AuthService.getAuthorizedUserData(); //временно, после доделать запрос на refresh и валидность токена
            // console.log(response)
            this.setAuth(true);
            this.setUser(response.data);
        } catch (e){
            console.log(e.response?.data?.message)
        }
    }

    // метод проверки ролей
    hasRole(requiredRoles) {
        if (!requiredRoles || requiredRoles.length === 0) return true;
        return requiredRoles.some(role => this.user.userRoles.includes(role));
    }

    // метод проверки любой из ролей
    hasAnyRole(requiredRoles) {
        return this.hasRole(requiredRoles);
    }

    // метод проверки всех ролей
    hasAllRoles(requiredRoles) {
        if (!requiredRoles || requiredRoles.length === 0) return true;
        return requiredRoles.every(role => this.user.userRoles.includes(role));
    }

}