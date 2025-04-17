import axios from "axios";
import { getToken } from "./AuthSession";

const apiClient = axios.create({
    baseURL: "http://localhost:8080",
    headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;