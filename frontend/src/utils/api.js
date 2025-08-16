import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // or just "/api" if you use package.json proxy
});

// attach JWT if present
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("user");
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
