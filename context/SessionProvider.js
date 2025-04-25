import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { View, ActivityIndicator } from 'react-native';

const SessionContext = createContext();

export const useSession = () => {
  return useContext(SessionContext);
};

export const SessionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        const storedRole = await AsyncStorage.getItem('activeRole');

        if (storedToken && storedUser) {
          try {
            const decoded = jwtDecode(storedToken);

            // ✅ Verificación de expiración opcional
            if (decoded.exp && decoded.exp * 1000 < Date.now()) {
              console.log("Token expirado");
              await logout();
              return;
            }

            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setTokenData(decoded);
            setIsLoggedIn(true); // ✅ Setear como logueado

            if (storedRole) {
              setActiveRole(JSON.parse(storedRole));
            }

            console.log('Token decodificado:', decoded);
          } catch (error) {
            console.error('Error al decodificar el token:', error);
            await logout(); // ✅ Limpiar si está corrupto
          }
        } else {
          console.log('No se encontró sesión en AsyncStorage');
        }
      } catch (error) {
        console.error('Error al cargar la sesión:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (userData) => {
    const { token } = userData;

    try {
      const decoded = jwtDecode(token);
      setToken(token);
      setUser(decoded);
      setTokenData(decoded);
      setIsLoggedIn(true); // ✅ Setear logueo activo
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(decoded));
    } catch (error) {
      console.error('Error en el login o al decodificar el token:', error);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setTokenData(null);
    setActiveRole(null);
    setIsLoggedIn(false); // ✅ Resetear estado

    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('activeRole');
    } catch (error) {
      console.error('Error al eliminar la sesión:', error);
    }
  };

  const updateRole = async (role) => {
    setActiveRole(role);
    await AsyncStorage.setItem('activeRole', JSON.stringify(role));
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SessionContext.Provider
      value={{
        user,
        token,
        tokenData,
        activeRole,
        isLoggedIn, // ✅ Agregado aquí
        login,
        logout,
        updateRole,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};