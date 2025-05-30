'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers = [
  {
    id: '1',
    name: 'John Admin',
    email: 'admin@example.com',
    role: 'admin' as Role,
    department: 'Management',
    position: 'HR Manager',
    joinDate: '2023-01-01',
    phone: '',
    country: '',
    state: '',
    city: '',
    address: '',
    idType: undefined,
    frontImage: null,
    backImage: null,
  },
  {
    id: '2',
    name: 'Jane Employee',
    email: 'employee@example.com',
    role: 'employee' as Role,
    department: 'Engineering',
    position: 'Software Engineer',
    joinDate: '2023-02-01',
    phone: '',
    country: '',
    state: '',
    city: '',
    address: '',
    idType: undefined,
    frontImage: null,
    backImage: null,
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const mockUser = mockUsers.find(u => u.email === email);
    if (!mockUser) {
      throw new Error('Invalid credentials');
    }
    localStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};