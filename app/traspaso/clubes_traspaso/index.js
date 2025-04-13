import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import ConfirmModal from '../../../components/confirm_modal';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../../../styles/index_tabla';
import { useSession } from '../../../context/SessionProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Componente PerfilClub integrado para evitar problemas de importación
const PerfilClub = ({ isOpen, onClose, id }) => {
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && id) {
      fetchClub();
    }
  }, [isOpen, id]);

  const fetchClub = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/club/get_clubById/${id}`);
      setClub(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar el club');
      console.error('Error fetching club:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <View style={{ flex: 1, position: 'absolute', width: '100%', height: '100%', backgroundColor: 'white' }}>
      <TouchableOpacity onPress={onClose} style={{ alignSelf: 'flex-end', padding: 15 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>X</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      ) : error ? (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 50 }}>{error}</Text>
      ) : club ? (
        <View style={{ alignItems: 'center', padding: 20 }}>
          <Image
            source={club.imagen_club ? { uri: club.imagen_club } : require('../../../assets/img/Default_Imagen_Club.webp')}
            style={{ width: 200, height: 200, borderRadius: 100, marginBottom: 20 }}
          />
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>{club.nombre_club}</Text>
          <Text style={{ fontSize: 16, textAlign: 'center' }}>{club.descripcion_club}</Text>
        </View>
      ) : (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 50 }}>Club no encontrado</Text>
      )}
    </View>
  );
};

const ListaClubesTraspasos = () => {
  const [clubes, setClubes] = useState([]);
  const [jugador, setJugador] = useState(null);
  const [presidenteId, setPresidenteId] = useState(null);
  const [showConfirmTraspaso, setShowConfirmTraspaso] = useState(false);
  const [clubToFichar, setClubToFichar] = useState(null);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false);
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
      console.error('Error al obtener los jugadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClubes = async () => {
    try {
      if (!jugador || !jugador.jugador_id) return;
      
      setLoading(true);
      const requestBody = {
        jugador_id: jugador.jugador_id
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
      console.error('Error al obtener los clubes:', error);
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
        jugador_id: jugador.jugador_id,
        club_origen_id: jugador.club_jugador,
        club_destino_id: clubToFichar,
        presidente_club_id_destino: presidenteId
      });

      Alert.alert('Éxito', 'Traspaso solicitado correctamente');
      setShowConfirmTraspaso(false);
      setClubToFichar(null);
      fetchClubes();
    } catch (error) {
      Alert.alert('Error', 'Error al solicitar el traspaso');
      console.error('Error al crear el traspaso:', error);
    } finally {
      setLoading(false);
      setShowConfirmTraspaso(false);
      setClubToFichar(null);
    }
  };

  const handleProfileClick = (clubId) => {
    const selectedClub = clubes.find(club => club.club_id === clubId);
    if (selectedClub) {
      setSelectedClubId(clubId);
      setIsPerfilModalOpen(true);
    } else {
      Alert.alert('Error', 'Club no encontrado');
    }
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

      {isPerfilModalOpen && (
        <PerfilClub
          isOpen={isPerfilModalOpen}
          onClose={() => {
            setIsPerfilModalOpen(false);
            setSelectedClubId(null);
          }}
          id={selectedClubId}
        />
      )}
    </View>
  );
};

export default ListaClubesTraspasos;