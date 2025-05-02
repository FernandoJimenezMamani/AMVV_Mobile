import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput, Switch } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import ConfirmModal from '../../components/confirm_modal';
import RegistrarPresidenteModal from './registrar';
import EditarPresidenteModal from './editar';
import styles from '../../styles/index_tabla';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import defaultUserMenIcon from '../../assets/img/Default_Imagen_Men.webp'
import defaultUserWomenIcon from '../../assets/img/Default_Imagen_Women.webp'
import PerfilPresidenteModal from './perfil/[id]';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const ListaPresidenteClub = () => {
  const [presidentes, setPresidentes] = useState([]);
  const [filteredPresidentes, setFilteredPresidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegistrarModal, setShowRegistrarModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [selectedPresidenteId, setSelectedPresidenteId] = useState(null);
  const [filterState, setFilterState] = useState('No filtrar');
  const [searchPresidente, setSearchPresidente] = useState('');
  const router = useRouter();
  const [visiblePresidentes, setVisiblePresidentes] = useState(5);
  const flatListRef = useRef(null);
  const [perfilPresidenteVisible, setPerfilPresidenteVisible] = useState(false);
  const [presidenteIdPerfil, setPresidenteIdPerfil] = useState(null);
  useEffect(() => {
    fetchPresidentes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterState, searchPresidente, presidentes]);

  const fetchPresidentes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/presidente_club/get_presidente_club`);
      setPresidentes(res.data);
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la lista de presidentes');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...presidentes];

    if (filterState !== 'No filtrar') {
      filtered = filtered.filter((p) =>
        filterState === 'Activo' ? p.eliminado === 'N' : p.eliminado === 'S'
      );
    }

    if (searchPresidente) {
      filtered = filtered.filter((p) =>
        `${p.nombre} ${p.apellido}`.toLowerCase().includes(searchPresidente.toLowerCase())
      );
    }

    setFilteredPresidentes(filtered);
  };

  const handleRegistrarClick = () => {
    setShowRegistrarModal(true);
  };

  const handleEditClick = (presidenteId) => {
    setSelectedPresidenteId(presidenteId);
    setShowEditarModal(true);
  };

  const handleCloseRegistrarModal = () => {
    setShowRegistrarModal(false);
  };

  const handleCloseEditarModal = () => {
    setShowEditarModal(false);
    setSelectedPresidenteId(null);
  };

  const handleActivateUser = async (presidenteId) => {
    try {
      await axios.put(`${API_BASE_URL}/persona/activatePersona/${presidenteId}`);
      fetchPresidentes();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado del presidente');
      console.error('Error al actualizar el estado:', error);
    }
  };

  const handleProfileClick = (jugadorId) => {
    setPresidenteIdPerfil(jugadorId);
    setPerfilPresidenteVisible(true);
  };

  const handleLoadMore = () => {
    setVisiblePresidentes((prev) => prev + 5);
  };
  
  const scrollToTop = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };

  const getImagenPerfil = (arbitro) => {
      if (arbitro.persona_imagen) {
        return { uri: arbitro.persona_imagen }; 
      }
      return arbitro.genero === 'V'
        ? defaultUserMenIcon
        : defaultUserWomenIcon;
    };

  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Presidentes de Clubes</Text>

      <TouchableOpacity style={styles.addButton} onPress={handleRegistrarClick}>
        <Text style={styles.addButtonText}>+1 Presidente</Text>
      </TouchableOpacity>

      <View style={styles.filtersContainer}>
        <TextInput style={styles.searchInput} placeholder="Buscar por nombre" value={searchPresidente} onChangeText={(text) => setSearchPresidente(text)} />
      </View>

      <FlatList
        ref={flatListRef}
        data={filteredPresidentes.slice(0, visiblePresidentes)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.clubContainer}>
            <Image source={getImagenPerfil(item)} style={styles.clubImage} />
            <View style={styles.clubInfo}>
              <Text style={styles.clubName}>{item.nombre} {item.apellido}</Text>
              <Text style={styles.clubDescription}>C.I: {item.ci}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleProfileClick(item.id)}>
                <MaterialIcons name="remove-red-eye" size={24} color="#579FA6" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleEditClick(item.id)}>
                <MaterialIcons name="edit" size={24} color="#9DAC42" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={
          <>
            {visiblePresidentes < filteredPresidentes.length && (
              <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
                <Text style={styles.loadMoreText}>Cargar más</Text>
              </TouchableOpacity>
            )}
            {visiblePresidentes > 5 && (
              <TouchableOpacity style={styles.goToTopButton} onPress={scrollToTop}>
                <Icon style={styles.goToTopText} name={'keyboard-arrow-up'}/>
              </TouchableOpacity>
            )}
          </>
        }
      />

      {showRegistrarModal && (
        <RegistrarPresidenteModal isOpen={showRegistrarModal} onClose={handleCloseRegistrarModal} onPresidenteCreated={fetchPresidentes} />
      )}
      {showEditarModal && (
        <EditarPresidenteModal isOpen={showEditarModal} onClose={handleCloseEditarModal} presidenteId={selectedPresidenteId} onPresidenteUpdated={fetchPresidentes} />
      )}
      <PerfilPresidenteModal
        isOpen={perfilPresidenteVisible}
        onClose={() => setPerfilPresidenteVisible(false)}
        presidenteId={presidenteIdPerfil}
      />
    </View>
    
  );
};

export default ListaPresidenteClub;
