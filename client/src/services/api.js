
import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",
  withCredentials: true,
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        "API Error:",
        error.response.status,
        error.response.data?.message || "Request failed."
      );
    } else if (error.request) {
      console.error(
        "Network Error: Unable to connect to the server."
      );
    } else {
      console.error("Request Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default API;
