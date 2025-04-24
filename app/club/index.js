import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import ConfirmModal from '../../components/confirm_modal';
import CrearClubModal from './crear';
//import EditarClubModal from './editar';
import styles from "../../styles/index_tabla";
import { useSession } from '../../context/SessionProvider';
import rolMapping from '../../constants/roles';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const ListaClubes = () => {
  const [clubes, setClubes] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [clubToDelete, setClubToDelete] = useState(null);
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user } = useSession();

  useEffect(() => {
    fetchClubes();
  }, []);

  const fetchClubes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/club/get_club`);
      setClubes(response.data);
      setError(null);
    } catch (error) {
      console.error('Error al obtener los clubes:', error);
      setError('No se pudieron cargar los clubes');
      Alert.alert('Error', 'No se pudieron cargar los clubes');
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (...roles) => {
    return user && user.rol && roles.includes(user.rol.nombre);
  };

  const handleEditClick = (clubId) => {
    setSelectedClubId(clubId);
    setShowEditModal(true);
  };

  const handleRegistrarClick = () => {
    setSelectedClubId(null);
    setShowCrearModal(true);
  };

  const handleCloseCrearModal = () => {
    setShowCrearModal(false);
    setSelectedClubId(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedClubId(null);
  };

  const handleDeleteClick = (clubId) => {
    setClubToDelete(clubId);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      const user_id = 1; // Esto debería venir del contexto de usuario
      await axios.put(`${API_BASE_URL}/club/delete_club/${clubToDelete}`, { user_id });
      setClubes(prev => prev.filter(club => club.id !== clubToDelete));
      setShowConfirm(false);
      setClubToDelete(null);
    } catch (error) {
      console.error('Error al eliminar el club:', error);
      Alert.alert('Error', 'No se pudo eliminar el club');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setClubToDelete(null);
  };

  const handleProfileClick = (clubId) => {
    router.push(`/club/perfil/${clubId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchClubes}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Lista de Clubes</Text>
      
      {hasRole(rolMapping.PresidenteAsociacion) && (
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleRegistrarClick}
          disabled={loading}
        >
          <Text style={styles.addButtonText}>+1 club</Text>
        </TouchableOpacity>
      )}

      {clubes.length === 0 && !loading ? (
        <Text style={styles.emptyText}>No hay clubes registrados</Text>
      ) : (
        clubes.map((club) => (
          <View key={`club-${club.id}-${club.nombre}`} style={styles.clubContainer}>
            <Image 
              source={{ uri: club.club_imagen }} 
              style={styles.clubImage} 
              defaultSource={require('../../assets/img/Default_Imagen_Club.webp')}
              onError={() => console.log('Error cargando imagen del club')}
            />
            <View style={styles.clubInfo}>
              <Text style={styles.clubName} numberOfLines={1}>{club.nombre}</Text>
              <Text style={styles.clubDescription} numberOfLines={2}>{club.descripcion}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity 
                onPress={() => handleProfileClick(club.id)}
                disabled={loading}
              >
                <MaterialIcons name="remove-red-eye" size={24} color="#4CAF50" />
              </TouchableOpacity>
              
              {hasRole(rolMapping.PresidenteAsociacion) && (
                <>
                  <TouchableOpacity 
                    onPress={() => handleEditClick(club.id)}
                    disabled={loading}
                  >
                    <MaterialIcons name="edit" size={24} color="#FFC107" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleDeleteClick(club.id)}
                    disabled={loading}
                  >
                    <MaterialCommunityIcons name="delete-forever" size={24} color="#F44336" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        ))
      )}

      <ConfirmModal
        visible={showConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        message="¿Seguro que quieres eliminar este club?"
      />

      <CrearClubModal
        isOpen={showCrearModal}
        onClose={handleCloseCrearModal}
        onClubCreated={fetchClubes}
      />

      
    </ScrollView>
  );
};

export default ListaClubes;