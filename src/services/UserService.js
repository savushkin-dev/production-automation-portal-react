import $api, {API_URL} from "../http";

export default class UserService {

    static async getAllUsers() {
        return $api.get(`${API_URL}/api/user`)
    }

    static async updateUserRoles(userId, roles) {
        return $api.put(`${API_URL}/api/admin/users/${userId}/roles`, { roles });
    }

    static async getAvailableRoles() {
        return $api.get(`${API_URL}/api/admin/roles`);
    }

    static async deleteUser(userId) {
        return $api.delete(`${API_URL}/api/admin/users/${userId}`);
    }

    static async createUser(userData) {
        return $api.post(`${API_URL}/api/admin/users`, userData);
    }

}