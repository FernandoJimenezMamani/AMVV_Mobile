import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, TextInput, Alert } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import ConfirmModal from '../../../components/confirm_modal';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../../../styles/index_tabla';
import { useSession } from '../../../context/SessionProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PerfilJugador from '../../jugador/perfil/[id]'; // Importa el componente PerfilJugador

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const ListaJugadoresTraspaso = () => {
  const [jugadores, setJugadores] = useState([]);
  const [presidente, setPresidente] = useState({
    club_presidente: null,
    id_presidente: null
  });
  const [filteredPersonas, setFilteredPersonas] = useState([]);
  const [showConfirmTraspaso, setShowConfirmTraspaso] = useState(false);
  const [jugadorToFichar, setJugadorToFichar] = useState(null);
  const [filterState, setFilterState] = useState('No filtrar');
  const [searchName, setSearchName] = useState('');
  const [selectedJugadorId, setSelectedJugadorId] = useState(null); // Estado para el jugador seleccionado
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false); // Estado para controlar el modal
  const router = useRouter();
  const { activeRole } = useSession();

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
        role: activeRole?.id,
      };

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

  const getImagenPerfil = (jugador) => {
    if (jugador.imagen_persona) {
      return { uri: jugador.imagen_persona };
    }
    return jugador.persona_genero === 'V' 
      ? require('../../../assets/img/Default_Imagen_Men.webp')
      : require('../../../assets/img/Default_Imagen_Women.webp');
  };

  const applyFilters = () => {
    let filtered = [...jugadores];

    if (filterState !== 'No filtrar') {
      filtered = filtered.filter((jugador) =>
        filterState === 'Activo' ? jugador.eliminado === 'N' : jugador.eliminado === 'S'
      );
    }

    if (searchName) {
      filtered = filtered.filter((jugador) =>
        `${jugador.nombre_persona} ${jugador.apellido_persona}`
          .toLowerCase()
          .includes(searchName.toLowerCase())
      );
    }

    setFilteredPersonas(filtered);
  };

  const handleProfileClick = (jugador) => {
    setSelectedJugadorId(jugador.jugador_id); // Usa jugador_id en lugar de persona_id
     setIsPerfilModalOpen(true);
  };

  const handleSolicitudesClick = () => {
    router.push(`/traspaso/mis_solicitudes`);
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
            source={getImagenPerfil(jugador)}
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
              onPress={() => handleProfileClick(jugador)} // Pasa el objeto completo
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

      {/* Modal del perfil del jugador */}
      <PerfilJugador
        isOpen={isPerfilModalOpen}
        onClose={() => {
          setIsPerfilModalOpen(false);
          setSelectedJugadorId(null);
        }}
        id={selectedJugadorId}
      />
    </ScrollView>
  );
};

export default ListaJugadoresTraspaso;