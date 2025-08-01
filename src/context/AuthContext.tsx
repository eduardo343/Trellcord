import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  validateResetToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for stored authentication token
    const token = localStorage.getItem('trellcord_token');
    if (token) {
      // In a real app, validate token with backend
      // For now, we'll simulate a logged-in user
      setTimeout(() => {
        const mockUser: User = {
          id: '1',
          name: 'Alan Ugarte',
          email: 'alansaucedo.dev@example.com',
          avatar: '',
          isOnline: true,
        };
        dispatch({ type: 'SET_USER', payload: mockUser });
      }, 1000);
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      const mockUser: User = {
        id: '1',
        name: 'Alan Ugarte',
        email,
        avatar: '',
        isOnline: true,
      };
      
      localStorage.setItem('trellcord_token', 'mock_token');
      dispatch({ type: 'SET_USER', payload: mockUser });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful registration
      const mockUser: User = {
        id: '1',
        name,
        email,
        avatar: '',
        isOnline: true,
      };
      
      localStorage.setItem('trellcord_token', 'mock_token');
      dispatch({ type: 'SET_USER', payload: mockUser });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('trellcord_token');
    dispatch({ type: 'LOGOUT' });
  };

  const requestPasswordReset = async (email: string): Promise<void> => {
    try {
      // Simulate API call to request password reset
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // En una aplicación real, aquí harías una llamada al backend
      // que enviaría un email con el token de reset
      console.log(`Password reset requested for: ${email}`);
      
      // Simular éxito
      return Promise.resolve();
    } catch (error) {
      throw new Error('Error requesting password reset');
    }
  };

  const validateResetToken = async (token: string): Promise<void> => {
    try {
      // Simulate API call to validate reset token
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // En una aplicación real, validarías el token con el backend
      // Por ahora, simulamos que cualquier token que empiece con 'valid' es válido
      if (!token || !token.startsWith('valid')) {
        throw new Error('Invalid token');
      }
      
      return Promise.resolve();
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      // Simulate API call to reset password
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // En una aplicación real, aquí actualizarías la contraseña en el backend
      console.log(`Password reset for token: ${token}`);
      
      // Simular éxito
      return Promise.resolve();
    } catch (error) {
      throw new Error('Error resetting password');
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    register,
    requestPasswordReset,
    resetPassword,
    validateResetToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
