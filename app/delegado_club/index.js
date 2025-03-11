import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Switch,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ConfirmModal from '../../components/confirm_modal';
import RegistrarDelegadoModal from './registrar'; // Modal para registrar
import EditarDelegadoModal from './editar'; // Modal para editar
import { Picker } from '@react-native-picker/picker';
import styles from '../../styles/index_tabla'; // Importar estilos desde aquí
import { MaterialIcons } from '@expo/vector-icons';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const ListaDelegadoClub = () => {
  const [presidentes, setPresidentes] = useState([]);
  const [filteredPresidentes, setFilteredPresidentes] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [presidenteToDelete, setPersonaToDelete] = useState(null);
  const [showRegistrarModal, setShowRegistrarModal] = useState(false); // Controla la visibilidad del modal de registro
  const [showEditarModal, setShowEditarModal] = useState(false); // Controla la visibilidad del modal de edición
  const [selectedPresidenteId, setSelectedPresidenteId] = useState(null); // ID del delegado seleccionado
  const [filterState, setFilterState] = useState('No filtrar');
  const [searchPresidente, setSearchPresidente] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPresidentes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterState, searchPresidente, presidentes]);

  const fetchPresidentes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/presidente_club/get_delegado_club`);
      setPresidentes(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener las personas:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...presidentes];

    // Filtrar por estado
    if (filterState !== 'No filtrar') {
      filtered = filtered.filter((p) =>
        filterState === 'Activo' ? p.eliminado === 'N' : p.eliminado === 'S'
      );
    }

    // Filtrar por nombre
    if (searchPresidente) {
      filtered = filtered.filter((p) =>
        `${p.nombre} ${p.apellido}`
          .toLowerCase()
          .includes(searchPresidente.toLowerCase())
      );
    }

    setFilteredPresidentes(filtered);
  };

  const handleEditClick = (personaId) => {
    setSelectedPresidenteId(personaId); // Establece el ID del delegado a editar
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
    setSelectedPresidenteId(null); // Limpia el ID del delegado seleccionado
  };

  const handleDeleteClick = (id) => {
    setPersonaToDelete(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const user_id = 1; // Cambiar esto si necesitas un valor dinámico
      await axios.put(`${API_BASE_URL}/persona/delete_persona/${presidenteToDelete}`, { user_id });
      fetchPresidentes();
      setShowConfirm(false);
      setPersonaToDelete(null);
    } catch (error) {
      console.error('Error al eliminar la persona:', error);
    }
  };

  const handleActivateUser = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/persona/activatePersona/${id}`);
      fetchPresidentes();
    } catch (error) {
      console.error('Error al activar usuario:', error);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setPersonaToDelete(null);
  };

  const handleProfileClick = (id) => {
    // Navegar a la pantalla de perfil del delegado
    // navigation.navigate('Perfil', { id });
  };

  const renderItem = ({ item }) => (
    <View style={styles.clubContainer}>
      <Image
        source={{ uri: item.persona_imagen }}
        style={styles.clubImage}
      />
      <View style={styles.clubInfo}>
        <Text style={styles.clubName}>{item.nombre} {item.apellido}</Text>
        <Text style={styles.clubDescription}>Fecha de Nacimiento: {new Date(item.fecha_nacimiento).toLocaleDateString()}</Text>
        <Text style={styles.clubDescription}>C.I: {item.ci}</Text>
        <Text style={styles.clubDescription}>Correo: {item.correo}</Text>
        <Text style={styles.clubDescription}>Club: {item.nombre_club}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleProfileClick(item.id)}>
          <MaterialIcons name="remove-red-eye" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEditClick(item.id)}>
          <MaterialIcons name="edit" size={24} color="#FFC107" />
        </TouchableOpacity>
        <Switch
          value={item.eliminado !== 'S'}
          onValueChange={() => handleActivateUser(item.id, item.eliminado)}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Delegados de Clubes</Text>
      <View style={styles.filtersContainer}>
        <TouchableOpacity style={styles.addButton} onPress={handleRegistrarClick}>
          <Text style={styles.addButtonText}>+1 Delegado</Text>
        </TouchableOpacity>
        <Picker
          selectedValue={filterState}
          style={styles.picker}
          onValueChange={(value) => setFilterState(value)}
        >
          <Picker.Item label="No filtrar" value="No filtrar" />
          <Picker.Item label="Activo" value="Activo" />
          <Picker.Item label="Inactivo" value="Inactivo" />
        </Picker>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre"
          value={searchPresidente}
          onChangeText={(text) => setSearchPresidente(text)}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredPresidentes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}

      {/* Modal de registro */}
      <RegistrarDelegadoModal
        isOpen={showRegistrarModal}
        onClose={handleCloseRegistrarModal}
        onDelegadoCreated={fetchPresidentes} // Recargar la lista después de registrar
      />

      {/* Modal de edición */}
      <EditarDelegadoModal
        isOpen={showEditarModal}
        onClose={handleCloseEditarModal}
        delegadoId={selectedPresidenteId} // Pasar el ID del delegado a editar
        onDelegadoUpdated={fetchPresidentes} // Recargar la lista después de editar
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        visible={showConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        message="¿Seguro que quieres eliminar esta persona?"
      />
    </View>
  );
};

export default ListaDelegadoClub;