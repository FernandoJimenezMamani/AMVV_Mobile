import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  TextInput, 
  Alert,
  StyleSheet 
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import ConfirmModal from '../../../components/confirm_modal';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import defaultUserMen from '../../../assets/img/Default_Imagen_Men.webp';
import defaultUserWomen from '../../../assets/img/Default_Imagen_Women.webp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../../../styles/index_tabla_traspaso';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const MisSolicitudes = () => {
  const [jugadores, setJugadores] = useState([]);
  const [presidente, setPresidente] = useState({
    club_presidente: null,
    id_presidente: null
  });
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [filteredPersonas, setFilteredPersonas] = useState([]);
  const [showConfirmTraspaso, setShowConfirmTraspaso] = useState(false);
  const [jugadorToFichar, setJugadorToFichar] = useState(null);
  const [filterState, setFilterState] = useState('Pendiente');
  const [searchName, setSearchName] = useState('');
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [campeonatos, setCampeonatos] = useState([]);
  const [selectedCampeonato, setSelectedCampeonato] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchPresidente();
    fetchCampeonatos();
  }, []);

  useEffect(() => {
    if (presidente && presidente.club_presidente && presidente.id_presidente && selectedCampeonato) {
      fetchJugadores();
    }
  }, [presidente, selectedCampeonato]);

  useEffect(() => {
    applyFilters();
  }, [filterState, searchName, jugadores]);

  const fetchCampeonatos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/campeonatos/select`);
      setCampeonatos(response.data);

      const campeonatoActivo = response.data.find(camp => camp.estado !== 3);
      
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

  const getImagenPerfil = (jugador) => {
    if (jugador.persona_imagen) {
      return { uri: jugador.persona_imagen };
    }
    return jugador.persona_genero === 'V' ? defaultUserMen : defaultUserWomen;
  };

  const fetchPresidente = async () => {
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

      const response = await axios.get(`${API_BASE_URL}/presidente_club/get_presidenteById/${userId}`);
      setPresidente(response.data);
    } catch (error) {
      Alert.alert('Error', 'Error al obtener los PRESIDENTES');
      console.error('Error al obtener los PRESIDENTES:', error);
    }
  };

  const fetchJugadores = async () => {
    try {
      if (!presidente.id_presidente || !selectedCampeonato) return;
      
      const requestBody = { 
        idTraspasoPresidente: presidente.id_presidente,
        campeonatoId: selectedCampeonato
      };

      const response = await axios.post(`${API_BASE_URL}/jugador/intercambioEstado`, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setJugadores(response.data);
    } catch (error) {
      Alert.alert('Error', 'Error al obtener los jugadores');
      console.error('Error al obtener los jugadores:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...jugadores];
  
    // Clasificación de solicitudes
    filtered = filtered.map((jugador) => {
      if (jugador.estado_jugador === 'RECHAZADO' || jugador.estado_club_origen === 'RECHAZADO') {
        return { ...jugador, estado_solicitud: "Rechazado" };
      } 
      else if (
        (jugador.estado_jugador === 'PENDIENTE' && jugador.estado_club_origen === 'PENDIENTE') || 
        (jugador.estado_jugador === 'PENDIENTE' && jugador.estado_club_origen === 'APROBADO') ||
        (jugador.estado_jugador === 'APROBADO' && jugador.estado_club_origen === 'PENDIENTE') ||
        (jugador.estado_jugador === 'APROBADO' && jugador.estado_club_origen === 'APROBADO' && jugador.estado_deuda === 'PENDIENTE') 
      ) {
        return { ...jugador, estado_solicitud: "Pendiente" };
      } 
      else if (
        jugador.estado_jugador === 'APROBADO' &&
        jugador.estado_club_origen === 'APROBADO' &&
        jugador.estado_deuda === 'FINALIZADO'
      ) {
        return { ...jugador, estado_solicitud: "Realizado" };
      } 
      else {
        return { ...jugador, estado_solicitud: "En proceso" };
      }
    });

    filtered = filtered.filter((jugador) => jugador.estado_solicitud === filterState);
  
    // Filtrar por nombre
    if (searchName) {
      filtered = filtered.filter((jugador) =>
        `${jugador.nombre_persona} ${jugador.apellido_persona}`
          .toLowerCase()
          .includes(searchName.toLowerCase())
      );
    }
  
    setFilteredPersonas(filtered);
  };

  const handleDetailsClick = (traspasoId) => {
    router.push(`/traspaso/detalle_solicitante/${traspasoId}`);
  };

  const handleFicharClick = (jugadorId) => {
    setJugadorToFichar(jugadores.find(jugador => jugador.jugador_id === jugadorId));
    setShowConfirmTraspaso(true);
  };

  const handleConfirmFichar = async () => {
    if (!jugadorToFichar) return;
  
    try {
      await axios.post(`${API_BASE_URL}/traspaso/crear`, {
        jugador_id: jugadorToFichar.jugador_id,
        club_origen_id: jugadorToFichar.club_id, 
        club_destino_id: presidente.club_presidente, 
      });
  
      Alert.alert('Éxito', 'Traspaso solicitado correctamente');
      setShowConfirmTraspaso(false);
      setJugadorToFichar(null);
      fetchJugadores();
    } catch (error) {
      Alert.alert('Error', 'Error al solicitar el traspaso');
      console.error('Error al crear el traspaso:', error);
      setShowConfirmTraspaso(false);
      setJugadorToFichar(null);
    }
  };

  const handleCancelFichar = () => {
    setShowConfirmTraspaso(false);
    setJugadorToFichar(null);
  };

  const handleDeleteClick = (traspasoId) => {
    setRequestToDelete(traspasoId);
    setShowConfirmDelete(true);
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
    setRequestToDelete(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.put(`${API_BASE_URL}/traspaso/eliminar/${requestToDelete}`);
      setShowConfirmDelete(false);
      setRequestToDelete(null);
      fetchJugadores();
    } catch (error) {
      Alert.alert('Error', 'Error al eliminar la solicitud');
      console.error('Error al eliminar la solicitud:', error);
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return (
          <View style={styles.playerInfoContainer}>
            <MaterialIcons name="pending" size={20} color="orange" />
            <Text style={styles.playerRole}>Pendiente</Text>
          </View>
        );
      case 'APROBADO':
      case 'FINALIZADO':
        return (
          <View style={styles.playerInfoContainer}>
            <MaterialIcons name="check-circle" size={20} color="green" />
            <Text style={styles.playerRole}>Aprobado</Text>
          </View>
        );
      case 'RECHAZADO':
        return (
          <View style={styles.playerInfoContainer}>
            <MaterialIcons name="cancel" size={20} color="red" />
            <Text style={styles.playerRole}>Rechazado</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const formatFechaLarga = (fechaString) => {
    if (!fechaString) return '';
    const [year, month, day] = fechaString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

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
            onValueChange={(value) => setFilterState(value)}
            style={styles.picker}
          >
            <Picker.Item label="Rechazado" value="Rechazado" />
            <Picker.Item label="Pendiente" value="Pendiente" />
            <Picker.Item label="Realizado" value="Realizado" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCampeonato}
            onValueChange={(value) => setSelectedCampeonato(value)}
            style={styles.picker}
          >
            {campeonatos.map((camp) => (
              <Picker.Item 
                key={camp.id} 
                label={camp.nombre}
                value={camp.id}
              />
            ))}
          </Picker>
        </View>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre"
        value={searchName}
        onChangeText={(text) => setSearchName(text)}
      />

      <ScrollView style={styles.listContainer}>
        {filteredPersonas.length > 0 ? (
          filteredPersonas.map((jugador) => (
            <View key={jugador.jugador_id} style={styles.itemContainer}>
              <Image
                source={getImagenPerfil(jugador)}
                style={styles.smallImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.playerName}>
                  {jugador.nombre_persona} {jugador.apellido_persona}
                </Text>
                <Text style={styles.clubDescription}>
                  Fecha Nac: {formatFechaLarga(jugador.fecha_nacimiento_persona)}
                </Text>
                <Text style={styles.clubDescription}>
                  Club: {jugador.nombre_club}
                </Text>
                <Text style={styles.clubDescription}>
                  Fecha Solicitud: {formatFechaLarga(jugador.fecha_solicitud)}
                </Text>
                
                <View style={styles.statusContainer}>
                  <Text style={styles.clubDescription}>Respuesta Jugador:</Text>
                  {getStatusIcon(jugador.estado_jugador)}
                </View>
                <View style={styles.statusContainer}>
                  <Text style={styles.clubDescription}>Respuesta Club:</Text>
                  {getStatusIcon(jugador.estado_club_origen)}
                </View>
                <View style={styles.statusContainer}>
                  <Text style={styles.clubDescription}>Pago:</Text>
                  {getStatusIcon(jugador.estado_deuda)}
                </View>
              </View>
              
              <View style={styles.itemActions}>
                <TouchableOpacity 
                  onPress={() => handleDetailsClick(jugador.id_traspaso)}
                  style={styles.actionButton}
                >
                  <MaterialIcons name="remove-red-eye" size={24} color="#3498db" />
                </TouchableOpacity>
                
                {jugador.estado_deuda !== 'FINALIZADO' && (
                  <TouchableOpacity 
                    onPress={() => handleDeleteClick(jugador.id_traspaso)}
                    style={styles.actionButton}
                  >
                    <MaterialIcons name="delete" size={24} color="#e74c3c" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No hay solicitudes que coincidan con los filtros</Text>
        )}
      </ScrollView>

      <ConfirmModal
        visible={showConfirmTraspaso}
        onConfirm={handleConfirmFichar}
        onCancel={handleCancelFichar}
        message="¿Seguro que quieres fichar a este jugador?"
      />

      <ConfirmModal
        visible={showConfirmDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        message="¿Seguro que quieres eliminar esta solicitud?"
      />
    </View>
  );
};

export default MisSolicitudes;