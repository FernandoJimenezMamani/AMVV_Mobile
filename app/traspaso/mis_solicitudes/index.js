import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, TextInput, Alert } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import ConfirmModal from '../../../components/confirm_modal';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../../../styles/index_tabla';
import AsyncStorage from '@react-native-async-storage/async-storage';
import defaultUserMen from '../../../assets/img/Default_Imagen_Men.webp';
import defaultUserWomen from '../../../assets/img/Default_Imagen_Women.webp';

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
  const [filterState, setFilterState] = useState('Todos');
  const [searchName, setSearchName] = useState('');
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [campeonatos, setCampeonatos] = useState([]);
  const [selectedCampeonato, setSelectedCampeonato] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchPresidente();
  }, []);

  useEffect(() => {
    if (presidente && presidente.club_presidente && presidente.id_presidente) {
      fetchJugadores();
    }
  }, [presidente]);

  useEffect(() => {
    applyFilters();
  }, [filterState, searchName, jugadores]);

  const getImagenPerfil = (jugador) => {
    if (jugador.imagen_persona) {
      return { uri: jugador.imagen_persona };
    }
    return jugador.persona_genero === 'V' 
      ? require('../../../assets/img/Default_Imagen_Men.webp')
      : require('../../../assets/img/Default_Imagen_Women.webp');
  };

  const fetchPresidente = async () => {
    try {
      const userString = await AsyncStorage.getItem('user'); // Usa AsyncStorage en lugar de sessionStorage
      if (!userString) {
        throw new Error('No se encontró el usuario en AsyncStorage');
      }

      const user = JSON.parse(userString);
      const userId = user?.id;

      if (!userId) {
        throw new Error('El usuario no tiene un ID válido');
      }

      const response = await axios.get(`${API_BASE_URL}/presidente_club/get_presidenteById/${userId}`);
      console.log("presidente recibidos:", response.data);
      setPresidente(response.data);
    } catch (error) {
      Alert.alert('Error', 'Error al obtener los PRESIDENTES');
      console.error('Error al obtener los PRESIDENTES:', error);
    }
  };

  const fetchJugadores = async () => {
    try {
      const requestBody = {
        club_presidente: presidente.club_presidente,
        idTraspasoPresidente: presidente.id_presidente,
        campeonatoId: selectedCampeonato,
      };
      console.log(requestBody, 'ids');

      const response = await axios.post(`${API_BASE_URL}/jugador/intercambioEstado`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("Jugadores recibidos:", response.data);
      setJugadores(response.data);
    } catch (error) {
      Alert.alert('Error', 'Error al obtener los jugadores');
      console.error('Error al obtener los jugadores:', error);
    }
  };

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

  const applyFilters = () => {
    let filtered = [...jugadores];
  
    // Clasificación de solicitudes - versión simplificada y corregida
    filtered = filtered.map((jugador) => {
      // Primero verifica si hay algún rechazo
      if (jugador.estado_jugador === 'RECHAZADO' || jugador.estado_club_origen === 'RECHAZADO') {
        return { ...jugador, estado_solicitud: 'Rechazado' };
      }
      // Luego verifica si está completado (ambos aprobados y deuda finalizada)
      else if (
        jugador.estado_jugador === 'APROBADO' &&
        jugador.estado_club_origen === 'APROBADO' &&
        jugador.estado_deuda === 'FINALIZADO'
      ) {
        return { ...jugador, estado_solicitud: 'Realizado' };
      }
      // Todo lo demás se considera pendiente
      else {
        return { ...jugador, estado_solicitud: 'Pendiente' };
      }
    });
  
    // Aplicar filtros
    if (filterState !== 'Todos') {
      filtered = filtered.filter((jugador) => jugador.estado_solicitud === filterState);
    }
  
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

  const handleDetailsClick = (jugadorId) => {
    //Alert.alert('error', 'dsada' + jugadorId);
    router.push(`/traspaso/detalle_solicitante/${jugadorId}`); // Usa router.push para la navegación
  };

  const handleSolicitudesClick = () => {
    router.push('/traspaso/mis_solicitudes'); // Redirige a la pantalla de solicitudes
  };

  const handleFicharClick = (jugadorId) => {
    setJugadorToFichar(jugadores.find((jugador) => jugador.jugador_id === jugadorId));
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

      Alert.alert('Aceptado', 'Traspaso solicitado correctamente');
      setShowConfirmTraspaso(false);
      setJugadorToFichar(null);
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
      <Text style={styles.title}>Mis Solicitudes</Text>

      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
      <Picker
        selectedValue={filterState}
        onValueChange={(itemValue) => setFilterState(itemValue)}
        style={{ width: 180, marginRight: 10 }}
      >
        <Picker.Item label="Todos" value="Todos" />
        <Picker.Item label="Rechazado" value="Rechazado" />
        <Picker.Item label="Pendiente" value="Pendiente" />
        <Picker.Item label="Realizado" value="Realizado" />
      </Picker>

        <Picker
          selectedValue={selectedCampeonato}
          onValueChange={(itemValue) => setSelectedCampeonato(itemValue)}
          style={{ flex: 1 }}
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

      <TextInput
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 16 }}
        placeholder="Buscar por nombre"
        value={searchName}
        onChangeText={(text) => setSearchName(text)}
      />

      {filteredPersonas.length > 0 ? (
        filteredPersonas.map((jugador) => (
          <View key={jugador.jugador_id} style={styles.clubContainer}>
            <Image
              source={getImagenPerfil(jugador)}
              style={styles.clubImage}
            />
            <View style={styles.clubInfo}>
              <Text style={styles.clubName}>
                {jugador.nombre_persona} {jugador.apellido_persona}
              </Text>
              <Text style={styles.clubDescription}>
                Club: {jugador.nombre_club}
              </Text>
              <Text style={styles.clubDescription}>
                Estado Jugador: {jugador.estado_jugador}
              </Text>
              <Text style={styles.clubDescription}>
                Estado Club: {jugador.estado_club_origen}
              </Text>
              <Text style={styles.clubDescription}>
                Estado Deuda: {jugador.estado_deuda}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleDetailsClick(jugador.id_traspaso)}>
                <MaterialIcons name="remove-red-eye" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={{textAlign: 'center', marginTop: 20}}>
          No hay solicitudes que coincidan con los filtros
        </Text>
      )}
      {/* Modales de confirmación */}
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
    </ScrollView>
  );
};

export default MisSolicitudes;
