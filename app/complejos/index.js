import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Modal} from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import styles from '../../styles/index_tabla';
// Components
import ConfirmModal from '../../components/confirm_modal';
import RegistroComplejoModal from './registrar';
import EditarComplejoModal from './editar';
import MapaDetalleModal from '../../components/mapa_detalle';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const ListaLugar = () => {
  const [complejos, setComplejos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [complejoToDelete, setComplejoToDelete] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedComplejoId, setSelectedComplejoId] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    fetchComplejos();
  }, []);

  const fetchComplejos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/lugar/select`);
      setComplejos(response.data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error al cargar los complejos',
        text2: error.message,
        position: 'bottom'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComplejo = async () => {
    try {
      const user_id = 1;
      await axios.put(`${API_BASE_URL}/complejo/delete_complejo/${complejoToDelete}`, { user_id });
      setComplejos(complejos.filter(c => c.id !== complejoToDelete));
      Toast.show({
        type: 'success',
        text1: 'Complejo eliminado',
        position: 'bottom'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error al eliminar',
        text2: error.message,
        position: 'bottom'
      });
    } finally {
      setShowConfirm(false);
      setComplejoToDelete(null);
    }
  };

  const handleViewOnMap = (complejo) => {
    if (!complejo.latitud || !complejo.longitud) {
      Toast.show({
        type: 'error',
        text1: 'Ubicación no disponible',
        text2: 'Este complejo no tiene coordenadas geográficas',
        position: 'bottom'
      });
      return;
    }
    
    setSelectedLocation({
      latitude: parseFloat(complejo.latitud),
      longitude: parseFloat(complejo.longitud),
      title: complejo.nombre,
      description: complejo.direccion
    });
    setIsMapModalOpen(true);
  };

  const handleEditPress = (complejoId) => {
    setSelectedComplejoId(complejoId);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Complejos Deportivos</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowFormModal(true)}
        >
          <Text style={styles.addButtonText}>+ Nuevo Complejo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {complejos.length === 0 ? (
          <Text style={styles.emptyText}>No hay complejos registrados</Text>
        ) : (
          complejos.map(complejo => (
            <View key={complejo.id.toString()} style={styles.itemContainer}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{complejo.nombre}</Text>
                <Text style={styles.itemAddress}>{complejo.direccion}</Text>
              </View>
              
              <View style={styles.itemActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleViewOnMap(complejo)}
                >
                  <MaterialIcons name="map" size={24} color="#4285F4" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleEditPress(complejo.id)}
                >
                  <MaterialIcons name="edit" size={24} color="#FBBC05" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    setComplejoToDelete(complejo.id);
                    setShowConfirm(true);
                  }}
                >
                  <MaterialIcons name="delete" size={24} color="#EA4335" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modals */}
      <RegistroComplejoModal
        visible={showFormModal}
        onClose={() => {
          setShowFormModal(false);
        }}
        onComplejoAdded={fetchComplejos}
      />

    <EditarComplejoModal
      isOpen={showEditModal} 
      complejoId={selectedComplejoId}
      onClose={() => {
        setShowEditModal(false);
        setSelectedComplejoId(null);
      }}
      onComplejoUpdated={fetchComplejos}
    />

      <MapaDetalleModal
        visible={isMapModalOpen}
        location={selectedLocation}
        onClose={() => setIsMapModalOpen(false)}
      />

      <ConfirmModal
        visible={showConfirm}
        message="¿Seguro que quieres eliminar este complejo?"
        onConfirm={handleDeleteComplejo}
        onCancel={() => {
          setShowConfirm(false);
          setComplejoToDelete(null);
        }}
      />
      
      <Toast />
    </View>
  );
};

export default ListaLugar;