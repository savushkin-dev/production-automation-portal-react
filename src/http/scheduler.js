import axios from "axios";
import AuthService from "../services/AuthService";

export const API_URL_SCHEDULER = `${process.env.REACT_APP_API_SCHEDULER_URL}`

const $apiSchedule = axios.create({
    withCredentials: true,
    baseURL: API_URL_SCHEDULER
})

$apiSchedule.interceptors.request.use((config) => {
    config.headers['X-Session-Id'] = sessionStorage.getItem('solverSessionId');

    //Извлекаем username из токена если есть
    const token = localStorage.getItem('tokenAutomationProduction');
    if (token) {
        const decoded = AuthService.decodeToken(token);
        if (decoded?.username) {
            config.headers['X-Username'] = decoded.username;
        }
    }

    return config;
})

export default $apiSchedule;