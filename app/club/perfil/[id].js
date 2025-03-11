import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../../../styles/club/perfil';
import RegistroEquipo from '../../equipo/registrar/[id]';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const PerfilClub = () => {
  const { id } = useLocalSearchParams();
  const [club, setClub] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchClubAndTeams();
  }, [id]);

  const fetchClubAndTeams = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/club/get_club_teams/${id}`);
      if (response.data.length > 0) {
        const clubInfo = {
          club_id: response.data[0].club_id,
          nombre: response.data[0].club_nombre,
          descripcion: response.data[0].club_descripcion,
          club_imagen: response.data[0].club_imagen,
          presidente_asignado: response.data[0].presidente_asignado,
          presidente_nombre: response.data[0].presidente_nombre,
          presidente_imagen: response.data[0].persona_imagen,
        };
        setClub(clubInfo);
        
        const teamsInfo = response.data.map(item => ({
          equipo_id: item.equipo_id,
          equipo_nombre: item.equipo_nombre,
          categoria_nombre: item.categoria_nombre,
        }));
        setTeams(teamsInfo);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la información del club');
      console.error('Error al obtener el club y equipos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = () => {
    setShowTeamsModal(true); // Abrir el modal
  };

  const handleCloseModal = () => {
    setShowTeamsModal(false); // Cerrar el modal
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: club.club_imagen }} style={styles.clubImage} />
        <Text style={styles.clubName}>{club.nombre}</Text>
        <Text style={styles.clubDescription}>{club.descripcion}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => router.push(`/jugador/JugadorByClub/${id}`)}>
          <Text style={styles.buttonText}>Mis Jugadores</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleCreateTeam}>
          <Text style={styles.buttonText}>Agregar Equipo</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.teamsContainer}>
        {teams.length > 0 ? (
          teams.map((team) => (
            <TouchableOpacity key={team.equipo_id} style={styles.teamCard}>
              <Text style={styles.teamName}>{team.equipo_nombre}</Text>
              <Text style={styles.teamCategory}>Categoría: {team.categoria_nombre}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noTeamsText}>No hay equipos disponibles.</Text>
        )}
      </View>
      <RegistroEquipo
        isOpen={showTeamsModal}
        onClose={handleCloseModal}
        onTeamCreated={fetchClubAndTeams}
        clubId={club.club_id}
      />
    </ScrollView>
  );
};

export default PerfilClub;
