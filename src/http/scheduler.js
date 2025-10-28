import axios from "axios";

// export const API_URL_SCHEDULER = 'http://localhost:8081'
// export const API_URL_SCHEDULER = 'http://10.30.0.5:8080'

export const API_URL_SCHEDULER = `${process.env.REACT_APP_API_SCHEDULER_URL}`

const $apiSchedule = axios.create({
    withCredentials: true,
    baseURL: API_URL_SCHEDULER
})

$apiSchedule.interceptors.request.use((config) => {
    // if(sessionStorage.getItem('tokenAutomationProduction')!==null)
    //     config.headers.Authorization = `Bearer ${sessionStorage.getItem('tokenAutomationProduction')}`
    return config;
})

export default $apiSchedule;