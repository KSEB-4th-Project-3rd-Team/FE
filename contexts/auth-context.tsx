"use client"

import { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';
import { User } from '@/app/(main)/layout';
import { login as apiLogin, signup as apiSignup, checkSession as apiCheckSession, logout as apiLogout } from '@/lib/api';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 쿠키 기반 인증이므로 localStorage 체크 제거
        const response = await apiCheckSession();
        if (response.user) {
          setUser(response.user);
        }
      } catch (error) {
        console.log("No active session found");
        setUser(null);
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
      // 로그인 성공 시 대시보드로 이동
      router.push('/dashboard');
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
      // 로그아웃 시 로그인 페이지로 이동
      router.push('/login');
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