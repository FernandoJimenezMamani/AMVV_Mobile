import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode'; // Cambio en la importación de jwtDecode

const SessionContext = createContext();

export const useSession = () => {
  return useContext(SessionContext);
};

export const SessionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [tokenData, setTokenData] = useState(null); 

  useEffect(() => {
    // Función para cargar el token y el usuario de AsyncStorage al iniciar la app
    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          try {
            const decoded = jwtDecode(storedToken);
            setTokenData(decoded);
            console.log('Token decodificado:', decoded);
          } catch (error) {
            console.error('Error al decodificar el token:', error);
          }
        }
      } catch (error) {
        console.error('Error al cargar la sesión:', error);
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

      // Guardar token y datos de usuario en AsyncStorage
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
    
    // Eliminar datos de AsyncStorage
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error al eliminar la sesión:', error);
    }
  };

  return (
    <SessionContext.Provider value={{ user, token, tokenData, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
};
