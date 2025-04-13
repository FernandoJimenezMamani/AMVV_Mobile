import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, TextInput, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import ConfirmModal from '../../../components/confirm_modal';
import styles from '../../../styles/index_tabla';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const MisSolicitudesJugador = () => {
  const [clubes, setClubes] = useState([]);
  const [jugador, setJugador] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [filteredPersonas, setFilteredPersonas] = useState([]);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [filterState, setFilterState] = useState('Pendiente');
  const [searchName, setSearchName] = useState('');
  const [campeonatos, setCampeonatos] = useState([]);
  const [selectedCampeonato, setSelectedCampeonato] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initData = async () => {
      try {
        await fetchJugador();
        await fetchCampeonatos();
      } catch (error) {
        Alert.alert('Error', 'Error al cargar los datos iniciales');

      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    if (jugador?.jugador_id && selectedCampeonato) {
      fetchClubes();
    }
  }, [jugador, selectedCampeonato]);

  useEffect(() => {
    applyFilters();
  }, [filterState, searchName, clubes]);

  const fetchJugador = async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (!userString) throw new Error('No se encontró usuario');
      
      const user = JSON.parse(userString);
      const userId = user?.id;
      if (!userId) throw new Error('ID de usuario inválido');

      const response = await axios.get(`${API_BASE_URL}/jugador/get_jugadorById/${userId}`);
      setJugador(response.data);
    } catch (error) {
      console.error('Error al obtener jugador:', error);
      throw error;
    }
  };

  const fetchClubes = async () => {
    try {
      const requestBody = {
        jugador_id: jugador.jugador_id,
        campeonatoId: selectedCampeonato
      };
      
      const response = await axios.post(
        `${API_BASE_URL}/club/clubes_pending_confirm`, 
        requestBody,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      setClubes(response.data);
    } catch (error) {
      Alert.alert('Error', 'Error al obtener los clubes');
      console.error('Error al obtener clubes:', error);
    }
  };

  const fetchCampeonatos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/campeonatos/select`);
      setCampeonatos(response.data);
      
      const activo = response.data.find(c => c.estado !== 3);
      setSelectedCampeonato(activo ? activo.id : response.data[0]?.id);
    } catch (error) {
      console.error('Error al obtener campeonatos:', error);
      throw error;
    }
  };

  const applyFilters = () => {
    if (!clubes.length) {
      setFilteredPersonas([]);
      return;
    }

    let filtered = clubes.map(club => {
      if (club.estado_club_receptor === 'RECHAZADO' || club.estado_club_origen === 'RECHAZADO') {
        return { ...club, estado_solicitud: "Rechazado" };
      } 
      else if (
        (club.estado_club_receptor === 'PENDIENTE' && club.estado_club_origen === 'PENDIENTE') || 
        (club.estado_club_receptor === 'PENDIENTE' && club.estado_club_origen === 'APROBADO') ||
        (club.estado_club_receptor === 'APROBADO' && club.estado_club_origen === 'PENDIENTE') ||
        (club.estado_club_receptor === 'APROBADO' && club.estado_club_origen === 'APROBADO' && club.estado_deuda === 'PENDIENTE') 
      ) {
        return { ...club, estado_solicitud: "Pendiente" };
      } 
      else if (
        club.estado_club_receptor === 'APROBADO' &&
        club.estado_club_origen === 'APROBADO' &&
        club.estado_deuda === 'FINALIZADO'
      ) {
        return { ...club, estado_solicitud: "Realizado" };
      } 
      return { ...club, estado_solicitud: "En proceso" };
    });

    filtered = filtered.filter(club => 
      club.estado_solicitud === filterState &&
      (searchName ? club.nombre_club.toLowerCase().includes(searchName.toLowerCase()) : true)
    );

    setFilteredPersonas(filtered);
  };

  const handleDetailsClick = (traspasoId) => {
    router.push(`/traspasos/detalleSolicitante/${traspasoId}`);
  };

  const handleDeleteClick = (traspasoId) => {
    setRequestToDelete(traspasoId);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.put(`${API_BASE_URL}/traspaso/eliminar/${requestToDelete}`);
      await fetchClubes();
    } catch (error) {
      Alert.alert('Error', 'Error al eliminar la solicitud');
      console.error('Error al eliminar:', error);
    } finally {
      setShowConfirmDelete(false);
      setRequestToDelete(null);
    }
  };

  const getStatusIcon = (estado) => {
    const iconProps = {
      size: 20,
      style: { marginRight: 5 }
    };

    switch (estado) {
      case 'PENDIENTE':
        return (
          <View style={styles.statusContainer}>
            <MaterialIcons name="pending" {...iconProps} color="orange" />
            <Text>Pendiente</Text>
          </View>
        );
      case 'APROBADO':
        return (
          <View style={styles.statusContainer}>
            <MaterialIcons name="check-circle" {...iconProps} color="green" />
            <Text>Aprobado</Text>
          </View>
        );
      case 'RECHAZADO':
        return (
          <View style={styles.statusContainer}>
            <MaterialIcons name="cancel" {...iconProps} color="red" />
            <Text>Rechazado</Text>
          </View>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mis Solicitudes</Text>

      <View style={styles.filterRow}>
        <View style={styles.filterItem}>
          <Picker
            selectedValue={filterState}
            onValueChange={setFilterState}
            style={styles.picker}
          >
            <Picker.Item label="Rechazado" value="Rechazado" />
            <Picker.Item label="Pendiente" value="Pendiente" />
            <Picker.Item label="Realizado" value="Realizado" />
          </Picker>
        </View>

        <View style={styles.filterItem}>
          <Picker
            selectedValue={selectedCampeonato}
            onValueChange={setSelectedCampeonato}
            style={styles.picker}
          >
            {campeonatos.map(camp => (
              <Picker.Item 
                key={camp.id} 
                label={`🏆 ${camp.nombre}`} 
                value={camp.id} 
              />
            ))}
          </Picker>
        </View>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre de club"
        value={searchName}
        onChangeText={setSearchName}
      />

      {filteredPersonas.length > 0 ? (
        filteredPersonas.map(club => (
          <View key={club.traspaso_id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Image
                source={{ uri: club.imagen_club }}
                style={styles.clubImage}
              />
              <Text style={styles.clubName}>{club.nombre_club}</Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardText}>
                Fecha: {new Date(club.fecha_solicitud).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Club origen:</Text>
                {getStatusIcon(club.estado_club_origen)}
              </View>

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Club receptor:</Text>
                {getStatusIcon(club.estado_club_receptor)}
              </View>

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Pago:</Text>
                {getStatusIcon(club.estado_deuda)}
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity 
                onPress={() => handleDetailsClick(club.traspaso_id)}
                style={styles.actionButton}
              >
                <MaterialIcons name="remove-red-eye" size={24} color="#2196F3" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => handleDeleteClick(club.traspaso_id)}
                style={styles.actionButton}
              >
                <MaterialIcons name="delete" size={24} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>
          {clubes.length > 0 
            ? 'No hay solicitudes que coincidan con los filtros'
            : 'No hay solicitudes disponibles'}
        </Text>
      )}

      <ConfirmModal
        visible={showConfirmDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmDelete(false)}
        message="¿Seguro que quieres eliminar esta solicitud?"
      />
    </ScrollView>
  );
};

export default MisSolicitudesJugador;