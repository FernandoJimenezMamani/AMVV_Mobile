import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../../../styles/index_tabla';
//import RegistroJugadorClub from './RegistrarJugadorByClub/[id]';
import RegistroJugadorClub from '../RegistrarJugadorByCLub/[id]';
import defaultUserMenIcon from '../../../assets/img/Default_Imagen_Men.webp'
import defaultUserWomenIcon from '../../../assets/img/Default_Imagen_Women.webp'
import PerfilJugadorModal from '../perfil/[id]';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSession } from '../../../context/SessionProvider';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const ListaJugadoresClub = () => {
  const { user } = useSession();
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [perfilJugadorVisible, setPerfilJugadorVisible] = useState(false);
  const [jugadorIdPerfil, setJugadorIdPerfil] = useState(null);
  useEffect(() => {
    fetchJugadores();
  }, [id]);

  const fetchJugadores = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jugador/get_jugador_club/${id}`);
      setJugadores(response.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la lista de jugadores');
    } finally {
      setLoading(false);
    }
  };
  const hasRole = (...roles) => {
    return user && user.rol && roles.includes(user.rol.nombre);
  };

  const canAddPlayers = () => {
    // Permite a Presidentes de Asociación o Presidentes de Club
    return hasRole('PresidenteAsociacion') || hasRole('PresidenteClub');
  };
  const handleProfileClick = (jugadorId) => {
    setJugadorIdPerfil(jugadorId);
    setPerfilJugadorVisible(true);
  };

  const handleAssignJugador = () => {
    setShowFormModal(true);
  };

  const handleFormClose = () => {
    setShowFormModal(false);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />;
  }

  const getImagenPerfil = (arbitro) => {
      if (arbitro.imagen_persona) {
        return { uri: arbitro.imagen_persona }; 
      }
      return arbitro.genero_persona === 'V'
        ? defaultUserMenIcon
        : defaultUserWomenIcon;
    };

    const handleVolver = () => {
      router.back();
    };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleVolver} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#143E42" />
        </TouchableOpacity>
        <Text style={styles.title}>Lista de Jugadores</Text>
      </View>
      {canAddPlayers() && (
        <TouchableOpacity style={styles.addButton} onPress={handleAssignJugador}>
          <Text style={styles.addButtonText}>Agregar Jugador</Text>
        </TouchableOpacity>
      )}
      
      <RegistroJugadorClub isOpen={showFormModal} onClose={handleFormClose} onJugadorCreated={fetchJugadores} club_jugador_id={id} />
      
      <FlatList
        data={jugadores}
        keyExtractor={(item) => item.jugador_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.clubContainer}>
            <Image source={getImagenPerfil(item)} style={styles.clubImage} />
            <View style={styles.clubInfo}>
              <Text style={styles.clubName}>{item.nombre_persona} {item.apellido_persona}</Text>
              <Text style={styles.clubDescription}>CI: {item.ci_persona}</Text>
            </View>
            <TouchableOpacity onPress={() => handleProfileClick(item.persona_id)}>
              <MaterialIcons name="remove-red-eye" size={24} color="black" />
            </TouchableOpacity>
          </View>
        )}
      />

      <PerfilJugadorModal
        isOpen={perfilJugadorVisible}
        onClose={() => setPerfilJugadorVisible(false)}
        id={jugadorIdPerfil}
      />
    </View>
  );
};

export default ListaJugadoresClub;
