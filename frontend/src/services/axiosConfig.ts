import axios from "axios";
import {clearToken, getToken} from "./AuthSession";

const apiClient = axios.create({
    baseURL: "http://localhost:8080",
    headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
    let token = getToken();
    if (!token) return config;
    token = token.replace(/^Bearer\s+/i, "").trim();

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;