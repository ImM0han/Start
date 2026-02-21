import axios from "axios";

const API = axios.create({
  baseURL: "/api",
});

// ✅ Attach token ONLY for protected routes
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const url = config.url || "";

    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/send-otp") ||
      url.includes("/auth/register") ||
      url.includes("/auth/forgot") ||
      url.includes("/auth/reset");

    if (token && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Optional: handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // token invalid/expired
      // window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default API;