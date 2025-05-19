import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import ConfirmModal from '../../../components/confirm_modal';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../../../styles/index_tabla';
import { useSession } from '../../../context/SessionProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const ListaClubesTraspasos = () => {
  const [clubes, setClubes] = useState([]);
  const [jugador, setJugador] = useState(null);
  const [presidenteId, setPresidenteId] = useState(null);
  const [showConfirmTraspaso, setShowConfirmTraspaso] = useState(false);
  const [clubToFichar, setClubToFichar] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { activeRole } = useSession();

  useEffect(() => {
    fetchJugador();
  }, []);

  useEffect(() => {
    if (jugador && jugador.jugador_id) {
      fetchClubes();
    }
  }, [jugador]);

  const fetchJugador = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (!userString) {
        throw new Error('No se encontró el usuario en AsyncStorage');
      }

      const user = JSON.parse(userString);
      const userId = user?.id;

      if (!userId) {
        throw new Error('El usuario no tiene un ID válido');
      }

      const response = await axios.get(`${API_BASE_URL}/jugador/get_jugadorById/${userId}`);
      console.log('Jugador:', response.data);
      setJugador(response.data);
    } catch (error) {
      Alert.alert('Error', 'Error al obtener los datos del jugador');
    } finally {
      setLoading(false);
    }
  };

  const fetchClubes = async () => {
    try {
      if (!jugador || !jugador.jugador_id) return;
      
      setLoading(true);
      const requestBody = {
        jugador_id: jugador.id
      };
      
      const response = await axios.post(`${API_BASE_URL}/club/clubes-disponibles-by-jugador`, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Clubes:', response.data);
      setClubes(response.data.clubes || []);
    } catch (error) {
      Alert.alert('Error', 'Error al obtener los clubes');
    } finally {
      setLoading(false);
    }
  };

  const handleFicharClick = (club) => {
    if (!club || !club.club_id) {
      Alert.alert('Error', 'Datos del club no válidos');
      return;
    }
    setClubToFichar(club.club_id);
    setPresidenteId(club.presidente_club_id);
    setShowConfirmTraspaso(true);
  };

  const handleCancelFichar = () => {
    setShowConfirmTraspaso(false);
    setClubToFichar(null);
  };

  const handleConfirmFichar = async () => {
    if (!clubToFichar || !presidenteId || !jugador) return;

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/traspaso/crearJugador`, {
        jugador_id: jugador.id,
        club_origen_id: jugador.club_jugador,
        club_destino_id: clubToFichar,
        presidente_club_id_destino: presidenteId
      });

      setShowConfirmTraspaso(false);
      setClubToFichar(null);
      fetchClubes();
      Toast.show({
        type: 'success',
        text1: 'Solicitud enviada con éxito',
        position: 'bottom',
      });
    } catch (error) {
      Alert.alert('Error', 'Error al solicitar el traspaso');

    } finally {
      setLoading(false);
      setShowConfirmTraspaso(false);
      setClubToFichar(null);
    }
  };

const handleProfileClick = (clubId) => {
  router.push(`/club/perfil/${clubId}`);
};


  const handleSolicitudesClick = () => {
    router.push('/traspaso/mis_solicitudes_jugador');
  };

  const getDefaultClubImage = () => {
    return require('../../../assets/img/Default_Imagen_Club.webp');
  };

  if (loading && clubes.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Lista de Clubes</Text>

        <TouchableOpacity style={styles.addButton} onPress={handleSolicitudesClick}>
          <Text style={styles.addButtonText}>Mis solicitudes</Text>
        </TouchableOpacity>

        {clubes.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>No hay clubes disponibles</Text>
        ) : (
          clubes.map((club) => (
            <View key={club.club_id} style={styles.clubContainer}>
              <Image
                source={club.imagen_club ? { uri: club.imagen_club } : getDefaultClubImage()}
                style={styles.clubImage}
              />
              <View style={styles.clubInfo}>
                <Text style={styles.clubName}>{club.nombre_club}</Text>
                <Text style={styles.clubDescription} numberOfLines={2}>
                  {club.descripcion_club || 'Sin descripción'}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={{ marginRight: 8 }}
                  onPress={() => handleProfileClick(club.club_id)}
                >
                  <MaterialIcons name="remove-red-eye" size={24} color="black" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleFicharClick(club)}>
                  <MaterialIcons name="assignment-ind" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <ConfirmModal
          visible={showConfirmTraspaso}
          onConfirm={handleConfirmFichar}
          onCancel={handleCancelFichar}
          message="¿Seguro que quieres solicitar traspaso a este club?"
        />
      </ScrollView>

    </View>
  );
};

export default ListaClubesTraspasos;