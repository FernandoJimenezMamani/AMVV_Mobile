import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  StyleSheet,
  Modal,
  Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';

// Importa tus imágenes por defecto
import defaultUserMenIcon from '../../../assets/img/Default_Imagen_Men.webp';
import defaultUserWomenIcon from '../../../assets/img/Default_Imagen_Women.webp';
import Club_defecto from '../../../assets/img/Default_Imagen_Club.webp';

// Importa los modals
import PerfilPresidenteModal from '../../presidente_club/perfil/[id]';
import EditarEquipoModal from '../../equipo/editar/[id]';
import RegistroEquipo from '../../equipo/registrar/[id]';
import styles from '../../../styles/club/perfil';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const { width } = Dimensions.get('window');
const PerfilClub = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [club, setClub] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenero, setSelectedGenero] = useState(null);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [delegadosClub, setDelegadosClub] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  useEffect(() => {
    fetchClubAndTeams();
  }, [id]);

  useEffect(() => {
    if (club?.club_id) {
      fetchDelegados();
    }
  }, [club]);

  const fetchClubAndTeams = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/club/get_club_teams/${id}`);
      
      if (response.data.length > 0) {
        const clubInfo = {
          club_id: response.data[0].club_id,
          nombre: response.data[0].club_nombre,
          descripcion: response.data[0].club_descripcion,
          club_imagen: response.data[0].club_imagen,
          presidente_id: response.data[0].presidente_id,
          presidente_asignado: response.data[0].presidente_asignado,
          presidente_nombre: response.data[0].presidente_nombre,
          presidente_genero: response.data[0].presidente_genero,
          presidente_imagen: response.data[0].persona_imagen,
        };
        setClub(clubInfo);
        
        const teamsInfo = response.data.map(item => ({
          equipo_id: item.equipo_id,
          equipo_nombre: item.equipo_nombre,
          categoria_genero: item.categoria_genero,
          categoria_nombre: item.categoria_nombre,
        }));

        setTeams(teamsInfo);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo cargar la información del club',
      });
      console.error('Error al obtener el club y equipos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDelegados = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/club/delegados/${club.club_id}`);
      setDelegadosClub(response.data);
    } catch (err) {
      console.error("Error al obtener delegados:", err);
    }
  };

  const handleAssignPresident = () => {
    router.push('/presidente_club/');
  };

  const handleListJugador = () => {
    router.push(`/jugador/JugadorByClub/${id}`);
  };

  const handleCreateTeam = () => {
    setShowTeamsModal(true);
  };

  const handleCloseModal = () => {
    setShowTeamsModal(false);
  };

  const handleTeamClick = (equipoId) => {
    router.push(`/equipo/perfil/${equipoId}`);
  };

  const handleProfileClick = () => {
    setShowPerfilModal(true);
  };

  const handleEditTeam = (equipoId) => {
    setEquipoSeleccionado(equipoId);
    setShowEditModal(true);
  };
  
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEquipoSeleccionado(null);
    fetchClubAndTeams();
  };

  const getImagenPerfil = () => {
    if (club.presidente_imagen) {
      return { uri: club.presidente_imagen };
    }
    return club.presidente_genero === 'V' ? defaultUserMenIcon : defaultUserWomenIcon;
  };

  const getImagenClub = () => {
    if (club.club_imagen) {
      return { uri: club.club_imagen };
    }
    return Club_defecto;
  };

  const getGeneroTexto = (genero) => {
    if (genero === 'V') return 'Varones';
    if (genero === 'D') return 'Damas';
    if (genero === 'M') return 'Mixto';
    return 'Desconocido';
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#3D8FA4" />
      </View>
    );
  }

  if (!club) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar la información del club</Text>
      </View>
    );
  }

  const filteredTeams = selectedGenero 
    ? teams.filter(team => team.categoria_genero === selectedGenero)
    : teams;

  return (
    <ScrollView style={styles.container}>
      {/* Header del club */}
      <View style={styles.header}>
        <Image source={getImagenClub()} style={styles.clubImage} />
        <Text style={styles.clubName}>{club.nombre}</Text>
        <Text style={styles.clubDescription}>{club.descripcion}</Text>
      </View>

      {/* Información del presidente */}
      {club.presidente_asignado === 'N' ? (
        <TouchableOpacity style={styles.assignButton} onPress={handleAssignPresident}>
          <MaterialIcons name="assignment-ind" size={24} color="white" />
          <Text style={styles.buttonText}>Asignar Presidente</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.presidentContainer} onPress={handleProfileClick}>
          <Text style={styles.presidentText}>Presidente: {club.presidente_nombre}</Text>
        </TouchableOpacity>
      )}

      {/* Botones de acción */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleListJugador}>
          <MaterialIcons name="people" size={24} color="white" />
          <Text style={styles.buttonText}>Mis Jugadores</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleCreateTeam}>
          <MaterialCommunityIcons name="volleyball" size={24} color="white" />
          <Text style={styles.buttonText}>Crear Equipo</Text>
        </TouchableOpacity>
      </View>

      {/* Filtro por género */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtrar por género:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedGenero}
            onValueChange={(itemValue) => setSelectedGenero(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Todos" value={null} />
            <Picker.Item label="Varones" value="V" />
            <Picker.Item label="Damas" value="D" />
          </Picker>
        </View>
      </View>

      {/* Lista de equipos */}
      <View style={styles.teamsContainer}>
        {filteredTeams.length > 0 ? (
          filteredTeams.map((team) => (
            <TouchableOpacity 
              key={team.equipo_id} 
              style={styles.teamCard}
              onPress={() => handleTeamClick(team.equipo_id)}
            >
              <View style={styles.teamInfo}>
                <Text style={styles.teamName}>{team.equipo_nombre}</Text>
                <Text style={styles.teamDetail}>Categoría: {team.categoria_nombre}</Text>
                <Text style={styles.teamDetail}>Género: {getGeneroTexto(team.categoria_genero)}</Text>
              </View>
              
              {/* Botón de edición (condicional) */}
              {true && ( // Reemplaza con tu lógica de permisos
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => handleEditTeam(team.equipo_id)}
                >
                  <MaterialIcons name="edit" size={20} color="white" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noTeamsText}>No hay equipos disponibles para este club.</Text>
        )}
      </View>

      {/* Modal de perfil del presidente */}
      <PerfilPresidenteModal
        isOpen={showPerfilModal}
        onClose={() => setShowPerfilModal(false)}
        presidenteId={club.presidente_id}
      />

      {/* Modal de edición de equipo */}
      <EditarEquipoModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        equipoId={equipoSeleccionado}
        onEquipoUpdated={fetchClubAndTeams}
      />

      <RegistroEquipo
        isOpen={showTeamsModal}
        onClose={handleCloseModal}
        onTeamCreated={fetchClubAndTeams}
        clubId={club.club_id}
      />

      <Toast />
    </ScrollView>
  );
};

export default PerfilClub;