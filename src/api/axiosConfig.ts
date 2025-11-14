import axios from "axios";

const API_BASE_URL = "http://192.168.29.13:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const apiKey = localStorage.getItem("x-api-key");
    if (apiKey) {
      config.headers["x-api-key"] = apiKey;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
export { API_BASE_URL };
