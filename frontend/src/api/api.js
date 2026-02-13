import axios from "axios";

const API = axios.create({
  baseURL: "/api", // ✅ important (proxy will forward to backend)
});



// ✅ Attach token on every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Optional: handle 401 globally (avoid random “Session expired” spam)
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // token invalid/expired OR missing
      // you can redirect to login if you want:
      // window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default API;
