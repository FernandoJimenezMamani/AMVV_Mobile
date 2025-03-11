import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput, Switch } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import ConfirmModal from '../../components/confirm_modal';
import RegistrarPresidenteModal from './registrar';
import EditarPresidenteModal from './editar';
import styles from '../../styles/index_tabla';
import { Picker } from '@react-native-picker/picker';

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

  const handleProfileClick = (presidenteId) => {
    router.push(`/persona/perfil/${presidenteId}`);
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
        <Picker selectedValue={filterState} style={styles.filterPicker} onValueChange={(value) => setFilterState(value)}>
          <Picker.Item label="No filtrar" value="No filtrar" />
          <Picker.Item label="Activo" value="Activo" />
          <Picker.Item label="Inactivo" value="Inactivo" />
        </Picker>

        <TextInput style={styles.searchInput} placeholder="Buscar por nombre" value={searchPresidente} onChangeText={(text) => setSearchPresidente(text)} />
      </View>

      <FlatList
        data={filteredPresidentes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.clubContainer}>
            <Image source={{ uri: item.persona_imagen }} style={styles.clubImage} />
            <View style={styles.clubInfo}>
              <Text style={styles.clubName}>{item.nombre} {item.apellido}</Text>
              <Text style={styles.clubDescription}>C.I: {item.ci}</Text>
              <Text style={styles.clubDescription}>Correo: {item.correo}</Text>
              <Text style={styles.clubDescription}>{item.nombre_club ? item.nombre_club : 'Sin club asignado'}</Text>
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
                onValueChange={() => handleActivateUser(item.id)}
              />
            </View>
          </View>
        )}
      />

      {showRegistrarModal && (
        <RegistrarPresidenteModal isOpen={showRegistrarModal} onClose={handleCloseRegistrarModal} onPresidenteCreated={fetchPresidentes} />
      )}
      {showEditarModal && (
        <EditarPresidenteModal isOpen={showEditarModal} onClose={handleCloseEditarModal} presidenteId={selectedPresidenteId} onPresidenteUpdated={fetchPresidentes} />
      )}
    </View>
  );
};

export default ListaPresidenteClub;
