import $api from "../http";
import { API_URL_SCHEDULER } from "../http/scheduler";

export default class MaterialService {

    static PATH_IMPORT_FOLDER = "C:/Users/punko/Desktop/test/";

    static searchRecipients(query) {
        return $api.get(`${API_URL_SCHEDULER}/api/material/recipients/search`, {
            params: { query: query }
        });
    }

    static load1CLogs(date, kpp, type) {
        return $api.get(`${API_URL_SCHEDULER}/api/material/log-1c`, {
            params: { date, kpp, type }
        });
    }

    static loadProducts(date, kpp, type) {
        return $api.get(`${API_URL_SCHEDULER}/api/material/load`, {
            params: { date, kpp, type }
        });
    }

    static resetAndLoadProducts(date, kpp, type) {
        return $api.get(`${API_URL_SCHEDULER}/api/material/reset`, {
            params: { date, kpp, type }
        });
    }

    static recalcKolf(request) {
        return $api.post(`${API_URL_SCHEDULER}/api/material/recalc`, request);
    }

    static saveAll(request) {
        return $api.post(`${API_URL_SCHEDULER}/api/material/save`, request);
    }

    static sendTo1C(request) {
        return $api.post(`${API_URL_SCHEDULER}/api/material/send-1c`, request);
    }

    static importSprog() {
        return $api.post(`${API_URL_SCHEDULER}/api/dbf/import/sprog`, {});
    }

    static importRnpp() {
        return $api.post(`${API_URL_SCHEDULER}/api/dbf/import/rnpp`, {});
    }

    static importPp() {
        return $api.post(`${API_URL_SCHEDULER}/api/dbf/import/pp`, {});
    }

    static importMt() {
        return $api.post(`${API_URL_SCHEDULER}/api/dbf/import/mt`, {});
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