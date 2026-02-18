import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { authApi } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (updates: { name: string; email: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ resetUrl?: string }>;
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
    const bootstrapSession = async () => {
      const token = localStorage.getItem('trellcord_token');

      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      try {
        const response = await authApi.me();
        dispatch({ type: 'SET_USER', payload: response.user });
      } catch (error) {
        localStorage.removeItem('trellcord_token');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    bootstrapSession();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await authApi.login(email, password);
      localStorage.setItem('trellcord_token', response.token);
      dispatch({ type: 'SET_USER', payload: response.user });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await authApi.register(name, email, password);
      localStorage.setItem('trellcord_token', response.token);
      dispatch({ type: 'SET_USER', payload: response.user });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('trellcord_token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (updates: { name: string; email: string }): Promise<void> => {
    try {
      const response = await authApi.updateMe(updates);
      dispatch({ type: 'SET_USER', payload: response.user });
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    await authApi.changePassword(currentPassword, newPassword);
  };

  const requestPasswordReset = async (email: string): Promise<{ resetUrl?: string }> => {
    const response = await authApi.requestPasswordReset(email);
    return { resetUrl: response.resetUrl };
  };

  const validateResetToken = async (token: string): Promise<void> => {
    await authApi.validateResetToken(token);
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    await authApi.resetPassword(token, newPassword);
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
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
