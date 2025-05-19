import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import styles from '../../../styles/index_tabla_solicitud';
import Icon from 'react-native-vector-icons/MaterialIcons';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const Indice = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [campeonatos, setCampeonatos] = useState([]);
  const [selectedCampeonato, setSelectedCampeonato] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState('TODOS');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCampeonatos = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/campeonatos/select`);
        setCampeonatos(response.data);

        const campeonatoActivo = response.data.find((camp) => camp.estado !== 3);
        setSelectedCampeonato(campeonatoActivo ? campeonatoActivo.id : response.data[0]?.id);
      } catch (error) {
        Alert.alert('Error', 'Error al obtener los campeonatos');
      } finally {
        setLoading(false);
      }
    };

    fetchCampeonatos();
  }, []);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        if (!selectedCampeonato) return;

        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'No se encontró el token de autenticación');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/traspaso/jugador/${selectedCampeonato}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSolicitudes(response.data);
      } catch (error) {
        Alert.alert('Error', 'Error al obtener las solicitudes de traspaso');
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, [selectedCampeonato]);

  const handleVerDetalle = (solicitudId) => {
    router.push(`/traspaso/detalle_jugador/${solicitudId}`);
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return (
          <View style={styles.statusBadge}>
            <MaterialIcons name="pending" size={20} color="orange" />
            <Text style={styles.statusText}>Pendiente</Text>
          </View>
        );
      case 'APROBADO':
        return (
          <View style={styles.statusBadge}>
            <MaterialIcons name="check-circle" size={20} color="green" />
            <Text style={styles.statusText}>Aprobado</Text>
          </View>
        );
      case 'RECHAZADO':
        return (
          <View style={styles.statusBadge}>
            <MaterialIcons name="cancel" size={20} color="red" />
            <Text style={styles.statusText}>Rechazado</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const filteredSolicitudes = solicitudes.filter((s) => {
    return estadoFiltro === 'TODOS' || s.estado_jugador === estadoFiltro;
  });

  const solicitudAceptadaActiva = solicitudes.find(s =>
    s.estado_jugador === 'APROBADO' &&
    (s.estado_club_origen === 'PENDIENTE' || s.estado_club_origen === 'APROBADO')
  );

  const formatFechaLarga = (fechaString) => {
    if (!fechaString) return '';
    const [year, month, day] = fechaString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)); // mes empieza en 0
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cardHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#143E42" />
        </TouchableOpacity>
        <Text style={styles.userName}>Mis Solicitudes de Traspaso</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filtro de Campeonato */}
      <View style={styles.infoSection}>
        <Picker
          selectedValue={selectedCampeonato}
          onValueChange={setSelectedCampeonato}
          style={{ backgroundColor: 'white' }}
          dropdownIconColor="#333"
        >
          <Picker.Item label="Seleccione campeonato" value="" enabled={false} color="#999" />
          {campeonatos.map((camp) => (
            <Picker.Item 
              key={camp.id} 
              label={camp.nombre.length > 15 ? `${camp.nombre.substring(0, 15)}...` : camp.nombre}
              value={camp.id}
            />
          ))}
        </Picker>
      </View>

      {/* Filtro de Estado */}
      <View style={styles.infoSection}>
        <Picker
          selectedValue={estadoFiltro}
          onValueChange={setEstadoFiltro}
          style={{ backgroundColor: 'white' }}
          dropdownIconColor="#333"
        >
          <Picker.Item label="Filtrar por estado" value="" enabled={false} color="#999" />
          <Picker.Item label="Todos los estados" value="TODOS" />
          <Picker.Item label="Pendiente" value="PENDIENTE" />
          <Picker.Item label="Aprobado" value="APROBADO" />
          <Picker.Item label="Rechazado" value="RECHAZADO" />
        </Picker>
      </View>

    <ScrollView style={styles.contentContainer}>
  {filteredSolicitudes.length > 0 ? (
    filteredSolicitudes.map((solicitud) => (
      <View key={solicitud.traspaso_id} style={styles.card}>
        <View style={styles.cardContent}>
          {/* Club Interesado */}
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Club destino:</Text>
            <Text style={styles.userName}>{solicitud.club_destino_nombre || 'No especificado'}</Text>
          </View>

          {/* Presidente Interesado */}
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Presidente:</Text>
            <Text style={styles.userName}>
              {solicitud.nombre ? `${solicitud.nombre} ${solicitud.apellido}` : 'No especificado'}
            </Text>
          </View>

          {/* Fecha de Solicitud */}
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Fecha:</Text>
            <Text style={styles.userName}>
              {formatFechaLarga(solicitud.fecha_solicitud)}
            </Text>
          </View>

          {/* Estado */}
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Tu respuesta:</Text>
            <View>
              {getStatusIcon(solicitud.estado_jugador)}
            </View>
          </View>
        </View>

        {/* Acción */}
        <TouchableOpacity 
          onPress={() => handleVerDetalle(solicitud.traspaso_id)}
          style={[
            styles.actionButton,
            solicitudAceptadaActiva && solicitud.traspaso_id !== solicitudAceptadaActiva.traspaso_id 
              ? { opacity: 0.5 } 
              : null
          ]}
          disabled={
            solicitudAceptadaActiva &&
            solicitud.traspaso_id !== solicitudAceptadaActiva.traspaso_id
          }
        >
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={[
              styles.actionButtonText,
              solicitudAceptadaActiva && solicitud.traspaso_id !== solicitudAceptadaActiva.traspaso_id 
                ? {color: '#ccc'} 
                : null
            ]}>
              Ver Detalle
            </Text>
            <MaterialIcons 
              name="chevron-right" 
              size={24} 
              color={
                solicitudAceptadaActiva && solicitud.traspaso_id !== solicitudAceptadaActiva.traspaso_id 
                ? '#ccc' 
                : '#3D8FA4'
              } 
            />
          </View>
        </TouchableOpacity>
        
        {solicitudAceptadaActiva && solicitud.traspaso_id !== solicitudAceptadaActiva.traspaso_id && (
          <View style={styles.infoSection}>
            <Text style={[styles.statusLabel, { 
              color: 'red', 
              textAlign: 'center', 
              padding: 8,
              backgroundColor: '#fff5f5',
              borderRadius: 6
            }]}>
              Ya has aceptado otra solicitud. Espera resolución del presidente.
            </Text>
          </View>
        )}
      </View>
    ))
  ) : (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No hay solicitudes disponibles</Text>
    </View>
  )}
</ScrollView>
    </View>
  );
};

export default Indice;