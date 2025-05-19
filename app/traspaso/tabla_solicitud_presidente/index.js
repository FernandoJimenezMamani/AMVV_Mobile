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
      }
    };

    if (campeonatoId) fetchSolicitudes();
  }, [campeonatoId]);

  const getStatusBadge = (estado) => {
    let backgroundColor, iconName, iconColor;
    
    switch (estado) {
      case 'PENDIENTE':
        backgroundColor = '#FFF3E0';
        iconName = "pending";
        iconColor = "#FFA000";
        break;
      case 'APROBADO':
        backgroundColor = '#E8F5E9';
        iconName = "check-circle";
        iconColor = "#4CAF50";
        break;
      case 'RECHAZADO':
        backgroundColor = '#FFEBEE';
        iconName = "cancel";
        iconColor = "#F44336";
        break;
      default:
        return null;
    }
    
    return (
      <View style={[styles.statusBadge, { backgroundColor }]}>
        <MaterialIcons name={iconName} size={16} color={iconColor} />
        <Text style={[styles.statusText, { color: iconColor }]}>
          {estado.charAt(0) + estado.slice(1).toLowerCase()}
        </Text>
      </View>
    );
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {filteredSolicitudes.length > 0 ? (
        filteredSolicitudes.map(s => (
          <View key={s.traspaso_id} style={styles.card}>
            {/* Header con fecha y estado */}
            <View style={styles.cardHeader}>
              <Text style={styles.dateText}>
                {new Date(s.fecha_solicitud).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </Text>
              {getStatusBadge(s.estado_club_origen)}
            </View>
            
            {/* Contenido principal */}
            <View style={styles.cardContent}>
              {/* Jugador */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Jugador</Text>
                <View style={styles.userInfo}>
                  <Image
                    source={getImagenPerfil(s.imagen_jugador, s.genero_persona)}
                    style={styles.userImage}
                  />
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                      {s.nombre_jugador} {s.apellido_jugador}
                    </Text>
                    <Text style={styles.userRole}>Jugador</Text>
                  </View>
                </View>
              </View>
              
              {/* Club destino */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Club destino</Text>
                <View style={styles.clubInfo}>
                  <Image
                    source={getImagenClub(s.club_imagen)}
                    style={styles.clubImage}
                  />
                  <Text style={styles.clubName}>{s.club_destino_nombre}</Text>
                </View>
              </View>
              
              {/* Presidente */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Presidente</Text>
                <View style={styles.userInfo}>
                  <Image
                    source={getImagenPerfil(s.imagen_presidente, s.genero)}
                    style={styles.userImage}
                  />
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                      {s.nombre} {s.apellido}
                    </Text>
                    <Text style={styles.userRole}>Presidente</Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Botón de acción */}
            <TouchableOpacity 
              onPress={() => router.push(`/traspaso/detalle_presidente/${s.traspaso_id}`)}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>Ver detalles completos</Text>
              <MaterialIcons name="chevron-right" size={24} color="#3D8FA4" />
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="info-outline" size={40} color="#777" />
          <Text style={styles.emptyText}>No hay solicitudes disponibles</Text>
        </View>
      )}
    </ScrollView>
  );
};
export default TablaSolicitudesPresidente;