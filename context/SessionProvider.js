import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { View, ActivityIndicator } from 'react-native';
import axios from 'axios';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
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
            await logout(); // ✅ Limpiar si está corrupto
          }
        } else {
          console.log('No se encontró sesión en AsyncStorage');
        }
      } catch (error) {
        console.log('Error al cargar la sesión:', error);
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
      console.log('Error en el login o al decodificar el token:', error);
    }
  };

  const logout = async () => {
    try {
            // 3. Intentar eliminar el token push (operación que puede fallar)
            const storedToken = token; // Usamos el token en memoria antes de limpiarlo
            if (storedToken) {
              axios.delete(`${API_BASE_URL}/notification/delete-push-token`, {
                headers: {
                  'Authorization': `Bearer ${storedToken}`
                },
                timeout: 3000 // Timeout corto para no bloquear
              }).catch(error => {
                console.log('Error al eliminar token push (no crítico):', error);
              });
            }
      // 1. Limpiar estados primero para que la UI responda inmediatamente
      setUser(null);
      setToken(null);
      setTokenData(null);
      setActiveRole(null);
      setIsLoggedIn(false);
  
      // 2. Limpiar AsyncStorage (operación rápida)
      await AsyncStorage.multiRemove(['token', 'user', 'activeRole']);
  
      return true;
    } catch (error) {
      console.log('Error en logout:', error);
      return false;
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