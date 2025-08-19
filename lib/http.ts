// lib/http.ts
import axios from "axios";

const baseURL = 
  process.env.NEXT_PUBLIC_API_BASE ?? 
  "https://smart-wms-be.p-e.kr";

export const http = axios.create({
  baseURL,
  withCredentials: true,  // 쿠키 기반 인증을 위해 필수
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - localStorage 토큰 체크 제거
http.interceptors.request.use((config) => {
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
    
    if (status === 401 || status === 500) {
      // 인증 실패시 로그인 페이지로 리다이렉트 (window.location 사용 안 함)
      if (typeof window !== "undefined") {
        // 현재 페이지가 로그인 페이지가 아닐 때만 리다이렉트
        if (!window.location.pathname.includes('/login')) {
          window.location.replace('/login');
        }
      }
    } else if (status === 403) {
    } else if (status >= 500) {
      // Retry 5xx errors once
      const config = error.config;
      if (!config._retry) {
        config._retry = true;
        try {
          return await http.request(config);
        } catch (retryError) {
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default http;