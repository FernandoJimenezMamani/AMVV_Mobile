import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity,Switch, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import ConfirmModal from '../../components/confirm_modal';
import CrearClubModal from './crear';
import EditarClubModal from './editar';
import styles from "../../styles/index_tabla";
import { useSession } from '../../context/SessionProvider';
import rolMapping from '../../constants/roles';
import { Picker } from '@react-native-picker/picker';
import Club_defecto from '../../assets/img/Club_defecto.png';
import Toast from 'react-native-toast-message';
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
  const [filterState, setFilterState] = useState('No filtrar');
  const [filteredClubes, setFilteredClubes] = useState([]);
  
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

  useEffect(() => {
    applyFilters();
  }, [clubes, filterState]);

  const applyFilters = () => {
    let filtered = [...clubes];
  
    if (filterState !== 'No filtrar') {
      filtered = filtered.filter((club) =>
        filterState === 'Activo' ? club.eliminado === 'N' : club.eliminado === 'S'
      );
    }
  
    setFilteredClubes(filtered);
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
      fetchClubes();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error al eliminar el club',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivateClub = async (id) => {
    try {
      const user_id = 1; 
      await axios.put(`${API_BASE_URL}/club/activate_club/${id}`, { user_id });
      Toast.show({
        type: 'success',
        text1: 'Club activado exitosamente',
        position: 'bottom',
      });      
      fetchClubes();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error al activar el club',
        position: 'bottom',
      });
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setClubToDelete(null);
  };

  const handleProfileClick = (clubId) => {
    router.push(`/club/perfil/${clubId}`);
  };

  const getImagenClub = (imagen) => imagen ? { uri: imagen } : Club_defecto;
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
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={filterState}
          onValueChange={(value) => setFilterState(value)}
          style={styles.picker}
        >
          <Picker.Item label="No filtrar" value="No filtrar" />
          <Picker.Item label="Activo" value="Activo" />
          <Picker.Item label="Inactivo" value="Inactivo" />
        </Picker>
      </View>

      {clubes.length === 0 && !loading ? (
        <Text style={styles.emptyText}>No hay clubes registrados</Text>
      ) : (
        filteredClubes.map((club) => (
          <View key={`club-${club.id}-${club.nombre}`} style={styles.clubContainer}>
            <Image 
              source={getImagenClub(club.club_imagen)} 
              style={styles.clubImage} 
              defaultSource={require('../../assets/img/Default_Imagen_Club.webp')}
              onError={() => console.log('Error cargando imagen del club')}
            />
            <View style={styles.clubInfo}>
              <Text style={styles.clubName} numberOfLines={1}>{club.nombre}</Text>
              
            </View>
            <View style={styles.actions}>
              <TouchableOpacity 
                onPress={() => handleProfileClick(club.id)}
                disabled={loading}
              >
                <MaterialIcons name="remove-red-eye" size={24} color="#579FA6" />
              </TouchableOpacity>
              
              {hasRole(rolMapping.PresidenteAsociacion) && (
                <>
                  <TouchableOpacity 
                    onPress={() => handleEditClick(club.id)}
                    disabled={loading}
                  >
                    <MaterialIcons name="edit" size={24} color="#9DAC42" />
                  </TouchableOpacity>
                  <Switch
                    value={club.eliminado !== 'S'}
                    onValueChange={() =>
                      club.eliminado === 'S'
                        ? handleActivateClub(club.id)
                        : handleDeleteClick(club.id)
                    }
                  />
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

      <EditarClubModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        clubId={selectedClubId} // Pasar el ID del delegado a editar
        onClubUpdated={fetchClubes} // Recargar la lista después de editar
      />
      
    </ScrollView>
  );
};

export default ListaClubes;