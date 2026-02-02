import axios from "axios";

export const API_URL_SCHEDULER = `${process.env.REACT_APP_API_SCHEDULER_URL}`

const $apiSchedule = axios.create({
    withCredentials: true,
    baseURL: API_URL_SCHEDULER
})

$apiSchedule.interceptors.request.use((config) => {
    config.headers['X-Session-Id'] = sessionStorage.getItem('solverSessionId');
    return config;
})

export default $apiSchedule;