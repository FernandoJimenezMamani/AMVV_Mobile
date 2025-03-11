import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import ConfirmModal from '../../components/confirm_modal';
import RegistrarArbitroModal from './registrar'; // Modal para registrar
import EditarArbitroModal from './editar'; // Modal para editar
import styles from '../../styles/index_tabla';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const DEFAULT_USER_IMAGE = 'https://via.placeholder.com/150'; // Imagen por defecto

const ListaArbitro = () => {
  const [arbitros, setArbitros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [arbitroToDelete, setArbitroToDelete] = useState(null);
  const [showRegistrarModal, setShowRegistrarModal] = useState(false); // Controla la visibilidad del modal de registro
  const [showEditarModal, setShowEditarModal] = useState(false); // Controla la visibilidad del modal de edición
  const [selectedArbitroId, setSelectedArbitroId] = useState(null); // ID del árbitro seleccionado
  const router = useRouter();

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

  const handleProfileClick = (id) => {
    router.push(`/arbitros/perfil/${id}`);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Árbitros</Text>

      {/* Botón para registrar árbitro */}
      <TouchableOpacity style={styles.addButton} onPress={handleRegistrarClick}>
        <Text style={styles.addButtonText}>+1 Árbitro</Text>
      </TouchableOpacity>

      <FlatList
        data={arbitros}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.clubContainer}>
            <Image
              source={{ uri: item.persona_imagen || DEFAULT_USER_IMAGE }}
              style={styles.clubImage}
            />
            <View style={styles.clubInfo}>
              <Text style={styles.clubName}>{item.nombre} {item.apellido}</Text>
              <Text style={styles.clubDescription}>C.I: {item.ci}</Text>
              <Text style={styles.clubDescription}>Correo: {item.correo}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleEditClick(item.id)}>
                <MaterialIcons name="edit" size={24} color="#FFC107" />
              </TouchableOpacity>
              <Switch
                value={item.eliminado !== 'S'}
                onValueChange={() =>
                  item.eliminado === 'S' ? handleActivateUser(item.id) : handleDeleteClick(item.id)
                }
              />
            </View>
          </View>
        )}
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
        arbitroId={selectedArbitroId} // Pasar el ID del árbitro a editar
        onArbitroUpdated={fetchArbitros} // Recargar la lista después de editar
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        visible={showConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        message="¿Seguro que quieres eliminar este árbitro?"
      />
    </View>
  );
};

export default ListaArbitro;