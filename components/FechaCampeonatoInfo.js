import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import { useSession } from '../context/SessionProvider';
import rolMapping from '../constants/roles';
import logger from '../utils/logger';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const WEBSOCKET_URL = process.env.EXPO_PUBLIC_WEBSOCKET_URL;

const sumarHoras = (fecha, horas) => {
  const nuevaFecha = new Date(fecha);
  nuevaFecha.setHours(nuevaFecha.getHours() + horas);
  return nuevaFecha;
};

const FechaCampeonatoInfo = () => {
  const [campeonato, setCampeonato] = useState(null);
  const { user } = useSession();
  const socketRef = useRef(null);

  const fetchCampeonato = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/campeonatos/obtenerCampeonatoActivo/activo`);
      setCampeonato(response.data);
    } catch (error) {
      setCampeonato(null);
    }
  };

  useEffect(() => {
    fetchCampeonato();

    // Establecer WebSocket
    socketRef.current = new WebSocket(WEBSOCKET_URL);

    socketRef.current.onopen = () => {
      logger.log('WebSocket conectado');
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'estado_campeonato_actualizado') {
          fetchCampeonato(); // Refrescar los datos
        }
      } catch (err) {
       logger.log('Error procesando el mensaje del WebSocket:', err);
      }
    };

    socketRef.current.onerror = (err) => {
      logger.log('Error en WebSocket', err);
    };

    socketRef.current.onclose = () => {
      logger.log('WebSocket cerrado');
    };

    return () => {
      socketRef.current?.close();
    };
  }, []);

  const mostrarInfo = () => {
    if (!user?.rol?.nombre) return false;
    return ![rolMapping.PresidenteAsociacion, rolMapping.Tesorero].includes(user.rol.nombre);
  };

  const getTextoFecha = (campeonato) => {
    const ahora = new Date();
    ahora.setHours(ahora.getHours() - 4);
  
    const inicioTrans = new Date(campeonato.fecha_inicio_transaccion);
    const finTrans = new Date(campeonato.fecha_fin_transaccion);
    const inicioCamp = new Date(campeonato.fecha_inicio_campeonato);
    const finCamp = new Date(campeonato.fecha_fin_campeonato);
  
    if (ahora < inicioTrans) {
      return `La etapa de transacción inicia el ${inicioTrans.toLocaleDateString("es-ES", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
    } else if (ahora >= inicioTrans && ahora < finTrans) {
      return `La etapa de transacción finaliza el ${finTrans.toLocaleDateString("es-ES", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
    } else if (ahora >= finTrans && ahora < inicioCamp) {
      return `El campeonato inicia el ${inicioCamp.toLocaleDateString("es-ES", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
    } else if (ahora >= inicioCamp && ahora < finCamp) {
      return `El campeonato finaliza el ${finCamp.toLocaleDateString("es-ES", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
    }
  
    return null;
  };
  
  
  if (!campeonato || !mostrarInfo()) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{campeonato.nombre}</Text>
      <Text style={styles.subtitle}>{getTextoFecha(campeonato)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EAF5F7',
    padding: 12,
    margin: -10,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,

  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#143E42',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#3D8FA4',
    textAlign: 'center'
  }
});

export default FechaCampeonatoInfo;
