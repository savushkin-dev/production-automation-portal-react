import axios from "axios";

// export const API_URL = 'http://localhost:7474'
// export const API_URL = 'http://10.1.232.29:7474'
// export const API_URL = 'http://10.30.0.5:7474'
// export const API_URL = 'http://10.170.30.87:7474'

export const API_URL = `${process.env.REACT_APP_API_BASE_URL}`

const $api = axios.create({
    withCredentials: true,
    baseURL: API_URL
})


$api.interceptors.request.use((config) => {
    if(localStorage.getItem('tokenAutomationProduction')!==null)
        config.headers.Authorization = `Bearer ${localStorage.getItem('tokenAutomationProduction')}`
    return config;
})

export default $api;