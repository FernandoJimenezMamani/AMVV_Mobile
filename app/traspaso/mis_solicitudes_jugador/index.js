import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  TextInput, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import ConfirmModal from '../../../components/confirm_modal';
import styles from '../../../styles/index_tabla_traspaso';
import ClubDefecto from '../../../assets/img/Default_Imagen_Club.webp';

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
        await fetchCampeonatos();
        await fetchJugador();
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
        jugador_id: jugador.id,
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
    router.push(`/traspaso/detalle_solicitante/${traspasoId}`);
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
    const iconProps = { size: 20, color: undefined };

    switch (estado) {
      case 'PENDIENTE':
        return (
          <View style={styles.playerInfoContainer}>
            <MaterialIcons name="pending" {...iconProps} color="orange" />
            <Text style={styles.playerRole}>Pendiente</Text>
          </View>
        );
      case 'APROBADO':
      case 'FINALIZADO':
        return (
          <View style={styles.playerInfoContainer}>
            <MaterialIcons name="check-circle" {...iconProps} color="green" />
            <Text style={styles.playerRole}>Aprobado</Text>
          </View>
        );
      case 'RECHAZADO':
        return (
          <View style={styles.playerInfoContainer}>
            <MaterialIcons name="cancel" {...iconProps} color="red" />
            <Text style={styles.playerRole}>Rechazado</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const getImagenClub = (club) => {
    if (club.imagen_club) {
      return { uri: club.imagen_club };
    }
    return ClubDefecto;
  };

  const formatFechaLarga = (fechaString) => {
    if (!fechaString) return '';
    const [year, month, day] = fechaString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.title}>Mis Solicitudes</Text>
      </View>

      <View style={styles.filterRow}>
        <View style={[styles.pickerContainer, {flex: 1.2}]}>
          <Picker
            selectedValue={filterState}
            onValueChange={setFilterState}
            style={styles.picker}
            dropdownIconColor="#333"
          >
            <Picker.Item 
              label="Estado de solicitud" 
              value="" 
              enabled={false} 
              style={{ color: '#999' }} 
            />
            <Picker.Item label="Rechazado" value="Rechazado" />
            <Picker.Item label="Pendiente" value="Pendiente" />
            <Picker.Item label="Realizado" value="Realizado" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCampeonato}
            onValueChange={setSelectedCampeonato}
            style={styles.picker}
            dropdownIconColor="#333"
          >
            <Picker.Item 
              label="Seleccione campeonato" 
              value="" 
              enabled={false} 
              style={{ color: '#999' }} 
            />
            {campeonatos.map(camp => (
              <Picker.Item 
                key={camp.id} 
                label={camp.nombre.length > 15 ? `${camp.nombre.substring(0, 15)}...` : camp.nombre}
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

      <ScrollView style={styles.listContainer}>
        {filteredPersonas.length > 0 ? (
          filteredPersonas.map(club => (
            <View key={club.traspaso_id} style={styles.itemContainer}>
              <Image
                source={getImagenClub(club)}
                style={styles.smallImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.playerName}>{club.nombre_club}</Text>
                <Text style={styles.clubDescription}>
                  Fecha: {formatFechaLarga(club.fecha_solicitud)}
                </Text>
                
                <View style={styles.statusContainer}>
                  <Text style={styles.clubDescription}>Club origen:</Text>
                  {getStatusIcon(club.estado_club_origen)}
                </View>
                
                <View style={styles.statusContainer}>
                  <Text style={styles.clubDescription}>Club receptor:</Text>
                  {getStatusIcon(club.estado_club_receptor)}
                </View>
                
                <View style={styles.statusContainer}>
                  <Text style={styles.clubDescription}>Pago:</Text>
                  {getStatusIcon(club.estado_deuda)}
                </View>
              </View>
              
              <View style={styles.itemActions}>
                <TouchableOpacity 
                  onPress={() => handleDetailsClick(club.traspaso_id)}
                  style={styles.actionButton}
                >
                  <MaterialIcons name="remove-red-eye" size={24} color="#3498db" />
                </TouchableOpacity>
                
                {club.estado_deuda !== 'FINALIZADO' && (
                  <TouchableOpacity 
                    onPress={() => handleDeleteClick(club.traspaso_id)}
                    style={styles.actionButton}
                  >
                    <MaterialIcons name="delete" size={24} color="#e74c3c" />
                  </TouchableOpacity>
                )}
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
      </ScrollView>

      <ConfirmModal
        visible={showConfirmDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmDelete(false)}
        message="¿Seguro que quieres eliminar esta solicitud?"
      />
    </View>
  );
};

export default MisSolicitudesJugador;