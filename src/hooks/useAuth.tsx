
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiService } from '@/services/api';

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = ApiService.getToken();
    if (token) {
      // Verify token and get user info
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await ApiService.login(email, password);
    ApiService.setToken(response.token);
    setUser(response.user);
  };

  const register = async (email: string, password: string, fullName: string) => {
    const response = await ApiService.register(email, password, fullName);
    ApiService.setToken(response.token);
    setUser(response.user);
  };

  const logout = () => {
    ApiService.clearToken();
    ApiService.disconnectWebSocket();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
