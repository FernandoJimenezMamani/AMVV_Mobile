import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import styles from '../../../styles/index_tabla';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const TablaSolicitudesJugador = ({ campeonatoId, estadoFiltro }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/traspaso/presidente_por_jugador/${campeonatoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data.filter(s => s.tipo_solicitud === 'Jugador');
        setSolicitudes(data);
      } catch (error) {
        Alert.alert('Error', 'Error al obtener solicitudes tipo jugador');
        console.error('Error al obtener solicitudes tipo jugador:', error);
      }
    };

    if (campeonatoId) fetchSolicitudes();
  }, [campeonatoId]);

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <MaterialIcons name="pending" size={20} color="orange" />
            <Text>Pendiente</Text>
          </View>
        );
      case 'APROBADO':
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <MaterialIcons name="check-circle" size={20} color="green" />
            <Text>Aprobado</Text>
          </View>
        );
      case 'RECHAZADO':
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <MaterialIcons name="cancel" size={20} color="red" />
            <Text>Rechazado</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const getImagenPerfil = (img, genero) => {
    if (img) return { uri: img };
    return genero === 'V' 
      ? require('../../../assets/img/Default_Imagen_Men.webp')
      : require('../../../assets/img/Default_Imagen_Women.webp');
  };

  const filteredSolicitudes = solicitudes.filter(s => {
    return estadoFiltro === 'TODOS' || s.estado_club_origen === estadoFiltro;
  });

  return (
    <ScrollView style={styles.container}>
      {filteredSolicitudes.length > 0 ? (
        filteredSolicitudes.map(s => (
          <View key={s.traspaso_id} style={styles.clubContainer}>
            {/* Jugador Solicitante */}
            <View style={styles.playerInfoContainer}>
              <Image
                source={getImagenPerfil(s.imagen_jugador, s.genero_persona)}
                style={styles.smallImage}
              />
              <Text style={styles.playerName}>
                {s.nombre_jugador} {s.apellido_jugador}
              </Text>
            </View>

            {/* Club Solicitado */}
            <View style={styles.playerInfoContainer}>
              <Image
                source={{ uri: s.club_imagen }}
                style={styles.smallImage}
              />
              <Text style={styles.clubName}>{s.club_destino_nombre}</Text>
            </View>

            {/* Fecha de Solicitud */}
            <Text style={styles.clubDescription}>
              {new Date(s.fecha_solicitud).toLocaleDateString('es-ES')}
            </Text>

            {/* Tu Respuesta */}
            <View style={styles.statusContainer}>
              {getStatusIcon(s.estado_club_receptor)}
            </View>

            {/* Acción */}
            <TouchableOpacity 
              onPress={() => router.push(`/traspasos/detallePresidente/${s.traspaso_id}`)}
              style={styles.actionButton}
            >
              <MaterialIcons name="remove-red-eye" size={24} color="black" />
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={styles.noResultsText}>No hay solicitudes disponibles</Text>
      )}
    </ScrollView>
  );
};

export default TablaSolicitudesJugador;