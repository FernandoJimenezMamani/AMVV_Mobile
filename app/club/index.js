import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import ConfirmModal from '../../components/confirm_modal';
import CrearClubModal from './crear';
import styles from "../../styles/index_tabla";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const ListaClubes = () => {
  const [clubes, setClubes] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [clubToDelete, setClubToDelete] = useState(null);
  const [showCrearModal, setShowCrearModal] = useState(false); // Estado para el modal unificado
  const [selectedClubId, setSelectedClubId] = useState(null); // ID del club seleccionado para editar
  const router = useRouter();

  useEffect(() => {
    fetchClubes();
  }, []);

  const fetchClubes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/club/get_club`);
      setClubes(response.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los clubes');
      console.error('Error al obtener los clubes:', error);
    }
  };

  const handleEditClick = (clubId) => {
    setSelectedClubId(clubId); // Establece el ID del club a editar
    setShowCrearModal(true); // Abre el modal en modo edición
  };

  const handleRegistrarClick = () => {
    setSelectedClubId(null); // No hay ID, modo creación
    setShowCrearModal(true); // Abre el modal en modo creación
  };

  const handleCloseCrearModal = () => {
    setShowCrearModal(false); // Cierra el modal
    setSelectedClubId(null); // Limpia el ID del club seleccionado
  };

  const handleDeleteClick = (clubId) => {
    setClubToDelete(clubId);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const user_id = 1; // Cambia esto según tu lógica de autenticación
      await axios.put(`${API_BASE_URL}/club/delete_club/${clubToDelete}`, { user_id });
      setClubes(clubes.filter(club => club.id !== clubToDelete));
      setShowConfirm(false);
      setClubToDelete(null);
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el club');
      console.error('Error al eliminar el club:', error);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setClubToDelete(null);
  };

  const handleProfileClick = (clubId) => {
    router.push(`/club/perfil/${clubId}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Lista de Clubes</Text>
      <TouchableOpacity style={styles.addButton} onPress={handleRegistrarClick}>
        <Text style={styles.addButtonText}>+1 club</Text>
      </TouchableOpacity>

      {clubes.map((club) => (
        <View key={club.id} style={styles.clubContainer}>
          <Image source={{ uri: club.club_imagen }} style={styles.clubImage} />
          <View style={styles.clubInfo}>
            <Text style={styles.clubName}>{club.nombre}</Text>
            <Text style={styles.clubDescription}>{club.descripcion}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => handleProfileClick(club.id)}>
              <MaterialIcons name="remove-red-eye" size={24} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleEditClick(club.id)}>
              <MaterialIcons name="edit" size={24} color="#FFC107" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteClick(club.id)}>
              <MaterialCommunityIcons name="delete-forever" size={24} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        visible={showConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        message="¿Seguro que quieres eliminar este club?"
      />

      {/* Modal unificado para crear/editar clubes */}
      <CrearClubModal
        isOpen={showCrearModal}
        onClose={handleCloseCrearModal}
        clubId={selectedClubId} // Pasa el ID del club si estamos en modo edición
        onClubCreated={fetchClubes} // Recarga la lista después de crear un club
        onClubUpdated={fetchClubes} // Recarga la lista después de editar un club
      />
    </ScrollView>
  );
};

export default ListaClubes;