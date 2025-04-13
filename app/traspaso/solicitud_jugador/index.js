import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import styles from '../../../styles/index_tabla';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const Indice = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [campeonatos, setCampeonatos] = useState([]);
  const [selectedCampeonato, setSelectedCampeonato] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCampeonatos = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/campeonatos/select`);
        setCampeonatos(response.data);

        const campeonatoActivo = response.data.find((camp) => camp.estado !== 3);

        if (campeonatoActivo) {
          setSelectedCampeonato(campeonatoActivo.id);
        } else if (response.data.length > 0) {
          setSelectedCampeonato(response.data[0].id);
        }
      } catch (error) {
        Alert.alert('Error', 'Error al obtener los campeonatos');
        console.error('Error fetching campeonatos:', error);
      }
    };

    fetchCampeonatos();
  }, []);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        if (!selectedCampeonato) {
          return;
        }

        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'No se encontró el token de autenticación');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/traspaso/jugador/${selectedCampeonato}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Traspaso pruebas:', response.data);
        setSolicitudes(response.data);
      } catch (error) {
        Alert.alert('Error', 'Error al obtener las solicitudes de traspaso');
        console.error('Error al obtener solicitudes de traspaso:', error);
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <MaterialIcons name="pending" size={24} color="orange" />
            <Text>Pendiente</Text>
          </View>
        );
      case 'APROBADO':
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <MaterialIcons name="check-circle" size={24} color="green" />
            <Text>Aprobado</Text>
          </View>
        );
      case 'RECHAZADO':
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <MaterialIcons name="cancel" size={24} color="red" />
            <Text>Rechazado</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mis Solicitudes de Traspaso</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCampeonato}
          onValueChange={(itemValue) => setSelectedCampeonato(itemValue)}
          style={styles.picker}
        >
          {campeonatos.map((camp) => (
            <Picker.Item 
              key={camp.id} 
              label={`🏆 ${camp.nombre}`} 
              value={camp.id} 
            />
          ))}
        </Picker>
      </View>

      {solicitudes.length > 0 ? (
        solicitudes.map((solicitud) => (
          <View key={solicitud.traspaso_id} style={styles.clubContainer}>
            <Image
              source={solicitud.club_destino_imagen}
              style={styles.clubImage}
            />
            <View style={styles.clubInfo}>
              <Text style={styles.clubName}>{solicitud.club_destino_nombre}</Text>
              <Text style={styles.clubDescription}>
                {solicitud.nombre} {solicitud.apellido}
              </Text>
              <Text style={styles.clubDescription}>
                {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <View style={styles.clubDescription}>
                {getStatusIcon(solicitud.estado_jugador)}
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleVerDetalle(solicitud.traspaso_id)}>
                <MaterialIcons name="remove-red-eye" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          No hay solicitudes disponibles
        </Text>
      )}
    </ScrollView>
  );
};

export default Indice;