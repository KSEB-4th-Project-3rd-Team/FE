// lib/http.ts
import axios from "axios";

const baseURL = 
  process.env.NEXT_PUBLIC_API_BASE ?? 
  "https://smart-wms-be.p-e.kr";

export const http = axios.create({
  baseURL,
  withCredentials: false,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to include auth token and prevent caching
http.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add timestamp to prevent caching
  if (config.params) {
    config.params._t = Date.now();
  } else {
    config.params = { _t: Date.now() };
  }
  
  return config;
});

// Response interceptor for error handling and retry logic
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    
    if (status === 401) {
      // Clear token and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      }
    } else if (status === 403) {
      console.error("Forbidden: You don't have permission to access this resource");
    } else if (status >= 500) {
      // Retry 5xx errors once
      const config = error.config;
      if (!config._retry) {
        config._retry = true;
        try {
          return await http.request(config);
        } catch (retryError) {
          console.error("Retry failed:", retryError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default http;