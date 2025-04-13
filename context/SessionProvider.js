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
  const [activeRole, setActiveRole] = useState(null); // Estado para el rol activo
  const [isLoading, setIsLoading] = useState(true);
  // Cargar la sesión al iniciar
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        const storedRole = await AsyncStorage.getItem('activeRole'); // Cargar el rol activo

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          try {
            const decoded = jwtDecode(storedToken);
            setTokenData(decoded);
            console.log('Token decodificado:', decoded);

            // Si hay un rol almacenado, establecerlo como activo
            if (storedRole) {
              setActiveRole(JSON.parse(storedRole));
            }
          } catch (error) {
            console.error('Error al decodificar el token:', error);
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

  // Función para iniciar sesión
  const login = async (userData) => {
    const { token } = userData;

    try {
      const decoded = jwtDecode(token);
      setToken(token);
      setUser(decoded);
      setTokenData(decoded);
      // Guardar token y datos de usuario en AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(decoded));
    } catch (error) {
      console.error('Error en el login o al decodificar el token:', error);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    setUser(null);
    setToken(null);
    setTokenData(null);
    setActiveRole(null); // Limpiar el rol activo
    // Eliminar datos de AsyncStorage
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('activeRole'); // Eliminar el rol activo
    } catch (error) {
      console.error('Error al eliminar la sesión:', error);
    }
  };

  // Función para actualizar el rol activo
  const updateRole = async (role) => {
    setActiveRole(role);
    await AsyncStorage.setItem('activeRole', JSON.stringify(role)); // Guardar el rol en AsyncStorage
  };

  if (isLoading) {
    return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator size="large" />
    </View>;
  }
  return (
    <SessionContext.Provider
      value={{ user, token, tokenData, activeRole, login, logout, updateRole }}
    >
      {children}
    </SessionContext.Provider>
  );
};