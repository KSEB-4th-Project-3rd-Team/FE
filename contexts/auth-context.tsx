"use client"

import { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';
import { User } from '@/app/(main)/layout';
import { login as apiLogin } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    // For now, we'll use a mock login until the real API is ready
    const mockUser: User = { id: "1", username, fullName: "Test User", role: "Admin" };
    localStorage.setItem("user", JSON.stringify(mockUser));
    setUser(mockUser);
    
    // Real API call (can be enabled later)
    /*
    try {
      const loggedInUser = await apiLogin(username, password);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
    */
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
