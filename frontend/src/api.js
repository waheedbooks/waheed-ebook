import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function isLoginAttempt(url = "") {
  return url.startsWith("/auth/login") || url.startsWith("/auth/verify-login-pin");
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !isLoginAttempt(err.config?.url)) {
      const hadToken = !!localStorage.getItem("token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (hadToken) {
        const data = err.response.data || {};
        window.dispatchEvent(
          new CustomEvent("auth:session-ended", {
            detail: { message: data.sessionExpired ? data.message : "" },
          })
        );
      }
    }
    return Promise.reject(err);
  }
);

export default api;
