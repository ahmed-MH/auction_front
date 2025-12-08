import axios from "axios";
import API_BASE_URL from "../config";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// ✅ Intercepteur pour ajouter le token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token") || localStorage.getItem("jwtToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Intercepteur pour gérer les erreurs (ex: 401 expiration)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Optionnel : Rediriger vers login ou nettoyer le storage
            // localStorage.removeItem("token");
            // localStorage.removeItem("user");
            // if (window.location.pathname !== "/auth") {
            //    window.location.href = "/auth";
            // }
            console.warn("Session expirée ou non autorisée.", error.response.data);
        }
        return Promise.reject(error);
    }
);

export default api;
