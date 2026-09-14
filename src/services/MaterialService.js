import $api from "../http";
import { API_URL_SCHEDULER } from "../http/scheduler";

export default class MaterialService {

    static PATH_IMPORT_FOLDER = "C:/Users/punko/Desktop/test/";

    static searchRecipients(query) {
        return $api.get(`${API_URL_SCHEDULER}/api/material/recipients/search`, {
            params: { query: query }
        });
    }

    static loadProducts(date, kpp) {
        return $api.get(`${API_URL_SCHEDULER}/api/material/load`, {
            params: { date, kpp }
        });
    }

    static recalcKolf(request) {
        return $api.post(`${API_URL_SCHEDULER}/api/material/recalc`, request);
    }

    static saveAll(request) {
        return $api.post(`${API_URL_SCHEDULER}/api/material/save`, request);
    }

    // Старые методы (по пути) - оставляем для обратной совместимости
    static importSprogByPath() {
        return $api.post(`${API_URL_SCHEDULER}/api/dbf/import/sprog/path`, {}, {
            params: { path: this.PATH_IMPORT_FOLDER + "BD_SPROG.DBF" }
        });
    }

    static importRnppByPath() {
        return $api.post(`${API_URL_SCHEDULER}/api/dbf/import/rnpp/path`, {}, {
            params: { path: this.PATH_IMPORT_FOLDER + "BD_RNPP.DBF" }
        });
    }

    static importPpByPath() {
        return $api.post(`${API_URL_SCHEDULER}/api/dbf/import/pp/path`, {}, {
            params: { path: this.PATH_IMPORT_FOLDER + "NS_PP.DBF" }
        });
    }

    static importMtByPath() {
        return $api.post(`${API_URL_SCHEDULER}/api/dbf/import/mt/path`, {}, {
            params: { path: this.PATH_IMPORT_FOLDER + "NS_MT.DBF" }
        });
    }

    // НОВЫЕ МЕТОДЫ - загрузка файлов через multipart/form-data
    static importSprogFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        return $api.post(`${API_URL_SCHEDULER}/api/dbf/import/sprog`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    static importRnppFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        return $api.post(`${API_URL_SCHEDULER}/api/dbf/import/rnpp`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    static importPpFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        return $api.post(`${API_URL_SCHEDULER}/api/dbf/import/pp`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    static importMtFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        return $api.post(`${API_URL_SCHEDULER}/api/dbf/import/mt`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    static getMaterialsSettings(date, kpp) {
        return $api.get(`${API_URL_SCHEDULER}/api/material/settings`, {
            params: { date }
        });
    }

    static saveMaterialsSettings(settings) {
        return $api.put(`${API_URL_SCHEDULER}/api/material/settings`, settings);
    }
}