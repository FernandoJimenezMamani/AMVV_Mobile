import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import ConfirmModal from '../../components/confirm_modal';
import CrearCategoriaModal from './crear'; // Importa el modal unificado
import styles from '../../styles/index_tabla';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const ListaCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState(null);
  const [showCrearModal, setShowCrearModal] = useState(false); // Estado para el modal unificado
  const [selectedCategoriaId, setSelectedCategoriaId] = useState(null); // ID de la categoría seleccionada para editar

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categoria/get_categoria`);
      setCategorias(response.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las categorías');
      console.error('Error al obtener las categorías:', error);
    }
  };

  const handleEditClick = (categoriaId) => {
    setSelectedCategoriaId(categoriaId); // Establece el ID de la categoría a editar
    setShowCrearModal(true); // Abre el modal en modo edición
  };

  const handleRegistrarClick = () => {
    setSelectedCategoriaId(null); // No hay ID, modo creación
    setShowCrearModal(true); // Abre el modal en modo creación
  };

  const handleCloseCrearModal = () => {
    setShowCrearModal(false); // Cierra el modal
    setSelectedCategoriaId(null); // Limpia el ID de la categoría seleccionada
  };

  const handleDeleteClick = (categoriaId) => {
    setCategoriaToDelete(categoriaId);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const user_id = 1; // Cambia esto según tu lógica de autenticación
      await axios.put(`${API_BASE_URL}/categoria/delete_categoria/${categoriaToDelete}`, { user_id });
      setCategorias(categorias.filter(categoria => categoria.id !== categoriaToDelete));
      setShowConfirm(false);
      setCategoriaToDelete(null);
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar la categoría');
      console.error('Error al eliminar la categoría:', error);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setCategoriaToDelete(null);
  };

  const renderItem = ({ item }) => (
    <View style={styles.clubContainer}>
      <View style={styles.clubInfo}>
        <Text style={styles.clubName}>{item.nombre}</Text>
        <Text style={styles.clubDescription}>
          {item.genero === 'V' ? 'Varones' :
           item.genero === 'D' ? 'Damas' :
           item.genero === 'M' ? 'Mixto' : 'No especificado'}
        </Text>
        <Text style={styles.clubDescription}>
          {item.division === 'MY' ? 'Mayores' :
           item.division === 'MN' ? 'Menores' : 'No especificado'}
        </Text>
        <Text style={styles.clubDescription}>
          Edad Mínima: {item.edad_minima !== null && item.edad_minima !== undefined && item.edad_minima !== 0
            ? item.edad_minima 
            : 'No especificado'}
        </Text>
        <Text style={styles.clubDescription}>
          Edad Máxima: {item.edad_maxima !== null && item.edad_maxima !== undefined && item.edad_minima !== 0
            ? item.edad_maxima 
            : 'No especificado'}
        </Text>
        <Text style={styles.clubDescription}>
          Costo de Traspaso: {item.costo_traspaso !== null && item.costo_traspaso !== undefined 
            ? item.costo_traspaso 
            : 'No especificado'}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleEditClick(item.id)}>
          <MaterialIcons name="edit" size={24} color="#FFC107" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteClick(item.id)}>
          <MaterialIcons name="delete-forever" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Categorías</Text>
      <TouchableOpacity style={styles.addButton} onPress={handleRegistrarClick}>
        <Text style={styles.addButtonText}>+1 Categoría</Text>
      </TouchableOpacity>

      <FlatList
        data={categorias}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        visible={showConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        message="¿Seguro que quieres eliminar esta categoría?"
      />

      {/* Modal unificado para crear/editar categorías */}
      <CrearCategoriaModal
        isOpen={showCrearModal}
        onClose={handleCloseCrearModal}
        categoriaId={selectedCategoriaId} // Pasa el ID de la categoría si estamos en modo edición
        onCategoriaCreated={fetchCategorias} // Recarga la lista después de crear una categoría
        onCategoriaUpdated={fetchCategorias} // Recarga la lista después de editar una categoría
      />
    </View>
  );
};

export default ListaCategorias;