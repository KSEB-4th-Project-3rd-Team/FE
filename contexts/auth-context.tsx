"use client"

import { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';
import { User } from '@/app/(main)/layout';
import { login as apiLogin, signup as apiSignup, checkSession as apiCheckSession, logout as apiLogout } from '@/lib/api';
import { useApi } from '@/hooks/use-api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (userData: { username: string; password: string; fullName: string; email: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 토큰이 있을 때만 세션 체크
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (!token) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        const response = await apiCheckSession();
        if (response.user) {
          setUser(response.user);
        }
      } catch (error) {
        console.log("No active session found");
        setUser(null);
        // 토큰이 유효하지 않으면 삭제
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
        }
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiLogin(username, password);
      setUser(response.user);
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
    }
  };

  const signup = async (userData: { username: string; password: string; fullName: string; email: string }) => {
    try {
      await apiSignup(userData);
    } catch (error: any) {
      console.error("Signup failed:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage = error.response?.data?.message || "회원가입에 실패했습니다. 입력된 정보를 확인해주세요.";
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
