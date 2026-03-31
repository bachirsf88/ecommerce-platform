import { createContext, useContext, useEffect, useState } from 'react';
import { authApi, TOKEN_KEY } from '../services/api';
import favoriteService from '../services/favoriteService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  const saveAuthData = (data) => {
    const authData = data?.data ?? data;
    const authToken = authData?.token ?? null;
    const authUser = authData?.user ?? null;

    if (authToken) {
      localStorage.setItem(TOKEN_KEY, authToken);
      setToken(authToken);
    }

    favoriteService.clearFavoriteProductIds();
    setUser(authUser);

    return authData;
  };

  const clearAuthData = () => {
    localStorage.removeItem(TOKEN_KEY);
    favoriteService.clearFavoriteProductIds();
    setToken(null);
    setUser(null);
  };

  const fetchUser = async () => {
    try {
      const response = await authApi.fetchUser();
      setUser(response.data ?? null);
      return response.data ?? null;
    } catch (error) {
      clearAuthData();
      throw error;
    }
  };

  const register = async (formData) => {
    const response = await authApi.register(formData);
    return saveAuthData(response);
  };

  const login = async (formData) => {
    const response = await authApi.login(formData);
    return saveAuthData(response);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuthData();
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await fetchUser();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token),
        register,
        login,
        logout,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
