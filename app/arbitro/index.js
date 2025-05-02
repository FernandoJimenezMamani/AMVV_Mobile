import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  TextInput,
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import ConfirmModal from '../../components/confirm_modal';
import RegistrarArbitroModal from './registrar'; // Modal para registrar
import EditarArbitroModal from './editar'; // Modal para editar
import styles from '../../styles/index_tabla';
import defaultUserMenIcon from '../../assets/img/Default_Imagen_Men.webp'
import defaultUserWomenIcon from '../../assets/img/Default_Imagen_Women.webp'
import Icon from 'react-native-vector-icons/MaterialIcons';
import PerfilArbitroModal from './perfil/[id]';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const ListaArbitro = () => {
  const [arbitros, setArbitros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [arbitroToDelete, setArbitroToDelete] = useState(null);
  const [showRegistrarModal, setShowRegistrarModal] = useState(false); // Controla la visibilidad del modal de registro
  const [showEditarModal, setShowEditarModal] = useState(false); // Controla la visibilidad del modal de edición
  const [selectedArbitroId, setSelectedArbitroId] = useState(null); // ID del árbitro seleccionado
  const router = useRouter();
  const [visibleArbitros, setVisibleArbitros] = useState(5);
  const flatListRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredArbitros, setFilteredArbitros] = useState([]);
  const [perfilArtbitroVisible, setPerfilArbitroVisible] = useState(false);
  const [arbitroIdPerfil, setArbitroIdPerfil] = useState(null);
  useEffect(() => {
    fetchArbitros();
  }, []);

  const fetchArbitros = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/arbitro/get_arbitros`);
      setArbitros(res.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la lista de árbitros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applySearchFilter();
  }, [searchTerm, arbitros]);
  
  const applySearchFilter = () => {
    const filtered = arbitros.filter((a) =>
      `${a.nombre} ${a.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredArbitros(filtered);
  };
  
  const handleEditClick = (arbitroId) => {
    setSelectedArbitroId(arbitroId); // Establece el ID del árbitro a editar
    setShowEditarModal(true); // Abre el modal de edición
  };

  const handleRegistrarClick = () => {
    setShowRegistrarModal(true); // Abre el modal de registro
  };

  const handleCloseRegistrarModal = () => {
    setShowRegistrarModal(false); // Cierra el modal de registro
  };

  const handleCloseEditarModal = () => {
    setShowEditarModal(false); // Cierra el modal de edición
    setSelectedArbitroId(null); // Limpia el ID del árbitro seleccionado
  };

  const handleDeleteClick = (id) => {
    setArbitroToDelete(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const user_id = 1; // Cambiar esto si necesitas un valor dinámico
      await axios.put(`${API_BASE_URL}/persona/delete_persona/${arbitroToDelete}`, { user_id });
      fetchArbitros();
      setShowConfirm(false);
      setArbitroToDelete(null);
    } catch (error) {
      console.error('Error al eliminar el árbitro:', error);
    }
  };

  const handleActivateUser = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/persona/activatePersona/${id}`);
      fetchArbitros();
    } catch (error) {
      console.error('Error al activar el árbitro:', error);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setArbitroToDelete(null);
  };

  const handleProfileClick = (jugadorId) => {
    setArbitroIdPerfil(jugadorId);
    setPerfilArbitroVisible(true);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />;
  }

  const getImagenPerfil = (arbitro) => {
    if (arbitro.persona_imagen) {
      return { uri: arbitro.persona_imagen }; 
    }
    return arbitro.genero_persona === 'V'
      ? defaultUserMenIcon
      : defaultUserWomenIcon;
  };
  
  const handleLoadMore = () => {
    setVisibleArbitros((prev) => prev + 5);
  };
  
  const scrollToTop = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Árbitros</Text>

      {/* Botón para registrar árbitro */}
      <TouchableOpacity style={styles.addButton} onPress={handleRegistrarClick}>
        <Text style={styles.addButtonText}>+1 Árbitro</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      <FlatList
        ref={flatListRef}
        data={filteredArbitros.slice(0, visibleArbitros)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.clubContainer}>
            <Image
              source={getImagenPerfil(item)}
              style={styles.clubImage}
            />
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
            {visibleArbitros < arbitros.length && (
              <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
                <Text style={styles.loadMoreText}>Cargar más</Text>
              </TouchableOpacity>
            )}
            {visibleArbitros > 5 && (
              <TouchableOpacity style={styles.goToTopButton} onPress={scrollToTop}>
                <Icon style={styles.goToTopText} name={'keyboard-arrow-up'}/>
              </TouchableOpacity>
            )}
          </>
        }
      />

      {/* Modal de registro */}
      <RegistrarArbitroModal
        isOpen={showRegistrarModal}
        onClose={handleCloseRegistrarModal}
        onArbitroCreated={fetchArbitros} // Recargar la lista después de registrar
      />

      {/* Modal de edición */}
      <EditarArbitroModal
        isOpen={showEditarModal}
        onClose={handleCloseEditarModal}
        personaId={selectedArbitroId} // Pasar el ID del árbitro a editar
        onPersonaUpdated={fetchArbitros} // Recargar la lista después de editar
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        visible={showConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        message="¿Seguro que quieres eliminar este árbitro?"
      />

      <PerfilArbitroModal
        isOpen={perfilArtbitroVisible}
        onClose={() => setPerfilArbitroVisible(false)}
        id={arbitroIdPerfil}
      />
    </View>
  );
};

export default ListaArbitro;