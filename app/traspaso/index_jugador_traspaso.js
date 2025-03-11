import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, TextInput, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import ConfirmModal from '../../components/confirm_modal';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons'; // Importa los íconos
import styles from '../../styles/index_tabla';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ListaJugadoresTraspaso = () => {
  const [jugadores, setJugadores] = useState([]);
  const [presidente, setPresidente] = useState([]);
  const [filteredPersonas, setFilteredPersonas] = useState([]);
  const [showConfirmTraspaso, setShowConfirmTraspaso] = useState(false);
  const [jugadorToFichar, setJugadorToFichar] = useState(null);
  const [filterState, setFilterState] = useState('No filtrar');
  const [searchName, setSearchName] = useState('');
  const navigation = useNavigation();

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

  const fetchPresidente = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user')); // Convierte el JSON a objeto
      const userId = user?.id;
      const response = await axios.get(`${API_BASE_URL}/presidente_club/get_presidenteById/${userId}`);
      console.log("presidente recibidos:", response.data);
      setPresidente(response.data);
    } catch (error) {
      Alert.alert('Error', 'Error al obtener los jugadores');
      console.error('Error al obtener los jugadores:', error);
    }
  };

  const fetchJugadores = async () => {
    try {
      const requestBody = {
        club_presidente: presidente.club_presidente,
        idTraspasoPresidente: presidente.id_presidente,
      };
      console.log(requestBody, 'ids');

      const response = await axios.post(`${API_BASE_URL}/jugador/intercambio`, requestBody, {
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

  const applyFilters = () => {
    let filtered = [...jugadores];

    // Filtrar por estado
    if (filterState !== 'No filtrar') {
      filtered = filtered.filter((jugador) =>
        filterState === 'Activo' ? jugador.eliminado === 'N' : jugador.eliminado === 'S'
      );
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

  const handleProfileClick = (jugadorId) => {
    navigation.navigate('Perfil', { id: jugadorId });
  };

  const handleSolicitudesClick = () => {
    navigation.navigate('MisSolicitudes');
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
        presidente_club_id_destino: presidente.id_presidente,
      });

      Alert.alert('Aceptado', 'Traspaso solicitado correctamente');
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Jugadores</Text>

      <TouchableOpacity style={styles.addButton} onPress={handleSolicitudesClick}>
        <Text style={styles.addButtonText}>Mis Solicitudes</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <Picker
          selectedValue={filterState}
          onValueChange={(itemValue) => setFilterState(itemValue)}
          style={{ width: 180, marginRight: 10 }}
        >
          <Picker.Item label="No filtrar" value="No filtrar" />
          <Picker.Item label="Activo" value="Activo" />
          <Picker.Item label="Inactivo" value="Inactivo" />
        </Picker>

        <TextInput
          style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8 }}
          placeholder="Buscar por nombre"
          value={searchName}
          onChangeText={(text) => setSearchName(text)}
        />
      </View>

      {filteredPersonas.map((jugador) => (
        <View key={jugador.jugador_id} style={styles.clubContainer}>
          <Image
            source={{ uri: jugador.imagen_persona }}
            style={styles.clubImage}
          />
          <View style={styles.clubInfo}>
            <Text style={styles.clubName}>
              {jugador.nombre_persona} {jugador.apellido_persona}
            </Text>
            <Text style={styles.clubDescription}>
              {new Date(jugador.fecha_nacimiento_persona).toLocaleDateString()}
            </Text>
            <Text style={styles.clubDescription}>
              {jugador.nombre_club || 'Sin Club'}
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={{ marginRight: 8 }}
              onPress={() => handleProfileClick(jugador.id)}
              disabled={jugador.eliminado === 'S'}
            >
              <MaterialIcons name="remove-red-eye" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleFicharClick(jugador.jugador_id)}>
              <MaterialIcons name="assignment-ind" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <ConfirmModal
        visible={showConfirmTraspaso}
        onConfirm={handleConfirmFichar}
        onCancel={handleCancelFichar}
        message="¿Seguro que quieres fichar a este jugador?"
      />
    </ScrollView>
  );
};

export default ListaJugadoresTraspaso;