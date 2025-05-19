// context/CampeonatoContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const CampeonatoContext = createContext();

export const CampeonatoProvider = ({ children }) => {
  const [campeonatoEnCurso, setCampeonatoEnCurso] = useState(null);
  const [campeonatoEnTransaccion, setCampeonatoEnTransaccion] = useState(null);

  const fetchCampeonatos = async () => {
        try {
          const [curso, transaccion] = await Promise.all([
            axios.get(`${API_BASE_URL}/campeonatos/obtenerCampeonatosEnCurso/EnCurso`),
            axios.get(`${API_BASE_URL}/campeonatos/obtenerCampeonatosEnTransaccion/EnTransaccion`),
          ]);
          setCampeonatoEnCurso(curso.data || null);
          setCampeonatoEnTransaccion(transaccion.data || null);
        } catch (err) {
          console.error("Error al obtener campeonatos:", err);
        }
      };

  useEffect(() => {
    fetchCampeonatos();
  }, []);

  return (
    <CampeonatoContext.Provider value={{ campeonatoEnCurso, campeonatoEnTransaccion, fetchCampeonatos }}>
      {children}
    </CampeonatoContext.Provider>

  );
};

export const useCampeonato = () => useContext(CampeonatoContext);
