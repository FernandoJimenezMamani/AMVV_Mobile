import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import styles from '../../../styles/index_tabla_solicitud';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const TablaSolicitudesPresidente = ({ campeonatoId, estadoFiltro }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/traspaso/presidente/${campeonatoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data.filter(s => s.tipo_solicitud === 'Presidente');
        setSolicitudes(data);
      } catch (error) {
        Alert.alert('Error', 'Error al obtener solicitudes tipo presidente');
        console.error('Error al obtener solicitudes tipo presidente:', error);
      }
    };

    if (campeonatoId) fetchSolicitudes();
  }, [campeonatoId]);

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return (
          <View style={styles.statusRow}>
            <MaterialIcons name="pending" size={20} color="orange" />
            <Text style={styles.statusText}>Pendiente</Text>
          </View>
        );
      case 'APROBADO':
        return (
          <View style={styles.statusRow}>
            <MaterialIcons name="check-circle" size={20} color="green" />
            <Text style={styles.statusText}>Aprobado</Text>
          </View>
        );
      case 'RECHAZADO':
        return (
          <View style={styles.statusRow}>
            <MaterialIcons name="cancel" size={20} color="red" />
            <Text style={styles.statusText}>Rechazado</Text>
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

  const getImagenClub = (clubImagen) => {
    if (clubImagen) return { uri: clubImagen };
    return require('../../../assets/img/Default_Imagen_Club.webp');
  };

  const filteredSolicitudes = solicitudes.filter(s => {
    return estadoFiltro === 'TODOS' || s.estado_club_origen === estadoFiltro;
  });

  return (
    <ScrollView style={styles.container}>
      {filteredSolicitudes.length > 0 ? (
        filteredSolicitudes.map(s => (
          <View key={s.traspaso_id} style={styles.card}>
            {/* Jugador */}
            <View style={styles.row}>
              <Text style={styles.label}>Jugador:</Text>
              <View style={styles.playerInfo}>
                <Image
                  source={getImagenPerfil(s.imagen_jugador, s.genero_persona)}
                  style={styles.image}
                />
                <View>
                  <Text style={styles.playerName}>
                    {s.nombre_jugador} {s.apellido_jugador}
                  </Text>
                  <Text style={styles.playerRole}>Jugador</Text>
                </View>
              </View>
            </View>

            {/* Club Interesado */}
            <View style={styles.row}>
              <Text style={styles.label}>Club destino:</Text>
              <View style={styles.playerInfo}>
                <Image
                  source={getImagenClub(s.club_imagen)}
                  style={styles.image}
                />
                <Text style={styles.clubName}>{s.club_destino_nombre}</Text>
              </View>
            </View>

            {/* Presidente Interesado */}
            <View style={styles.row}>
              <Text style={styles.label}>Presidente:</Text>
              <View style={styles.playerInfo}>
                <Image
                  source={getImagenPerfil(s.imagen_presidente, s.genero)}
                  style={styles.image}
                />
                <View>
                  <Text style={styles.playerName}>
                    {s.nombre} {s.apellido}
                  </Text>
                  <Text style={styles.playerRole}>Presidente</Text>
                </View>
              </View>
            </View>

            {/* Fecha de Solicitud */}
            <View style={styles.row}>
              <Text style={styles.label}>Fecha:</Text>
              <Text style={styles.value}>
                {new Date(s.fecha_solicitud).toLocaleDateString('es-ES')}
              </Text>
            </View>

            {/* Estado */}
            <View style={styles.row}>
              <Text style={styles.label}>Tu respuesta:</Text>
              <View style={styles.statusContainer}>
                {getStatusIcon(s.estado_club_origen)}
              </View>
            </View>

            {/* Acción */}
            <TouchableOpacity 
              onPress={() => router.push(`/traspaso/detalle_presidente/${s.traspaso_id}`)}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>Ver Detalle</Text>
              <MaterialIcons name="chevron-right" size={24} color="#3D8FA4" />
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay solicitudes disponibles</Text>
        </View>
      )}
    </ScrollView>
  );
};
export default TablaSolicitudesPresidente;