
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// Handle common API errors in one place
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with an error status
      console.error(
        "API Error:",
        error.response.status,
        error.response.data?.message || "Request failed."
      );
    } else if (error.request) {
      // Request was sent, but no response was received
      console.error(
        "Network Error: Unable to connect to the server."
      );
    } else {
      // Request setup failed
      console.error("Request Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default API;
